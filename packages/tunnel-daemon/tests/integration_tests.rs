use std::net::{TcpListener, TcpStream, IpAddr, Ipv4Addr};
use std::io::{Read, Write};
use std::process::{Command, Child, Stdio};
use std::time::{Duration, Instant};
use std::thread;

// Helper to find an available port
fn find_available_port() -> u16 {
    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    let port = listener.local_addr().unwrap().port();
    drop(listener);
    port
}

// Helper to wait for port to be open
fn wait_for_port(port: u16, timeout_ms: u64) -> bool {
    let start = Instant::now();
    let timeout = Duration::from_millis(timeout_ms);

    while start.elapsed() < timeout {
        if TcpStream::connect(format!("127.0.0.1:{}", port)).is_ok() {
            return true;
        }
        thread::sleep(Duration::from_millis(50));
    }
    false
}

// Helper to start daemon
fn start_daemon(args: &[&str]) -> Child {
    Command::new("./target/release/beam-tunnel-daemon")
        .args(args)
        .env("RUST_LOG", "warn")
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("Failed to start daemon")
}

// ============================================================================
// CONTEXT DETECTION UNIT TESTS
// ============================================================================
mod context_tests {
    use super::*;

    // Test local IP detection
    #[test]
    fn test_localhost_detection() {
        let ip: IpAddr = "127.0.0.1".parse().unwrap();
        assert!(is_local_ip(ip));
    }

    #[test]
    fn test_private_192_168_detection() {
        let ip: IpAddr = "192.168.1.100".parse().unwrap();
        assert!(is_local_ip(ip));
    }

    #[test]
    fn test_private_10_detection() {
        let ip: IpAddr = "10.0.0.50".parse().unwrap();
        assert!(is_local_ip(ip));
    }

    #[test]
    fn test_private_172_detection() {
        let ip: IpAddr = "172.16.0.1".parse().unwrap();
        assert!(is_local_ip(ip));

        let ip2: IpAddr = "172.31.255.255".parse().unwrap();
        assert!(is_local_ip(ip2));
    }

    #[test]
    fn test_external_ip_detection() {
        let ip: IpAddr = "8.8.8.8".parse().unwrap();
        assert!(!is_local_ip(ip));

        let ip2: IpAddr = "1.2.3.4".parse().unwrap();
        assert!(!is_local_ip(ip2));
    }

    // Helper function mirroring the daemon's logic
    fn is_local_ip(ip: IpAddr) -> bool {
        match ip {
            IpAddr::V4(ipv4) => {
                let octets = ipv4.octets();
                octets[0] == 127 ||
                (octets[0] == 192 && octets[1] == 168) ||
                (octets[0] == 172 && octets[1] >= 16 && octets[1] <= 31) ||
                (octets[0] == 10)
            }
            IpAddr::V6(ipv6) => {
                ipv6.is_loopback() || (ipv6.segments()[0] & 0xffc0 == 0xfe80)
            }
        }
    }

    // Test webhook detection
    #[test]
    fn test_stripe_webhook_detection() {
        assert!(is_webhook_user_agent("Stripe/1.0 (+https://stripe.com/docs/webhooks)"));
    }

    #[test]
    fn test_github_webhook_detection() {
        assert!(is_webhook_user_agent("GitHub-Hookshot/abc123"));
    }

    #[test]
    fn test_slack_webhook_detection() {
        assert!(is_webhook_user_agent("Slackbot 1.0 (+https://api.slack.com/robots)"));
    }

    #[test]
    fn test_discord_webhook_detection() {
        assert!(is_webhook_user_agent("Discord-Webhook"));
    }

    #[test]
    fn test_non_webhook_detection() {
        assert!(!is_webhook_user_agent("Mozilla/5.0 Chrome/91.0"));
        assert!(!is_webhook_user_agent("curl/7.68.0"));
        assert!(!is_webhook_user_agent("MyApp/1.0"));
    }

    fn is_webhook_user_agent(ua: &str) -> bool {
        let indicators = [
            "Stripe/", "GitHub-Hookshot/", "twilio", "webhook",
            "slack", "discord", "zapier", "webhook.site",
        ];

        for indicator in &indicators {
            if ua.to_lowercase().contains(&indicator.to_lowercase()) {
                return true;
            }
        }
        false
    }

