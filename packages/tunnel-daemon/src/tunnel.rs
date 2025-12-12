use hyper::server::conn::AddrStream;
use hyper::service::{make_service_fn, service_fn};
use hyper::{Body, Request, Response, Server, StatusCode, header, Client};
use std::convert::Infallible;
use std::net::SocketAddr;
use std::sync::Arc;
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::Instant;
use tokio::net::TcpListener;
use tokio_rustls::TlsAcceptor;
use rustls::ServerConfig;
use tracing::{info, error, debug, warn};

use crate::dns::DualDNSResolver;
use crate::context::{ContextDetector, AccessContext};
use crate::cert;

/// Request statistics for monitoring
#[derive(Default)]
pub struct RequestStats {
    pub total_requests: AtomicU64,
    pub successful_requests: AtomicU64,
    pub failed_requests: AtomicU64,
    pub total_bytes_in: AtomicU64,
    pub total_bytes_out: AtomicU64,
}

pub struct TunnelDaemon {
    listen_port: u16,
    target_port: u16,
    domain: String,
    https_port: Option<u16>,
    dns_resolver: Option<DualDNSResolver>,
    context_detector: ContextDetector,
    tls_config: Option<Arc<ServerConfig>>,
    stats: Arc<RequestStats>,
    start_time: Instant,
}

impl TunnelDaemon {
    pub async fn new(listen_port: u16, target_port: u16, domain: String) -> Result<Self, Box<dyn std::error::Error>> {
        info!("Tunnel daemon initialized: listen on {}, proxy to {}, domain {}", listen_port, target_port, domain);

        Ok(TunnelDaemon {
            listen_port,
            target_port,
            domain,
            https_port: None,
            dns_resolver: None,
            context_detector: ContextDetector::new(),
            tls_config: None,
            stats: Arc::new(RequestStats::default()),
            start_time: Instant::now(),
        })
    }

    /// Get current request statistics
    pub fn get_stats(&self) -> (u64, u64, u64, u64, u64) {
        (
            self.stats.total_requests.load(Ordering::Relaxed),
            self.stats.successful_requests.load(Ordering::Relaxed),
            self.stats.failed_requests.load(Ordering::Relaxed),
            self.stats.total_bytes_in.load(Ordering::Relaxed),
            self.stats.total_bytes_out.load(Ordering::Relaxed),
        )
    }

    /// Get uptime in seconds
    pub fn uptime_secs(&self) -> u64 {
        self.start_time.elapsed().as_secs()
    }

    pub fn set_dns_resolver(&mut self, resolver: DualDNSResolver) {
        self.dns_resolver = Some(resolver);
    }

    pub async fn setup_https(&mut self, domain: &str, https_port: u16) -> Result<(), Box<dyn std::error::Error>> {
        info!("Setting up HTTPS for domain: {}", domain);
        
        // Generate or load certificate
        let (cert_chain, key) = cert::get_or_create_cert(domain, None)?;
        
        // Create TLS config
        let config = ServerConfig::builder()
            .with_safe_defaults()
            .with_no_client_auth()
            .with_single_cert(cert_chain, key)?;
        
        self.tls_config = Some(Arc::new(config));
        self.https_port = Some(https_port);
        
        info!("HTTPS configured for port {}", https_port);
        Ok(())
    }

