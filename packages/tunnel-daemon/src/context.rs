use std::net::IpAddr;
use tracing::debug;

#[derive(Debug, Clone, PartialEq)]
pub enum AccessContext {
    LocalBrowser,
    WebhookService,
    APIClient,
    ExternalAccess,
}

pub struct ContextDetector;

impl ContextDetector {
    pub fn new() -> Self {
        ContextDetector
    }

    pub fn detect_context(&self, user_agent: Option<&str>, source_ip: IpAddr, referer: Option<&str>) -> AccessContext {
        debug!("Detecting context: UA={:?}, IP={}, Referer={:?}", user_agent, source_ip, referer);

        // Check for webhook services first (highest priority)
        if let Some(ua) = user_agent {
            if self.is_webhook_service(ua, referer) {
                return AccessContext::WebhookService;
            }
        }

        // Check if it's a local IP
        if self.is_local_ip(source_ip) {
            // Local IP with browser user agent = local browser
            if let Some(ua) = user_agent {
                if self.is_browser_user_agent(ua) {
                    return AccessContext::LocalBrowser;
                }
            }
            return AccessContext::APIClient;
        }

        // External IP
        if let Some(ua) = user_agent {
            if self.is_browser_user_agent(ua) {
                return AccessContext::ExternalAccess;
            }
        }

        AccessContext::APIClient
    }

    fn is_webhook_service(&self, user_agent: &str, referer: Option<&str>) -> bool {
        let webhook_indicators = [
            "Stripe/", "GitHub-Hookshot/", "twilio", "webhook",
            "slack", "discord", "zapier", "webhook.site",
        ];

        // Check user agent
        for indicator in &webhook_indicators {
            if user_agent.contains(indicator) {
                return true;
            }
        }

        // Check referer
        if let Some(ref referer) = referer {
            for indicator in &webhook_indicators {
                if referer.contains(indicator) {
                    return true;
                }
            }
        }

        false
    }

    fn is_local_ip(&self, ip: IpAddr) -> bool {
        match ip {
            IpAddr::V4(ipv4) => {
                let octets = ipv4.octets();
                // Localhost
                octets[0] == 127 ||
                // Private networks
                (octets[0] == 192 && octets[1] == 168) || // 192.168.x.x
                (octets[0] == 172 && octets[1] >= 16 && octets[1] <= 31) || // 172.16.x.x - 172.31.x.x
                (octets[0] == 10) // 10.x.x.x
            }
            IpAddr::V6(ipv6) => {
                // IPv6 localhost (::1) or link-local (fe80::/10)
                ipv6.is_loopback() || ipv6.segments()[0] & 0xffc0 == 0xfe80
            }
        }
    }

    fn is_browser_user_agent(&self, user_agent: &str) -> bool {
        let browser_indicators = [
            "Mozilla/", "Chrome/", "Safari/", "Firefox/", "Edge/",
            "Opera/", "Brave/", "Vivaldi/", "Chromium/",
        ];

        for indicator in &browser_indicators {
            if user_agent.contains(indicator) {
                return true;
            }
        }

        false
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::net::Ipv4Addr;

    #[test]
    fn test_webhook_detection() {
        let detector = ContextDetector::new();

        // Stripe webhook
        assert_eq!(
            detector.detect_context(Some("Stripe/1.0 (+https://stripe.com/docs/webhooks)"), "1.2.3.4".parse().unwrap(), None),
            AccessContext::WebhookService
        );

        // GitHub webhook
        assert_eq!(
            detector.detect_context(Some("GitHub-Hookshot/123abc"), "1.2.3.4".parse().unwrap(), None),
            AccessContext::WebhookService
        );
    }

    #[test]
    fn test_local_browser_detection() {
        let detector = ContextDetector::new();

        // Local browser
        assert_eq!(
            detector.detect_context(Some("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"), "127.0.0.1".parse().unwrap(), None),
            AccessContext::LocalBrowser
        );

        // Local API client
        assert_eq!(
            detector.detect_context(Some("curl/7.68.0"), "127.0.0.1".parse().unwrap(), None),
            AccessContext::APIClient
        );
    }

    #[test]
    fn test_external_access_detection() {
        let detector = ContextDetector::new();

        // External browser
        assert_eq!(
            detector.detect_context(Some("Mozilla/5.0 Chrome/91.0"), "1.2.3.4".parse().unwrap(), None),
            AccessContext::ExternalAccess
        );

        // External API
        assert_eq!(
            detector.detect_context(Some("MyApp/1.0"), "1.2.3.4".parse().unwrap(), None),
            AccessContext::APIClient
        );
    }

    #[test]
    fn test_local_ip_detection() {
        let detector = ContextDetector::new();

        assert!(detector.is_local_ip("127.0.0.1".parse().unwrap()));
        assert!(detector.is_local_ip("192.168.1.100".parse().unwrap()));
        assert!(detector.is_local_ip("10.0.0.50".parse().unwrap()));
        assert!(detector.is_local_ip("172.16.0.10".parse().unwrap()));

        assert!(!detector.is_local_ip("8.8.8.8".parse().unwrap()));
        assert!(!detector.is_local_ip("1.2.3.4".parse().unwrap()));
    }
}
