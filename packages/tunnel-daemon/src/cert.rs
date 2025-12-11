use rcgen::{Certificate, CertificateParams, KeyPair, PKCS_ECDSA_P256_SHA256};
use rustls::{Certificate as RustlsCertificate, PrivateKey};
use std::fs;
use std::path::{Path, PathBuf};
use tracing::{info, warn};

/// Generate a self-signed certificate for a domain
pub fn generate_self_signed_cert(domain: &str) -> Result<(Vec<u8>, Vec<u8>), Box<dyn std::error::Error>> {
    let mut params = CertificateParams::new(vec![domain.to_string()]);
    
    // Add localhost and 127.0.0.1 as alternative names
    params.subject_alt_names = vec![
        rcgen::SanType::DnsName("localhost".to_string()),
        rcgen::SanType::IpAddress(std::net::IpAddr::V4(std::net::Ipv4Addr::new(127, 0, 0, 1))),
        rcgen::SanType::DnsName(domain.to_string()),
    ];
    
    // Generate key pair
    let key_pair = KeyPair::generate(&PKCS_ECDSA_P256_SHA256)?;
    params.key_pair = Some(key_pair);
    
    // Generate certificate
    let cert = Certificate::from_params(params)?;
    
    // Get certificate and private key in DER format
    let cert_der = cert.serialize_der()?;
    let key_der = cert.serialize_private_key_der();
    
    Ok((cert_der, key_der))
}

/// Load or generate certificate for a domain
pub fn get_or_create_cert(domain: &str, cert_dir: Option<&Path>) -> Result<(Vec<RustlsCertificate>, PrivateKey), Box<dyn std::error::Error>> {
    let cert_path = if let Some(dir) = cert_dir {
        dir.join(format!("{}.cert", domain.replace(".", "_")))
    } else {
        PathBuf::from(format!("{}.cert", domain.replace(".", "_")))
    };
    
    let key_path = if let Some(dir) = cert_dir {
        dir.join(format!("{}.key", domain.replace(".", "_")))
    } else {
        PathBuf::from(format!("{}.key", domain.replace(".", "_")))
    };
    
    // Try to load existing certificate
    if cert_path.exists() && key_path.exists() {
        match (fs::read(&cert_path), fs::read(&key_path)) {
            (Ok(cert_bytes), Ok(key_bytes)) => {
                info!("Loading existing certificate for {}", domain);
                let cert = RustlsCertificate(cert_bytes);
                let key = PrivateKey(key_bytes);
                return Ok((vec![cert], key));
            }
            _ => {
                warn!("Failed to read existing certificate, generating new one");
            }
        }
    }
    
    // Generate new certificate
    info!("Generating new self-signed certificate for {}", domain);
    let (cert_der, key_der) = generate_self_signed_cert(domain)?;
    
    // Save certificate if directory is provided
    if let Some(dir) = cert_dir {
        if !dir.exists() {
            fs::create_dir_all(dir)?;
        }
        fs::write(&cert_path, &cert_der)?;
        fs::write(&key_path, &key_der)?;
        info!("Saved certificate to {:?}", cert_path);
    }
    
    let cert = RustlsCertificate(cert_der);
    let key = PrivateKey(key_der);
    
    Ok((vec![cert], key))
}
