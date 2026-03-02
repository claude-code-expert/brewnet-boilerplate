package dev.brewnet.app.controller;

import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.time.Instant;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
public class RootController {

    private final DataSource dataSource;

    public RootController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/")
    public Map<String, Object> root() {
        return Map.of(
            "service", "springboot-backend",
            "status", "running",
            "message", "Hello Brewnet (https://www.brewnet.dev)"
        );
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        boolean dbConnected = checkConnection();
        return Map.of(
            "status", "ok",
            "timestamp", Instant.now().toString(),
            "db_connected", dbConnected
        );
    }

    @GetMapping("/api/hello")
    public Map<String, Object> hello() {
        return Map.of(
            "message", "Hello from Spring Boot!",
            "lang", "java",
            "version", System.getProperty("java.version")
        );
    }

    @PostMapping("/api/echo")
    public Map<String, Object> echo(@RequestBody(required = false) Map<String, Object> body) {
        if (body == null) {
            return Map.of();
        }
        return body;
    }

    private boolean checkConnection() {
        try (var conn = dataSource.getConnection()) {
            return conn.isValid(2);
        } catch (Exception e) {
            return false;
        }
    }
}
