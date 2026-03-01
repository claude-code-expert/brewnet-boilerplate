package dev.brewnet.app.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Bean
    public DataSource dataSource() {
        String driver = env("DB_DRIVER", "postgres");
        HikariConfig config = new HikariConfig();
        config.setMaximumPoolSize(5);
        config.setInitializationFailTimeout(-1);

        switch (driver) {
            case "mysql":
                config.setJdbcUrl(String.format("jdbc:mysql://%s:%s/%s",
                        env("MYSQL_HOST", "mysql"),
                        env("MYSQL_PORT", "3306"),
                        env("MYSQL_DATABASE", "brewnet_db")));
                config.setUsername(env("MYSQL_USER", "brewnet"));
                config.setPassword(env("MYSQL_PASSWORD", ""));
                config.setDriverClassName("com.mysql.cj.jdbc.Driver");
                break;
            case "sqlite3":
                String path = env("SQLITE_PATH", "/app/data/brewnet_db.db");
                config.setJdbcUrl("jdbc:sqlite:" + path);
                config.setDriverClassName("org.sqlite.JDBC");
                break;
            default: // postgres
                config.setJdbcUrl(String.format("jdbc:postgresql://%s:%s/%s",
                        env("DB_HOST", "postgres"),
                        env("DB_PORT", "5432"),
                        env("DB_NAME", "brewnet_db")));
                config.setUsername(env("DB_USER", "brewnet"));
                config.setPassword(env("DB_PASSWORD", ""));
                config.setDriverClassName("org.postgresql.Driver");
                break;
        }

        return new HikariDataSource(config);
    }

    @Bean
    public JdbcTemplate jdbcTemplate(DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }

    private String env(String key, String defaultValue) {
        String val = System.getenv(key);
        return val != null && !val.isEmpty() ? val : defaultValue;
    }
}
