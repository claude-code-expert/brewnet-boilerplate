use actix_web::{web, HttpRequest, HttpResponse};
use chrono::Utc;
use serde_json::{json, Value};
use sqlx::AnyPool;

use crate::database::check_connection;

pub async fn root() -> HttpResponse {
    HttpResponse::Ok().json(json!({
        "service": "actix-web-backend",
        "status": "running",
        "message": "🍺 Brewnet says hello!"
    }))
}

pub async fn health(pool: web::Data<AnyPool>) -> HttpResponse {
    let db_connected = check_connection(pool.get_ref()).await;
    HttpResponse::Ok().json(json!({
        "status": "ok",
        "timestamp": Utc::now().to_rfc3339(),
        "db_connected": db_connected
    }))
}

pub async fn health_no_db() -> HttpResponse {
    HttpResponse::Ok().json(json!({
        "status": "ok",
        "timestamp": Utc::now().to_rfc3339(),
        "db_connected": false
    }))
}

pub async fn hello() -> HttpResponse {
    HttpResponse::Ok().json(json!({
        "message": "Hello from Actix-web!",
        "lang": "rust",
        "version": env!("CARGO_PKG_VERSION")
    }))
}

pub async fn echo(_req: HttpRequest, body: web::Bytes) -> HttpResponse {
    if body.is_empty() {
        return HttpResponse::Ok().json(json!({}));
    }
    match serde_json::from_slice::<Value>(&body) {
        Ok(val) => HttpResponse::Ok().json(val),
        Err(_) => HttpResponse::Ok()
            .content_type("application/json")
            .body(body),
    }
}

#[cfg(test)]
mod tests {
    use actix_web::{test, web, App};
    use serde_json::Value;

    use super::*;

    fn test_app() -> App<
        impl actix_web::dev::ServiceFactory<
            actix_web::dev::ServiceRequest,
            Config = (),
            Response = actix_web::dev::ServiceResponse<impl actix_web::body::MessageBody>,
            Error = actix_web::Error,
            InitError = (),
        >,
    > {
        App::new()
            .route("/", web::get().to(root))
            .route("/health", web::get().to(health_no_db))
            .route("/api/hello", web::get().to(hello))
            .route("/api/echo", web::post().to(echo))
    }

    #[actix_web::test]
    async fn test_get_root() {
        let app = test::init_service(test_app()).await;
        let req = test::TestRequest::get().uri("/").to_request();
        let resp = test::call_service(&app, req).await;

        assert!(resp.status().is_success());

        let body: Value = test::read_body_json(resp).await;
        assert_eq!(body["service"], "actix-web-backend");
        assert_eq!(body["status"], "running");
        assert_eq!(body["message"], "🍺 Brewnet says hello!");
    }

    #[actix_web::test]
    async fn test_get_health() {
        let app = test::init_service(test_app()).await;
        let req = test::TestRequest::get().uri("/health").to_request();
        let resp = test::call_service(&app, req).await;

        assert!(resp.status().is_success());

        let body: Value = test::read_body_json(resp).await;
        assert_eq!(body["status"], "ok");
        assert!(body["timestamp"].is_string());
        assert_eq!(body["db_connected"], false);
    }

    #[actix_web::test]
    async fn test_get_api_hello() {
        let app = test::init_service(test_app()).await;
        let req = test::TestRequest::get().uri("/api/hello").to_request();
        let resp = test::call_service(&app, req).await;

        assert!(resp.status().is_success());

        let body: Value = test::read_body_json(resp).await;
        assert_eq!(body["message"], "Hello from Actix-web!");
        assert_eq!(body["lang"], "rust");
        assert!(body["version"].is_string());
    }

    #[actix_web::test]
    async fn test_post_api_echo() {
        let app = test::init_service(test_app()).await;
        let payload = serde_json::json!({"hello": "world", "number": 42});
        let req = test::TestRequest::post()
            .uri("/api/echo")
            .set_json(&payload)
            .to_request();
        let resp = test::call_service(&app, req).await;

        assert!(resp.status().is_success());

        let body: Value = test::read_body_json(resp).await;
        assert_eq!(body["hello"], "world");
        assert_eq!(body["number"], 42);
    }
}
