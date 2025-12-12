package com.hotel.app.web.rest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.hotel.app.HotelApp;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(classes = HotelApp.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SwaggerSecurityNonDevIT {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void swaggerConfigBlockedWhenNotDev() throws Exception {
        mockMvc.perform(get("/v3/api-docs/swagger-config")).andExpect(status().isUnauthorized());
    }
}
