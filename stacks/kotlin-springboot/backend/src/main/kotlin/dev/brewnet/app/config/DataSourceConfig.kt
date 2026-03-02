package dev.brewnet.app.config

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import javax.sql.DataSource

@Configuration
class DataSourceConfig {

    @Bean
    fun dataSource(): DataSource {
        val driver = System.getenv("DB_DRIVER") ?: "postgres"
        val config = HikariConfig().apply {
            maximumPoolSize = 5
            initializationFailTimeout = -1
        }

        when (driver) {
            "mysql" -> config.apply {
                jdbcUrl = "jdbc:mysql://${env("MYSQL_HOST", "mysql")}:${env("MYSQL_PORT", "3306")}/${env("MYSQL_DATABASE", "brewnet_db")}"
                username = env("MYSQL_USER", "brewnet")
                password = env("MYSQL_PASSWORD", "")
                driverClassName = "com.mysql.cj.jdbc.Driver"
            }
            "sqlite3" -> config.apply {
                jdbcUrl = "jdbc:sqlite:${env("SQLITE_PATH", "/app/data/brewnet_db.db")}"
                driverClassName = "org.sqlite.JDBC"
            }
            else -> config.apply {
                jdbcUrl = "jdbc:postgresql://${env("DB_HOST", "postgres")}:${env("DB_PORT", "5432")}/${env("DB_NAME", "brewnet_db")}"
                username = env("DB_USER", "brewnet")
                password = env("DB_PASSWORD", "")
                driverClassName = "org.postgresql.Driver"
            }
        }

        return HikariDataSource(config)
    }

    private fun env(key: String, default: String): String =
        System.getenv(key)?.takeIf { it.isNotEmpty() } ?: default
}
