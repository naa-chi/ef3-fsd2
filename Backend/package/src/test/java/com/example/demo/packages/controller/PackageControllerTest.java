package com.example.demo.packages.controller;

import com.example.demo.packages.model.CurrentState;
import com.example.demo.packages.model.PackageModel;
import com.example.demo.packages.service.PackageService;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class PackageControllerTest {

    @Mock
    private PackageService service;

    @InjectMocks
    private PackageController controller;

    private MockMvc mvc;
    private PackageModel sample;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(controller).build();

        sample = new PackageModel();
        sample.setId(1L);
        sample.setOrderId("ABC12345");
        sample.setIssueDate(LocalDate.of(2026, 11, 11));
        sample.setCurrentState(CurrentState.PENDING);
        sample.setLocation("Santiago");
    }

    // ---------- POST /api/v1/Packages ----------

    @Test
    @DisplayName("POST /Packages returns 201 with the created package")
    void createHappyPath() throws Exception {
        when(service.createPackage(any(PackageModel.class))).thenReturn(sample);

        mvc.perform(post("/api/v1/Packages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentState\":\"PENDING\",\"location\":\"Santiago\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderId").value("ABC12345"))
                .andExpect(jsonPath("$.currentState").value("PENDING"))
                .andExpect(jsonPath("$.location").value("Santiago"));

        verify(service).createPackage(any(PackageModel.class));
    }

    // ---------- GET /api/v1/Packages ----------

    @Test
    @DisplayName("GET /Packages returns all packages")
    void getAllHappyPath() throws Exception {
        when(service.getAllPackages()).thenReturn(List.of(sample));

        mvc.perform(get("/api/v1/Packages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].orderId").value("ABC12345"));
    }

    // ---------- GET /api/v1/Packages/{id} ----------

    @Test
    @DisplayName("GET /Packages/{id} returns the package")
    void getByIdHappyPath() throws Exception {
        when(service.getPackageById(1L)).thenReturn(sample);

        mvc.perform(get("/api/v1/Packages/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.orderId").value("ABC12345"));
    }

    @Test
    @DisplayName("GET /Packages/{id} surfaces the service's RuntimeException")
    void getByIdPropagatesNotFound() {
        when(service.getPackageById(99L))
                .thenThrow(new RuntimeException("Package not found with id: 99"));

        assertThatThrownBy(() -> mvc.perform(get("/api/v1/Packages/99")))
                .isInstanceOf(ServletException.class)
                .hasCauseInstanceOf(RuntimeException.class);
    }

    // ---------- PUT /api/v1/Packages/{id} ----------

    @Test
    @DisplayName("PUT /Packages/{id} returns the updated package")
    void updateHappyPath() throws Exception {
        sample.setCurrentState(CurrentState.EN_ROUTE);
        sample.setLocation("Valparaíso");
        when(service.updatePackage(eq(1L), any(PackageModel.class))).thenReturn(sample);

        mvc.perform(put("/api/v1/Packages/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentState\":\"EN_ROUTE\",\"location\":\"Valparaíso\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentState").value("EN_ROUTE"))
                .andExpect(jsonPath("$.location").value("Valparaíso"));
    }

    // ---------- DELETE /api/v1/Packages/{id} ----------

    @Test
    @DisplayName("DELETE /Packages/{id} returns 204 with no body")
    void deleteHappyPath() throws Exception {
        doNothing().when(service).deletePackage(1L);

        mvc.perform(delete("/api/v1/Packages/1"))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));

        verify(service).deletePackage(1L);
    }

    // ---------- GET /api/v1/Packages/track/{orderId} ----------

    @Test
    @DisplayName("GET /Packages/track/{orderId} returns the package by tracking code")
    void getByTrackingCodeHappyPath() throws Exception {
        when(service.getPackageByOrderId("ABC12345")).thenReturn(sample);

        mvc.perform(get("/api/v1/Packages/track/ABC12345"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value("ABC12345"))
                .andExpect(jsonPath("$.location").value("Santiago"));

        verify(service).getPackageByOrderId("ABC12345");
    }

    @Test
    @DisplayName("GET /Packages/track/{orderId} surfaces the service's RuntimeException")
    void getByTrackingCodePropagatesNotFound() {
        when(service.getPackageByOrderId("NOPE"))
                .thenThrow(new RuntimeException("Package not found with code: NOPE"));

        assertThatThrownBy(() -> mvc.perform(get("/api/v1/Packages/track/NOPE")))
                .isInstanceOf(ServletException.class)
                .hasCauseInstanceOf(RuntimeException.class);
    }
}