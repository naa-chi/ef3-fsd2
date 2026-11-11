package com.example.demo.orders.controller;

import com.example.demo.orders.model.OrderModel;
import com.example.demo.orders.model.OrderStatus;
import com.example.demo.orders.service.OrderService;
import com.example.demo.packages.model.CurrentState;
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

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class OrderControllerTest {

    @Mock
    private OrderService service;

    @InjectMocks
    private OrderController controller;

    private MockMvc mvc;
    private OrderModel sample;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(controller).build();

        sample = new OrderModel();
        sample.setId(1L);
        sample.setUsername("alice");
        sample.setPackageOrderId("ABC12345");
        sample.setTotalAmount(15_000);
        sample.setPurchaseDate(LocalDate.of(2026, 11, 11));
        sample.setCurrentState(CurrentState.PENDING);
        sample.setStatus(OrderStatus.ACTIVE);
    }

    // ---------- POST /api/v1/orders ----------

    @Test
    @DisplayName("POST /orders returns 400 when username is missing")
    void createOrderRejectsMissingUsername() throws Exception {
        mvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"packageOrderId\":\"ABC\",\"totalAmount\":100}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Missing required fields")));

        verifyNoInteractions(service);
    }

    @Test
    @DisplayName("POST /orders returns 400 when packageOrderId is missing")
    void createOrderRejectsMissingPackageOrderId() throws Exception {
        mvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"bob\",\"totalAmount\":100}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Missing required fields")));

        verifyNoInteractions(service);
    }

    @Test
    @DisplayName("POST /orders returns 400 when totalAmount is missing")
    void createOrderRejectsMissingTotalAmount() throws Exception {
        mvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"bob\",\"packageOrderId\":\"ABC\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Missing required fields")));

        verifyNoInteractions(service);
    }

    @Test
    @DisplayName("POST /orders returns 200 with the created order")
    void createOrderHappyPath() throws Exception {
        when(service.createOrder(eq("bob"), eq("XYZ12345"), eq(9_000)))
                .thenReturn(sample);

        mvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"bob\",\"packageOrderId\":\"XYZ12345\",\"totalAmount\":9000}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("alice"))
                .andExpect(jsonPath("$.packageOrderId").value("ABC12345"))
                .andExpect(jsonPath("$.totalAmount").value(15_000))
                .andExpect(jsonPath("$.currentState").value("PENDING"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("POST /orders catches service exceptions and returns 400")
    void createOrderConvertsServiceExceptionTo400() throws Exception {
        when(service.createOrder(any(), any(), any()))
                .thenThrow(new RuntimeException("duplicate order"));

        mvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"bob\",\"packageOrderId\":\"DUP\",\"totalAmount\":100}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("duplicate order")));
    }

    // ---------- GET /api/v1/orders/history/{username} ----------

    @Test
    @DisplayName("GET /orders/history/{username} returns the user's orders")
    void getHistoryHappyPath() throws Exception {
        when(service.getUserHistory("alice")).thenReturn(List.of(sample));

        mvc.perform(get("/api/v1/orders/history/alice"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].username").value("alice"))
                .andExpect(jsonPath("$[0].packageOrderId").value("ABC12345"));

        verify(service).getUserHistory("alice");
    }

    // ---------- PUT /api/v1/orders/{id} ----------

    @Test
    @DisplayName("PUT /orders/{id} returns 400 when currentState is missing from payload")
    void updateStateRejectsNullState() throws Exception {
        mvc.perform(put("/api/v1/orders/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("currentState cannot be null")));

        verifyNoInteractions(service);
    }

    @Test
    @DisplayName("PUT /orders/{id} returns 200 when state is valid")
    void updateStateHappyPath() throws Exception {
        sample.setCurrentState(CurrentState.EN_ROUTE);
        when(service.updateState(1L, CurrentState.EN_ROUTE)).thenReturn(sample);

        mvc.perform(put("/api/v1/orders/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentState\":\"EN_ROUTE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentState").value("EN_ROUTE"));
    }

    @Test
    @DisplayName("PUT /orders/{id} returns 400 when the enum name is invalid")
    void updateStateRejectsInvalidEnum() throws Exception {
        mvc.perform(put("/api/v1/orders/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentState\":\"NOT_A_REAL_STATE\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("NOT_A_REAL_STATE")));
    }

    @Test
    @DisplayName("PUT /orders/{id} returns 400 when the service throws")
    void updateStateConvertsServiceExceptionTo400() throws Exception {
        when(service.updateState(99L, CurrentState.ARRIVED))
                .thenThrow(new RuntimeException("Order not found with id: 99"));

        mvc.perform(put("/api/v1/orders/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentState\":\"ARRIVED\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("not found")));
    }

    // ---------- PUT /api/v1/orders/{id}/refund ----------

    @Test
    @DisplayName("PUT /orders/{id}/refund returns 200 with the refunded order")
    void processRefundHappyPath() throws Exception {
        sample.setStatus(OrderStatus.REFUNDED);
        when(service.processRefund(1L)).thenReturn(sample);

        mvc.perform(put("/api/v1/orders/1/refund"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REFUNDED"));
    }

    @Test
    @DisplayName("PUT /orders/{id}/refund returns 400 when already refunded")
    void processRefundRejectsDoubleRefund() throws Exception {
        when(service.processRefund(1L))
                .thenThrow(new RuntimeException("This order has already been refunded"));

        mvc.perform(put("/api/v1/orders/1/refund"))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("already been refunded")));
    }
}