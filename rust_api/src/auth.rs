use google_signin::Client;
use std::ops::Deref;

pub struct AuthClient(Client);

impl AuthClient {
    pub fn new(client_id: String, hosted_domain: String) -> Self {
        let mut client = Client::new();

        // Add Google client ID and hosted domain
        client.audiences.push(client_id);
        client.hosted_domains.push(hosted_domain);

        Self(client)
    }
}

impl Deref for AuthClient {
    type Target = Client;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}
