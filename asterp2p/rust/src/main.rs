use wasm_bindgen::prelude::*;
use webrtc_p2p::{Peer, Message};
use std::collections::HashMap;
use rand::Rng;
use tokio::net::TcpListener;
use tokio::net::TcpStream;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub struct P2PNetwork {
    peers: Vec<Peer>,
    peer_id: String,
}

#[wasm_bindgen]
impl P2PNetwork {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        P2PNetwork {
            peers: vec![],
            peer_id: String::new(),
        }
    }

    #[wasm_bindgen]
    pub fn set_peer_id(&mut self, id: String) {
        self.peer_id = id;
    }

    #[wasm_bindgen]
    pub fn connect_to_peer(&mut self, peer_id: String) {
        let peer = Peer::new(peer_id.clone(), move |event| {
            match event {
                webrtc_p2p::Event::ConnectionOpen => {
                    log(&format!("Connected to {}", peer_id));
                }
                webrtc_p2p::Event::ConnectionClose => {
                    log(&format!("Disconnected from {}", peer_id));
                }
                _ => {}
            }
        });
        self.peers.push(peer);
    }

    #[wasm_bindgen]
    pub fn send_message(&self, message: String, recipient_peer_id: String) {
        if let Some(peer) = self.peers.iter().find(|p| p.peer_id == recipient_peer_id) {
            peer.send(Message::String(message)).unwrap();
        }
    }

    #[wasm_bindgen]
    pub fn on_message(callback: &dyn Fn(String)) {
        self.peers.iter().for_each(|peer| {
            peer.on("data", move |data: String| {
                callback(data);
            });
        });
    }
}