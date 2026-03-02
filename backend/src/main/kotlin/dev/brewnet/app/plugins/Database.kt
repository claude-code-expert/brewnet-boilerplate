package dev.brewnet.app.plugins

import io.ktor.server.application.*
import org.jetbrains.exposed.sql.Database

private var dbConnected = false

fun Application.configureDatabase() {
    val driver = System.getenv("DB_DRIVER") ?: "postgres"
    try {
        when (driver) {
            "mysql" -> Database.connect(
                url = "jdbc:mysql://${env("MYSQL_HOST", "mysql")}:${env("MYSQL_PORT", "3306")}/${env("MYSQL_DATABASE", "brewnet_db")}",
                driver = "com.mysql.cj.jdbc.Driver",
                user = env("MYSQL_USER", "brewnet"),
                password = env("MYSQL_PASSWORD", "")
            )
            "sqlite3" -> Database.connect(
                url = "jdbc:sqlite:${env("SQLITE_PATH", "/app/data/brewnet_db.db")}",
                driver = "org.sqlite.JDBC"
            )
            else -> Database.connect(
                url = "jdbc:postgresql://${env("DB_HOST", "postgres")}:${env("DB_PORT", "5432")}/${env("DB_NAME", "brewnet_db")}",
                driver = "org.postgresql.Driver",
                user = env("DB_USER", "brewnet"),
                password = env("DB_PASSWORD", "")
            )
        }
        dbConnected = true
    } catch (e: Exception) {
        println("Warning: DB connection failed: ${e.message}")
        dbConnected = false
    }
}

fun isDbConnected(): Boolean {
    return try {
        if (!dbConnected) return false
        org.jetbrains.exposed.sql.transactions.transaction {
            exec("SELECT 1")
        }
        true
    } catch (e: Exception) {
        false
    }
}

private fun env(key: String, default: String): String =
    System.getenv(key)?.takeIf { it.isNotEmpty() } ?: default
