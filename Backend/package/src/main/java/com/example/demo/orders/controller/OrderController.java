package com.example.demo.orders.controller;

import com.example.demo.orders.model.OrderModel;
import com.example.demo.orders.service.OrderService;
import com.example.demo.packages.model.CurrentState;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService service;

    @Operation(summary = "Creates a new order", description = "Creates a new order with the provided username, packageOrderId, and totalAmount. Returns the created order.")
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderModel orderRequest) {
        try {
            // Basic validation to prevent DB 500 errors
            if (orderRequest.getUsername() == null || orderRequest.getPackageOrderId() == null || orderRequest.getTotalAmount() == null) {
                return ResponseEntity.badRequest().body("Missing required fields (username, packageOrderId, or totalAmount)");
            }

            OrderModel created = service.createOrder(
                orderRequest.getUsername(),
                orderRequest.getPackageOrderId(),
                orderRequest.getTotalAmount()
            );
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            e.printStackTrace(); // Prints the error to your backend console
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Get order history for a specific user", description = "self explanatory")
    @GetMapping("/history/{username}")
    public ResponseEntity<List<OrderModel>> getHistory(@PathVariable String username) {
        return ResponseEntity.ok(service.getUserHistory(username));
    }

    @Operation(summary = "Get order by ID", description = "self explanatory")
    // FRONTEND TIMER CALLS THIS TO UPDATE STATE
    @PutMapping("/{id}")
    public ResponseEntity<?> updateState(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            String stateStr = payload.get("currentState");
            if (stateStr == null) {
                return ResponseEntity.badRequest().body("currentState cannot be null");
            }
            CurrentState newState = CurrentState.valueOf(stateStr);
            return ResponseEntity.ok(service.updateState(id, newState));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Process a refund for an order", description = "Processes a refund for the order with the given ID. Returns the refunded order or an error message if the refund cannot be processed.")
    @PutMapping("/{id}/refund")
    public ResponseEntity<?> processRefund(@PathVariable Long id) {
        try {
            OrderModel refunded = service.processRefund(id);
            return ResponseEntity.ok(refunded);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}