    pub async fn run(self) -> Result<(), Box<dyn std::error::Error>> {
        let listen_port = self.listen_port;
        let target_port = self.target_port;
        let domain = self.domain.clone();
        let https_port = self.https_port;
        let tls_config = self.tls_config.clone();

        info!("Tunnel daemon running: listening on {}, proxying to {}, domain {}", listen_port, target_port, domain);

        // Create the service that will handle requests
        let daemon = Arc::new(self);
        let daemon_for_http = Arc::clone(&daemon);
        let make_svc = make_service_fn(move |socket: &AddrStream| {
            let remote_addr = socket.remote_addr();
            let daemon_clone = Arc::clone(&daemon_for_http);
            async move {
                Ok::<_, Infallible>(service_fn(move |req: Request<Body>| {
                    let daemon = Arc::clone(&daemon_clone);
                    async move { daemon.handle_request(req, remote_addr).await }
                }))
            }
        });

        // Start HTTP server
        let http_addr = ([127, 0, 0, 1], listen_port).into();
        let http_server = Server::bind(&http_addr).serve(make_svc);
        info!("HTTP server listening on http://{}", http_addr);

        // Start HTTPS server if configured
        let https_task = if let (Some(port), Some(config)) = (https_port, tls_config) {
            let https_addr: std::net::SocketAddr = ([127, 0, 0, 1], port).into();
            let listener = TcpListener::bind(&https_addr).await?;
            let acceptor = TlsAcceptor::from(config);
            
            info!("HTTPS server listening on https://{}", https_addr);
            
            let daemon_https = Arc::clone(&daemon);
            Some(tokio::spawn(async move {
                loop {
                    match listener.accept().await {
                        Ok((stream, _)) => {
                            let acceptor = acceptor.clone();
                            let daemon = Arc::clone(&daemon_https);
                            tokio::spawn(async move {
                                match acceptor.accept(stream).await {
                                    Ok(tls_stream) => {
                                        let remote_addr = tls_stream.get_ref().0.peer_addr().unwrap_or_else(|_| ([127, 0, 0, 1], 0).into());
                                        if let Ok(conn) = hyper::server::conn::Http::new()
                                            .serve_connection(tls_stream, service_fn(move |req: Request<Body>| {
                                                let daemon = Arc::clone(&daemon);
                                                async move { daemon.handle_request(req, remote_addr).await }
                                            }))
                                            .await
                                        {
                                            let _ = conn;
                                        }
                                    }
                                    Err(e) => {
                                        error!("TLS handshake error: {}", e);
                                    }
                                }
                            });
                        }
                        Err(e) => {
                            error!("HTTPS accept error: {}", e);
                            break;
                        }
                    }
                }
            }))
        } else {
            None
        };

        println!();
        println!("🎉 Beam tunnel active!");
        println!("   Domain: {}", domain);
        println!("   HTTP:  http://127.0.0.1:{} → localhost:{}", listen_port, target_port);
        if let Some(port) = https_port {
            println!("   HTTPS: https://127.0.0.1:{} → localhost:{} (self-signed certificate)", port, target_port);
            println!("   ⚠️  Browser will show security warning - this is normal for local development");
        }
        println!("   Status: Ready for local development");
        println!();

        // Run both servers
        tokio::select! {
            result = http_server => {
                if let Err(e) = result {
                    error!("HTTP server error: {}", e);
                    return Err(e.into());
                }
            }
            _ = async {
                if let Some(task) = https_task {
                    let _ = task.await;
                }
                std::future::pending::<()>().await
            } => {}
        }

        Ok(())
    }

    async fn handle_request(
        &self,
        req: Request<Body>,
        remote_addr: SocketAddr,
    ) -> Result<Response<Body>, Infallible> {
        let request_start = Instant::now();
        self.stats.total_requests.fetch_add(1, Ordering::Relaxed);

        let method = req.method().clone();
        let uri = req.uri().clone();
        let user_agent = req.headers()
            .get(header::USER_AGENT)
            .and_then(|h| h.to_str().ok())
            .map(|s| s.to_string());

        let referer = req.headers()
            .get(header::REFERER)
            .and_then(|h| h.to_str().ok())
            .map(|s| s.to_string());

        let content_length = req.headers()
            .get(header::CONTENT_LENGTH)
            .and_then(|h| h.to_str().ok())
            .and_then(|s| s.parse::<u64>().ok())
            .unwrap_or(0);

        // Track incoming bytes
        self.stats.total_bytes_in.fetch_add(content_length, Ordering::Relaxed);

        let context = self.context_detector.detect_context(
            user_agent.as_deref(),
            remote_addr.ip(),
            referer.as_deref()
        );

        // Detailed request logging
        debug!("→ {} {} from {} (context: {:?}, UA: {:?})",
              method, uri, remote_addr, context,
              user_agent.as_ref().map(|s| if s.len() > 50 { &s[..50] } else { s }));

        // Route based on context
        let response = match context {
            AccessContext::LocalBrowser => {
                self.proxy_to_local_app(req).await
            }
            AccessContext::WebhookService => {
                debug!("Webhook detected from {}", remote_addr);
                self.handle_webhook_request(req).await
            }
            AccessContext::APIClient | AccessContext::ExternalAccess => {
                self.handle_external_request(req, context).await
            }
        };

        // Track response stats
        let elapsed = request_start.elapsed();
        match &response {
            Ok(res) => {
                let status = res.status();
                let response_size = res.headers()
                    .get(header::CONTENT_LENGTH)
                    .and_then(|h| h.to_str().ok())
                    .and_then(|s| s.parse::<u64>().ok())
                    .unwrap_or(0);

                self.stats.total_bytes_out.fetch_add(response_size, Ordering::Relaxed);

                if status.is_success() {
                    self.stats.successful_requests.fetch_add(1, Ordering::Relaxed);
                    info!("← {} {} {} {:?} ({})", method, uri, status.as_u16(), elapsed, format_bytes(response_size));
                } else if status.is_client_error() || status.is_server_error() {
                    self.stats.failed_requests.fetch_add(1, Ordering::Relaxed);
                    warn!("← {} {} {} {:?}", method, uri, status.as_u16(), elapsed);
                } else {
                    info!("← {} {} {} {:?}", method, uri, status.as_u16(), elapsed);
                }
            }
            Err(_) => {
                self.stats.failed_requests.fetch_add(1, Ordering::Relaxed);
                error!("← {} {} ERROR {:?}", method, uri, elapsed);
            }
        }

        response
    }

