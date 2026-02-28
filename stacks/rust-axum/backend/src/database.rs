use sqlx::{AnyPool, any::install_default_drivers, pool::PoolOptions};
use std::env;

pub async fn connect() -> Result<AnyPool, sqlx::Error> {
    install_default_drivers();

    let driver = env::var("DB_DRIVER").unwrap_or_else(|_| "postgres".to_string());

    let url = match driver.as_str() {
        "postgres" => format!(
            "postgres://{}:{}@{}:{}/{}",
            env::var("DB_USER").unwrap_or_default(),
            env::var("DB_PASSWORD").unwrap_or_default(),
            env::var("DB_HOST").unwrap_or("postgres".into()),
            env::var("DB_PORT").unwrap_or("5432".into()),
            env::var("DB_NAME").unwrap_or("brewnet".into()),
        ),
        "mysql" => format!(
            "mysql://{}:{}@{}:{}/{}",
            env::var("MYSQL_USER").unwrap_or_default(),
            env::var("MYSQL_PASSWORD").unwrap_or_default(),
            env::var("MYSQL_HOST").unwrap_or("mysql".into()),
            env::var("MYSQL_PORT").unwrap_or("3306".into()),
            env::var("MYSQL_DATABASE").unwrap_or("brewnet".into()),
        ),
        "sqlite3" => format!(
            "sqlite://{}",
            env::var("SQLITE_PATH").unwrap_or("./data/brewnet.db".into())
        ),
        _ => panic!("Unsupported DB_DRIVER: {}", driver),
    };

    PoolOptions::new()
        .max_connections(5)
        .connect(&url)
        .await
}

pub async fn check_connection(pool: &AnyPool) -> bool {
    sqlx::query("SELECT 1").execute(pool).await.is_ok()
}
