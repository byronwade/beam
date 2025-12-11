use hyper::server::conn::AddrStream;
use hyper::service::{make_service_fn, service_fn};
use hyper::{Body, Request, Response, Server, StatusCode, header};
use std::convert::Infallible;
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::net::TcpListener;
use tokio_rustls::TlsAcceptor;
use rustls::ServerConfig;
use tracing::{info, error};

use crate::dns::DualDNSResolver;
use crate::context::{ContextDetector, AccessContext};
use crate::cert;

pub struct TunnelDaemon {
    local_port: u16,
    https_port: Option<u16>,
    dns_resolver: Option<DualDNSResolver>,
    context_detector: ContextDetector,
    tls_config: Option<Arc<ServerConfig>>,
}

impl TunnelDaemon {
    pub async fn new(local_port: u16) -> Result<Self, Box<dyn std::error::Error>> {
        info!("Tunnel daemon initialized for port {}", local_port);

        Ok(TunnelDaemon {
            local_port,
            https_port: None,
            dns_resolver: None,
            context_detector: ContextDetector::new(),
            tls_config: None,
        })
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
        let local_port = self.local_port;
        let https_port = self.https_port;
        let tls_config = self.tls_config.clone();
        let domain = format!("beam-{}.local", std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)?
            .as_secs());

        info!("Tunnel daemon running on port {}", local_port);

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
        let http_addr = ([127, 0, 0, 1], local_port).into();
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
        println!("   HTTP:  http://{}:{}", domain, local_port);
        if let Some(port) = https_port {
            println!("   HTTPS: https://{}:{} (self-signed certificate)", domain, port);
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
        let user_agent = req.headers()
            .get(header::USER_AGENT)
            .and_then(|h| h.to_str().ok())
            .map(|s| s.to_string());

        let referer = req.headers()
            .get(header::REFERER)
            .and_then(|h| h.to_str().ok())
            .map(|s| s.to_string());

        let context = self.context_detector.detect_context(
            user_agent.as_deref(),
            remote_addr.ip(),
            referer.as_deref()
        );

        info!("Request: {} {} from {} (context: {:?})",
              req.method(), req.uri(), remote_addr, context);

        // Route based on context
        match context {
            AccessContext::LocalBrowser => {
                // Route to local application
                self.proxy_to_local_app(req).await
            }
            AccessContext::WebhookService => {
                // For webhooks, we need to handle them specially
                // In dual mode, this might route through Tor
                info!("Webhook detected - routing appropriately");
                self.handle_webhook_request(req).await
            }
            AccessContext::APIClient | AccessContext::ExternalAccess => {
                // External API calls
                self.handle_external_request(req, context).await
            }
        }
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

    async fn perform_local_proxy(&self, req: Request<Body>) -> Result<Response<Body>, Box<dyn std::error::Error>> {
        // Extract the host and port from the request
        let host = req.headers()
            .get(header::HOST)
            .and_then(|h| h.to_str().ok())
            .unwrap_or("localhost");

        // Parse the port from the host header
        let target_port = if host.contains(':') {
            host.split(':').nth(1)
                .and_then(|p| p.parse().ok())
                .unwrap_or(self.local_port)
        } else {
            self.local_port
        };

        // For demonstration, just return a response indicating the routing
        let response_body = format!(
            r#"{{"message": "Beam tunnel active", "host": "{}", "port": {}, "method": "{}"}}"#,
            host, target_port, req.method()
        );

        let response = Response::builder()
            .status(StatusCode::OK)
            .header("content-type", "application/json")
            .header("x-beam-tunnel", "true")
            .body(Body::from(response_body))
            .unwrap();

        Ok(response)
    }
}
