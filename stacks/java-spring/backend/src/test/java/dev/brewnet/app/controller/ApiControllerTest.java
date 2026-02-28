package dev.brewnet.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ApiControllerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        ApiController controller = new ApiController();
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setMessageConverters(new MappingJackson2HttpMessageConverter(new ObjectMapper()))
                .build();
    }

    @Test
    void rootReturnsServiceInfo() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.service").value("spring-backend"))
                .andExpect(jsonPath("$.status").value("running"))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void healthReturnsOk() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void helloReturnsLangInfo() throws Exception {
        mockMvc.perform(get("/api/hello"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Hello from Spring Framework!"))
                .andExpect(jsonPath("$.lang").value("java"))
                .andExpect(jsonPath("$.version").exists());
    }

    @Test
    void echoReturnsRequestBody() throws Exception {
        mockMvc.perform(post("/api/echo")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"test\":\"brewnet\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.test").value("brewnet"));
    }
}
