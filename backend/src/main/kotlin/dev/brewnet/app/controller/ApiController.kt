package dev.brewnet.app.controller

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.web.bind.annotation.*
import java.time.Instant

@RestController
class ApiController {

    @Autowired(required = false)
    private var jdbcTemplate: JdbcTemplate? = null

    @GetMapping("/")
    fun root(): Map<String, Any> = linkedMapOf(
        "service" to "springboot-kt-backend",
        "status" to "running",
        "message" to "\uD83C\uDF7A Brewnet says hello!"
    )

    @GetMapping("/health")
    fun health(): Map<String, Any> {
        val dbConnected = try {
            jdbcTemplate?.queryForObject("SELECT 1", Int::class.java)
            true
        } catch (e: Exception) {
            false
        }
        return linkedMapOf(
            "status" to "ok",
            "timestamp" to Instant.now().toString(),
            "db_connected" to dbConnected
        )
    }

    @GetMapping("/api/hello")
    fun hello(): Map<String, Any> = linkedMapOf(
        "message" to "Hello from Spring Boot (Kotlin)!",
        "lang" to "kotlin",
        "version" to KotlinVersion.CURRENT.toString()
    )

    @PostMapping("/api/echo")
    fun echo(@RequestBody(required = false) body: Map<String, Any>?): Map<String, Any> =
        body ?: emptyMap()
}
