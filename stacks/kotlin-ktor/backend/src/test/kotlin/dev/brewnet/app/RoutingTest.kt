package dev.brewnet.app

import dev.brewnet.app.plugins.configureRouting
import dev.brewnet.app.plugins.configureSerialization
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.server.testing.*
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class RoutingTest {

    @Test
    fun rootReturnsServiceInfo() = testApplication {
        application {
            configureSerialization()
            configureRouting()
        }
        val response = client.get("/")
        assertEquals(HttpStatusCode.OK, response.status)
        val json = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertEquals("ktor-backend", json["service"]?.jsonPrimitive?.content)
        assertEquals("running", json["status"]?.jsonPrimitive?.content)
        assertTrue(json.containsKey("message"))
    }

    @Test
    fun healthReturnsOk() = testApplication {
        application {
            configureSerialization()
            configureRouting()
        }
        val response = client.get("/health")
        assertEquals(HttpStatusCode.OK, response.status)
        val json = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertEquals("ok", json["status"]?.jsonPrimitive?.content)
        assertTrue(json.containsKey("timestamp"))
    }

    @Test
    fun helloReturnsLangInfo() = testApplication {
        application {
            configureSerialization()
            configureRouting()
        }
        val response = client.get("/api/hello")
        assertEquals(HttpStatusCode.OK, response.status)
        val json = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertEquals("Hello from Ktor!", json["message"]?.jsonPrimitive?.content)
        assertEquals("kotlin", json["lang"]?.jsonPrimitive?.content)
        assertTrue(json.containsKey("version"))
    }

    @Test
    fun echoReturnsRequestBody() = testApplication {
        application {
            configureSerialization()
            configureRouting()
        }
        val response = client.post("/api/echo") {
            contentType(ContentType.Application.Json)
            setBody("{\"test\":\"brewnet\"}")
        }
        assertEquals(HttpStatusCode.OK, response.status)
        val json = Json.parseToJsonElement(response.bodyAsText()).jsonObject
        assertEquals("brewnet", json["test"]?.jsonPrimitive?.content)
    }
}
