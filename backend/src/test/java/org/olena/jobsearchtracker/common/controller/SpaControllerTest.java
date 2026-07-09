package org.olena.jobsearchtracker.common.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SpaController.class)
class SpaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testHandleError_forwardsClientRouteToIndexHtml() throws Exception {
        mockMvc.perform(get("/error")
                        .requestAttr("jakarta.servlet.error.request_uri", "/statistics"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/index.html"));
    }

    @Test
    void testHandleError_forwardsUnknownPathToIndexHtml() throws Exception {
        mockMvc.perform(get("/error"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/index.html"));
    }

    @Test
    void testHandleError_returnsNotFoundForApiPath() throws Exception {
        mockMvc.perform(get("/error")
                        .requestAttr("jakarta.servlet.error.request_uri", "/api/applications/42"))
                .andExpect(status().isNotFound());
    }
}
