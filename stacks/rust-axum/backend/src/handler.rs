use axum::{extract::State, http::StatusCode, response::Json};
use chrono::Utc;
use serde_json::{json, Value};
use sqlx::AnyPool;

use crate::database::check_connection;

pub async fn root() -> Json<Value> {
    Json(json!({
        "service": "axum-backend",
        "status": "running",
        "message": "Brewnet says hello!"
    }))
}

pub async fn health(State(pool): State<Option<AnyPool>>) -> Json<Value> {
    let db_connected = match &pool {
        Some(p) => check_connection(p).await,
        None => false,
    };
    Json(json!({
        "status": "ok",
        "timestamp": Utc::now().to_rfc3339(),
        "db_connected": db_connected
    }))
}

pub async fn hello() -> Json<Value> {
    Json(json!({
        "message": "Hello from Axum!",
        "lang": "rust",
        "version": env!("CARGO_PKG_VERSION")
    }))
}

pub async fn echo(body: axum::body::Bytes) -> (StatusCode, Json<Value>) {
    if body.is_empty() {
        return (StatusCode::OK, Json(json!({})));
    }
    match serde_json::from_slice::<Value>(&body) {
        Ok(val) => (StatusCode::OK, Json(val)),
        Err(_) => (StatusCode::BAD_REQUEST, Json(json!({"error": "Invalid JSON"}))),
    }
}

#[cfg(test)]
mod tests {
    use axum::{routing::{get, post}, Router, body::Body};
    use http_body_util::BodyExt;
    use serde_json::Value;
    use tower::ServiceExt;

    use super::*;

    fn test_router() -> Router {
        Router::new()
            .route("/", get(root))
            .route("/health", get(health))
            .route("/api/hello", get(hello))
            .route("/api/echo", post(echo))
            .with_state(None::<AnyPool>)
    }

    #[tokio::test]
    async fn test_get_root() {
        let app = test_router();
        let req = axum::http::Request::builder()
            .uri("/")
            .body(Body::empty())
            .unwrap();
        let resp = app.oneshot(req).await.unwrap();

        assert_eq!(resp.status(), StatusCode::OK);

        let bytes = resp.into_body().collect().await.unwrap().to_bytes();
        let body: Value = serde_json::from_slice(&bytes).unwrap();
        assert_eq!(body["service"], "axum-backend");
        assert_eq!(body["status"], "running");
        assert_eq!(body["message"], "Brewnet says hello!");
    }

    #[tokio::test]
    async fn test_get_health() {
        let app = test_router();
        let req = axum::http::Request::builder()
            .uri("/health")
            .body(Body::empty())
            .unwrap();
        let resp = app.oneshot(req).await.unwrap();

        assert_eq!(resp.status(), StatusCode::OK);

        let bytes = resp.into_body().collect().await.unwrap().to_bytes();
        let body: Value = serde_json::from_slice(&bytes).unwrap();
        assert_eq!(body["status"], "ok");
        assert!(body["timestamp"].is_string());
        assert_eq!(body["db_connected"], false);
    }

    #[tokio::test]
    async fn test_get_api_hello() {
        let app = test_router();
        let req = axum::http::Request::builder()
            .uri("/api/hello")
            .body(Body::empty())
            .unwrap();
        let resp = app.oneshot(req).await.unwrap();

        assert_eq!(resp.status(), StatusCode::OK);

        let bytes = resp.into_body().collect().await.unwrap().to_bytes();
        let body: Value = serde_json::from_slice(&bytes).unwrap();
        assert_eq!(body["message"], "Hello from Axum!");
        assert_eq!(body["lang"], "rust");
        assert!(body["version"].is_string());
    }

    #[tokio::test]
    async fn test_post_api_echo() {
        let app = test_router();
        let payload = serde_json::json!({"hello": "world", "number": 42});
        let req = axum::http::Request::builder()
            .method("POST")
            .uri("/api/echo")
            .header("content-type", "application/json")
            .body(Body::from(serde_json::to_vec(&payload).unwrap()))
            .unwrap();
        let resp = app.oneshot(req).await.unwrap();

        assert_eq!(resp.status(), StatusCode::OK);

        let bytes = resp.into_body().collect().await.unwrap().to_bytes();
        let body: Value = serde_json::from_slice(&bytes).unwrap();
        assert_eq!(body["hello"], "world");
        assert_eq!(body["number"], 42);
    }
}
