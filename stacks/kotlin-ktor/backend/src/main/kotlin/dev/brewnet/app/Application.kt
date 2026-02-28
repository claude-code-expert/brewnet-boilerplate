package dev.brewnet.app

import dev.brewnet.app.plugins.configureDatabase
import dev.brewnet.app.plugins.configureRouting
import dev.brewnet.app.plugins.configureSerialization
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.http.*

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0") {
        install(CORS) {
            allowHost("localhost:3000")
            allowMethod(HttpMethod.Get)
            allowMethod(HttpMethod.Post)
            allowMethod(HttpMethod.Options)
            allowHeader(HttpHeaders.ContentType)
        }
        configureDatabase()
        configureSerialization()
        configureRouting()
    }.start(wait = true)
    println("Ktor backend listening on port 8080")
}