    async fn proxy_to_local_app(&self, req: Request<Body>) -> Result<Response<Body>, Infallible> {
        // This is a simplified proxy implementation
        // In production, you'd use a proper HTTP client

        match self.perform_local_proxy(req).await {
            Ok(response) => Ok(response),
            Err(e) => {
                error!("Local proxy error: {}", e);
                Ok(Response::builder()
                    .status(StatusCode::INTERNAL_SERVER_ERROR)
                    .body(Body::from("Internal Server Error"))
                    .unwrap())
            }
        }
    }

    async fn handle_webhook_request(&self, req: Request<Body>) -> Result<Response<Body>, Infallible> {
        info!("Handling webhook request");

        // For webhooks, we might want to route through Tor in dual mode
        // For now, just proxy locally
        self.proxy_to_local_app(req).await
    }

    async fn handle_external_request(&self, req: Request<Body>, context: AccessContext) -> Result<Response<Body>, Infallible> {
        info!("Handling external request with context: {:?}", context);

        // For external requests, route appropriately
        // In dual mode, this might involve different routing logic
        self.proxy_to_local_app(req).await
    }

    async fn perform_local_proxy(&self, mut req: Request<Body>) -> Result<Response<Body>, Box<dyn std::error::Error>> {
        // Create HTTP client
        let client = hyper::Client::new();

        // Modify the request URI to point to the target application
        let target_uri = format!("http://127.0.0.1:{}{}", self.target_port, req.uri().path_and_query().map(|pq| pq.as_str()).unwrap_or(""));

        // Update the request URI
        *req.uri_mut() = target_uri.parse()?;

        // Update Host header
        req.headers_mut().insert(
            header::HOST,
            header::HeaderValue::from_str(&format!("127.0.0.1:{}", self.target_port))?,
        );

        // Forward the request to the local application
        match client.request(req).await {
            Ok(response) => Ok(response),
            Err(e) => {
                error!("Failed to proxy request to local application: {}", e);
                // Return a 502 Bad Gateway error
                Ok(Response::builder()
                    .status(StatusCode::BAD_GATEWAY)
                    .header("content-type", "application/json")
                    .body(Body::from(r#"{"error": "Failed to connect to local application"}"#))
                    .unwrap())
            }
        }
    }
}

/// Format bytes in human-readable form
fn format_bytes(bytes: u64) -> String {
    const KB: u64 = 1024;
    const MB: u64 = KB * 1024;
    const GB: u64 = MB * 1024;

    if bytes >= GB {
        format!("{:.2} GB", bytes as f64 / GB as f64)
    } else if bytes >= MB {
        format!("{:.2} MB", bytes as f64 / MB as f64)
    } else if bytes >= KB {
        format!("{:.2} KB", bytes as f64 / KB as f64)
    } else {
        format!("{} B", bytes)
    }
}



