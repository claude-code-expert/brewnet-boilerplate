package dev.brewnet.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class ApiController {

    @Autowired(required = false)
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/")
    public Map<String, Object> root() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("service", "spring-backend");
        response.put("status", "running");
        response.put("message", "Hello Brewnet (https://www.brewnet.dev)");
        return response;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        boolean dbConnected = false;
        if (jdbcTemplate != null) {
            try {
                jdbcTemplate.queryForObject("SELECT 1", Integer.class);
                dbConnected = true;
            } catch (Exception e) {
                // DB not available
            }
        }
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "ok");
        response.put("timestamp", Instant.now().toString());
        response.put("db_connected", dbConnected);
        return response;
    }

    @GetMapping("/api/hello")
    public Map<String, Object> hello() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Hello from Spring Framework!");
        response.put("lang", "java");
        response.put("version", Runtime.version().toString());
        return response;
    }

    @PostMapping("/api/echo")
    public Map<String, Object> echo(@RequestBody(required = false) Map<String, Object> body) {
        return body != null ? body : Map.of();
    }
}
