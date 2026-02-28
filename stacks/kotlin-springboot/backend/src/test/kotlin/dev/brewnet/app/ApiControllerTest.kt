package dev.brewnet.app

import dev.brewnet.app.controller.ApiController
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

@WebMvcTest(ApiController::class)
@EnableAutoConfiguration(exclude = [DataSourceAutoConfiguration::class])
class ApiControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Test
    fun rootReturnsServiceInfo() {
        mockMvc.get("/")
            .andExpect {
                status { isOk() }
                jsonPath("$.service") { value("springboot-kt-backend") }
                jsonPath("$.status") { value("running") }
                jsonPath("$.message") { exists() }
            }
    }

    @Test
    fun healthReturnsOk() {
        mockMvc.get("/health")
            .andExpect {
                status { isOk() }
                jsonPath("$.status") { value("ok") }
                jsonPath("$.timestamp") { exists() }
            }
    }

    @Test
    fun helloReturnsLangInfo() {
        mockMvc.get("/api/hello")
            .andExpect {
                status { isOk() }
                jsonPath("$.message") { value("Hello from Spring Boot (Kotlin)!") }
                jsonPath("$.lang") { value("kotlin") }
                jsonPath("$.version") { exists() }
            }
    }

    @Test
    fun echoReturnsRequestBody() {
        mockMvc.post("/api/echo") {
            contentType = MediaType.APPLICATION_JSON
            content = """{"test":"brewnet"}"""
        }.andExpect {
            status { isOk() }
            jsonPath("$.test") { value("brewnet") }
        }
    }
}