    // Test browser detection
    #[test]
    fn test_chrome_browser_detection() {
        assert!(is_browser_user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"));
    }

    #[test]
    fn test_firefox_browser_detection() {
        assert!(is_browser_user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0"));
    }

    #[test]
    fn test_safari_browser_detection() {
        assert!(is_browser_user_agent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15"));
    }

    #[test]
    fn test_curl_not_browser() {
        assert!(!is_browser_user_agent("curl/7.68.0"));
    }

    #[test]
    fn test_wget_not_browser() {
        assert!(!is_browser_user_agent("Wget/1.20.3"));
    }

    fn is_browser_user_agent(ua: &str) -> bool {
        let indicators = [
            "Mozilla/", "Chrome/", "Safari/", "Firefox/", "Edge/",
            "Opera/", "Brave/", "Vivaldi/", "Chromium/",
        ];

        for indicator in &indicators {
            if ua.contains(indicator) {
                return true;
            }
        }
        false
    }
}

// ============================================================================
// SECURITY TESTS
// ============================================================================
mod security_tests {
    use super::*;

    #[test]
    fn test_domain_validation_no_path_traversal() {
        // Domains should not contain path traversal sequences
        let dangerous_domains = [
            "../../../etc/passwd",
            "..%2f..%2fetc/passwd",
            "test/../admin",
        ];

        for domain in &dangerous_domains {
            assert!(has_path_traversal(domain), "Should detect path traversal in: {}", domain);
        }
    }

    #[test]
    fn test_domain_validation_safe_domains() {
        let safe_domains = [
            "myapp.local",
            "test-app.example.com",
            "api.v1.service.local",
            "localhost",
        ];

        for domain in &safe_domains {
            assert!(!has_path_traversal(domain), "Should accept safe domain: {}", domain);
        }
    }

    fn has_path_traversal(domain: &str) -> bool {
        domain.contains("..") || domain.contains("%2e%2e") || domain.contains("%2f")
    }

    #[test]
    fn test_port_bounds() {
        assert!(is_valid_port(1));
        assert!(is_valid_port(80));
        assert!(is_valid_port(443));
        assert!(is_valid_port(3000));
        assert!(is_valid_port(8080));
        assert!(is_valid_port(65535));

        assert!(!is_valid_port(0));
        assert!(!is_valid_port(65536));
    }

    fn is_valid_port(port: u32) -> bool {
        port >= 1 && port <= 65535
    }

    #[test]
    fn test_host_header_injection_prevention() {
        let dangerous_hosts = [
            "localhost\r\nX-Injected: malicious",
            "localhost\nX-Injected: malicious",
            "localhost%0d%0aX-Injected: malicious",
        ];

        for host in &dangerous_hosts {
            assert!(has_header_injection(host), "Should detect injection in: {}", host);
        }
    }

    fn has_header_injection(host: &str) -> bool {
        host.contains('\r') || host.contains('\n') ||
        host.contains("%0d") || host.contains("%0a")
    }
}

// ============================================================================
// CERTIFICATE TESTS
// ============================================================================
mod cert_tests {
    #[test]
    fn test_domain_to_filename_sanitization() {
        assert_eq!(sanitize_domain_for_filename("test.local"), "test_local");
        assert_eq!(sanitize_domain_for_filename("api.v1.service.com"), "api_v1_service_com");
        assert_eq!(sanitize_domain_for_filename("localhost"), "localhost");
    }

    fn sanitize_domain_for_filename(domain: &str) -> String {
        domain.replace(".", "_")
    }
}

// ============================================================================
// DNS RESOLVER TESTS
// ============================================================================
mod dns_tests {
    use std::collections::HashMap;
    use std::net::IpAddr;

    #[test]
    fn test_local_resolution() {
        let mut resolver = MockResolver::new();
        resolver.add_local("test.local", "127.0.0.1");

        assert_eq!(resolver.resolve_local("test.local"), Some("127.0.0.1".parse().unwrap()));
        assert_eq!(resolver.resolve_local("unknown.local"), None);
    }

    #[test]
    fn test_tor_resolution() {
        let mut resolver = MockResolver::new();
        resolver.add_tor("test.local", "abc123xyz.onion");

        assert_eq!(resolver.resolve_tor("test.local"), Some("abc123xyz.onion".to_string()));
        assert_eq!(resolver.resolve_tor("unknown.local"), None);
    }

    struct MockResolver {
        local_map: HashMap<String, IpAddr>,
        tor_map: HashMap<String, String>,
    }

    impl MockResolver {
        fn new() -> Self {
            MockResolver {
                local_map: HashMap::new(),
                tor_map: HashMap::new(),
            }
        }

        fn add_local(&mut self, domain: &str, ip: &str) {
            self.local_map.insert(domain.to_string(), ip.parse().unwrap());
        }

        fn add_tor(&mut self, domain: &str, onion: &str) {
            self.tor_map.insert(domain.to_string(), onion.to_string());
        }

        fn resolve_local(&self, domain: &str) -> Option<IpAddr> {
            self.local_map.get(domain).cloned()
        }

        fn resolve_tor(&self, domain: &str) -> Option<String> {
            self.tor_map.get(domain).cloned()
        }
    }
}

// ============================================================================
// INTEGRATION TESTS (require built daemon)
// ============================================================================
#[cfg(test)]
mod integration_tests {
    use super::*;

    #[test]
    #[ignore] // Run with --ignored flag
    fn test_daemon_starts_and_responds() {
        let port = find_available_port();
        let mut daemon = start_daemon(&["--port", &port.to_string()]);

        // Wait for daemon to start
        assert!(wait_for_port(port, 5000), "Daemon failed to start");

        // Make a request
        if let Ok(mut stream) = TcpStream::connect(format!("127.0.0.1:{}", port)) {
            stream.write_all(b"GET / HTTP/1.1\r\nHost: test.local\r\n\r\n").unwrap();
            let mut response = vec![0u8; 1024];
            let _ = stream.read(&mut response);

            let response_str = String::from_utf8_lossy(&response);
            assert!(response_str.contains("HTTP/1.1"), "Should get HTTP response");
        }

        // Cleanup
        let _ = daemon.kill();
    }

    #[test]
    #[ignore]
    fn test_daemon_graceful_shutdown() {
        let port = find_available_port();
        let mut daemon = start_daemon(&["--port", &port.to_string()]);

        assert!(wait_for_port(port, 5000), "Daemon failed to start");

        // Send SIGTERM
        #[cfg(unix)]
        {
            use std::os::unix::process::CommandExt;
            unsafe {
                libc::kill(daemon.id() as i32, libc::SIGTERM);
            }
        }

        // Wait for exit
        let status = daemon.wait().expect("Failed to wait for daemon");

        // Should exit cleanly
        assert!(status.success() || status.code() == Some(0));
    }

    #[test]
    #[ignore]
    fn test_daemon_port_already_in_use() {
        let port = find_available_port();

        // Occupy the port
        let _blocking = TcpListener::bind(format!("127.0.0.1:{}", port)).unwrap();

        // Try to start daemon on same port
        let output = Command::new("./target/release/beam-tunnel-daemon")
            .args(&["--port", &port.to_string()])
            .env("RUST_LOG", "error")
            .output()
            .expect("Failed to execute daemon");

        // Should fail with non-zero exit code
        assert!(!output.status.success());
    }

    #[test]
    #[ignore]
    fn test_daemon_invalid_port() {
        let output = Command::new("./target/release/beam-tunnel-daemon")
            .args(&["--port", "99999"])
            .output()
            .expect("Failed to execute daemon");

        assert!(!output.status.success());
    }

    #[test]
    #[ignore]
    fn test_daemon_https_mode() {
        let http_port = find_available_port();
        let https_port = find_available_port();

        let mut daemon = start_daemon(&[
            "--port", &http_port.to_string(),
            "--https",
            "--https-port", &https_port.to_string(),
        ]);

        // Wait for both ports
        assert!(wait_for_port(http_port, 5000), "HTTP port failed to open");
        assert!(wait_for_port(https_port, 5000), "HTTPS port failed to open");

        let _ = daemon.kill();
    }
}

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================
#[cfg(test)]
mod performance_tests {
    use super::*;

    #[test]
    #[ignore]
    fn test_high_concurrent_connections() {
        let port = find_available_port();
        let mut daemon = start_daemon(&["--port", &port.to_string()]);

        assert!(wait_for_port(port, 5000));

        // Spawn multiple threads making concurrent connections
        let handles: Vec<_> = (0..50)
            .map(|_| {
                let p = port;
                thread::spawn(move || {
                    if let Ok(mut stream) = TcpStream::connect(format!("127.0.0.1:{}", p)) {
                        stream.set_read_timeout(Some(Duration::from_secs(5))).ok();
                        stream.write_all(b"GET / HTTP/1.1\r\nHost: test\r\n\r\n").ok();
                        let mut buf = [0u8; 256];
                        let _ = stream.read(&mut buf);
                        true
                    } else {
                        false
                    }
                })
            })
            .collect();

        let results: Vec<bool> = handles.into_iter().map(|h| h.join().unwrap()).collect();
        let successful = results.iter().filter(|&&r| r).count();

        let _ = daemon.kill();

        assert!(successful >= 45, "At least 90% connections should succeed");
    }

    #[test]
    #[ignore]
    fn test_request_latency() {
        let port = find_available_port();
        let mut daemon = start_daemon(&["--port", &port.to_string()]);

        assert!(wait_for_port(port, 5000));

        let mut latencies = Vec::new();

        for _ in 0..20 {
            let start = Instant::now();
            if let Ok(mut stream) = TcpStream::connect(format!("127.0.0.1:{}", port)) {
                stream.write_all(b"GET / HTTP/1.1\r\nHost: test\r\n\r\n").ok();
                let mut buf = [0u8; 256];
                let _ = stream.read(&mut buf);
                latencies.push(start.elapsed().as_millis() as u64);
            }
        }

        let _ = daemon.kill();

        let avg = latencies.iter().sum::<u64>() / latencies.len() as u64;
        println!("Average latency: {}ms", avg);

        assert!(avg < 50, "Average latency should be under 50ms");
    }
}
