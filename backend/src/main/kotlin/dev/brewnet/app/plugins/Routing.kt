package dev.brewnet.app.plugins

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.json.*
import java.time.Instant

fun Application.configureRouting() {
    routing {
        get("/") {
            call.respond(buildJsonObject {
                put("service", "ktor-backend")
                put("status", "running")
                put("message", "Hello Brewnet (https://www.brewnet.dev)")
            })
        }

        get("/health") {
            val dbConnected = isDbConnected()
            call.respond(buildJsonObject {
                put("status", "ok")
                put("timestamp", Instant.now().toString())
                put("db_connected", dbConnected)
            })
        }

        get("/api/hello") {
            call.respond(buildJsonObject {
                put("message", "Hello from Ktor!")
                put("lang", "kotlin")
                put("version", KotlinVersion.CURRENT.toString())
            })
        }

        post("/api/echo") {
            val body = call.receiveText()
            if (body.isBlank()) {
                call.respondText("{}", contentType = ContentType.Application.Json)
            } else {
                call.respondText(body, contentType = ContentType.Application.Json)
            }
        }
    }
}
