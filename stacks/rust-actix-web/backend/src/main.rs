mod database;
mod handler;

use actix_cors::Cors;
use actix_web::{web, App, HttpServer};

#[tokio::main]
async fn main() -> std::io::Result<()> {
    let pool = match database::connect().await {
        Ok(p) => p,
        Err(e) => {
            eprintln!("Warning: DB connection failed: {}", e);
            // Create a dummy pool attempt; server starts but db_connected=false
            return start_server_without_db().await;
        }
    };

    println!("Rust backend listening on port 8080");

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:3000")
            .allowed_methods(vec!["GET", "POST", "OPTIONS"])
            .allowed_header(actix_web::http::header::CONTENT_TYPE);

        App::new()
            .wrap(cors)
            .app_data(web::Data::new(pool.clone()))
            .route("/", web::get().to(handler::root))
            .route("/health", web::get().to(handler::health))
            .route("/api/hello", web::get().to(handler::hello))
            .route("/api/echo", web::post().to(handler::echo))
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}

async fn start_server_without_db() -> std::io::Result<()> {
    println!("Rust backend listening on port 8080 (no DB)");

    HttpServer::new(|| {
        let cors = Cors::default()
            .allowed_origin("http://localhost:3000")
            .allowed_methods(vec!["GET", "POST", "OPTIONS"])
            .allowed_header(actix_web::http::header::CONTENT_TYPE);

        App::new()
            .wrap(cors)
            .route("/", web::get().to(handler::root))
            .route("/health", web::get().to(handler::health_no_db))
            .route("/api/hello", web::get().to(handler::hello))
            .route("/api/echo", web::post().to(handler::echo))
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}
