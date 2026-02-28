mod database;
mod handler;

use axum::{routing::{get, post}, Router};
use sqlx::AnyPool;
use tower_http::cors::{CorsLayer, AllowOrigin};

#[tokio::main]
async fn main() {
    let pool: Option<AnyPool> = match database::connect().await {
        Ok(p) => Some(p),
        Err(e) => {
            eprintln!("Warning: DB connection failed: {}", e);
            None
        }
    };

    let cors = CorsLayer::new()
        .allow_origin(AllowOrigin::exact(
            "http://localhost:3000".parse().unwrap(),
        ))
        .allow_methods([
            axum::http::Method::GET,
            axum::http::Method::POST,
            axum::http::Method::OPTIONS,
        ])
        .allow_headers([axum::http::header::CONTENT_TYPE]);

    let app = Router::new()
        .route("/", get(handler::root))
        .route("/health", get(handler::health))
        .route("/api/hello", get(handler::hello))
        .route("/api/echo", post(handler::echo))
        .layer(cors)
        .with_state(pool);

    println!("Rust Axum backend listening on port 8080");

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080")
        .await
        .expect("Failed to bind to port 8080");

    axum::serve(listener, app)
        .await
        .expect("Server error");
}
