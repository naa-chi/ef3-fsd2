package com.example.demo.products.controller;

import com.example.demo.products.model.ProductModel;
import com.example.demo.products.model.ProductType;
import com.example.demo.products.service.ProductService;
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
class ProductControllerTest {

    @Mock
    private ProductService service;

    @InjectMocks
    private ProductController controller;

    private MockMvc mvc;
    private ProductModel sample;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(controller).build();

        sample = new ProductModel();
        sample.setId(1L);
        sample.setProductName("Test Product");
        sample.setProductPrice(1_000);
        sample.setProductStock(10);
        sample.setManufacturer("ACME");
        sample.setManufacturingDate(LocalDate.of(2025, 1, 1));
        sample.setType(ProductType.FOOD);
    }

    // ---------- POST /api/v1/products ----------

    @Test
    @DisplayName("POST /products returns 201 with the created product")
    void createHappyPath() throws Exception {
        when(service.createProduct(any(ProductModel.class))).thenReturn(sample);

        mvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productName\":\"Test Product\",\"productPrice\":1000,"
                                + "\"productStock\":10,\"manufacturer\":\"ACME\","
                                + "\"manufacturingDate\":\"2025-01-01\",\"type\":\"FOOD\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.productName").value("Test Product"))
                .andExpect(jsonPath("$.productPrice").value(1_000))
                .andExpect(jsonPath("$.type").value("FOOD"));

        verify(service).createProduct(any(ProductModel.class));
    }

    // ---------- GET /api/v1/products ----------

    @Test
    @DisplayName("GET /products returns all products")
    void getAllHappyPath() throws Exception {
        when(service.getAllProducts()).thenReturn(List.of(sample));

        mvc.perform(get("/api/v1/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].productName").value("Test Product"));
    }

    // ---------- GET /api/v1/products/{id} ----------

    @Test
    @DisplayName("GET /products/{id} returns the product")
    void getByIdHappyPath() throws Exception {
        when(service.getProductById(1L)).thenReturn(sample);

        mvc.perform(get("/api/v1/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.productName").value("Test Product"));
    }

    @Test
    @DisplayName("GET /products/{id} surfaces the service's RuntimeException")
    void getByIdPropagatesNotFound() {
        when(service.getProductById(99L))
                .thenThrow(new RuntimeException("Product not found with id: 99"));

        assertThatThrownBy(() -> mvc.perform(get("/api/v1/products/99")))
                .isInstanceOf(ServletException.class)
                .hasCauseInstanceOf(RuntimeException.class);
    }

    // ---------- PUT /api/v1/products/{id} ----------

    @Test
    @DisplayName("PUT /products/{id} returns the updated product")
    void updateHappyPath() throws Exception {
        sample.setProductName("Updated");
        sample.setType(ProductType.ELECTRONICS);
        when(service.updateProduct(eq(1L), any(ProductModel.class))).thenReturn(sample);

        mvc.perform(put("/api/v1/products/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productName\":\"Updated\",\"productPrice\":2000,"
                                + "\"productStock\":5,\"manufacturer\":\"NewCo\","
                                + "\"manufacturingDate\":\"2026-03-03\",\"type\":\"ELECTRONICS\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productName").value("Updated"))
                .andExpect(jsonPath("$.type").value("ELECTRONICS"));
    }

    @Test
    @DisplayName("PUT /products/{id} surfaces the service's RuntimeException")
    void updatePropagatesNotFound() {
        when(service.updateProduct(eq(99L), any(ProductModel.class)))
                .thenThrow(new RuntimeException("Product not found with id: 99"));

        assertThatThrownBy(() ->
                mvc.perform(put("/api/v1/products/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productName\":\"X\"}")))
                .isInstanceOf(ServletException.class)
                .hasCauseInstanceOf(RuntimeException.class);
    }

    // ---------- DELETE /api/v1/products/{id} ----------

    @Test
    @DisplayName("DELETE /products/{id} returns 204 with no body")
    void deleteHappyPath() throws Exception {
        doNothing().when(service).deleteProduct(1L);

        mvc.perform(delete("/api/v1/products/1"))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));

        verify(service).deleteProduct(1L);
    }

    @Test
    @DisplayName("DELETE /products/{id} surfaces the service's RuntimeException")
    void deletePropagatesNotFound() {
        doThrow(new RuntimeException("Cannot delete. Product not found with id: 99"))
                .when(service).deleteProduct(99L);

        assertThatThrownBy(() -> mvc.perform(delete("/api/v1/products/99")))
                .isInstanceOf(ServletException.class)
                .hasCauseInstanceOf(RuntimeException.class);
    }
}