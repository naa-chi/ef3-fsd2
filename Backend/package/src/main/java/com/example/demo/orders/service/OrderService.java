package com.example.demo.orders.service;

import com.example.demo.orders.model.OrderModel;
import com.example.demo.orders.model.OrderStatus;
import com.example.demo.orders.repository.OrderRepository;
import com.example.demo.packages.model.CurrentState;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {
    private final OrderRepository repo;

    public OrderModel createOrder(String username, String packageOrderId, Integer totalAmount) {
        if (repo.existsByPackageOrderId(packageOrderId)) {
            throw new RuntimeException("Order already exists for package: " + packageOrderId);
        }
        OrderModel order = new OrderModel();
        order.setUsername(username);
        order.setPackageOrderId(packageOrderId);
        order.setTotalAmount(totalAmount);
        order.setPurchaseDate(LocalDate.now());
        order.setCurrentState(CurrentState.PENDING);
        order.setStatus(OrderStatus.ACTIVE);
        return repo.save(order);
    }

    @Transactional(readOnly = true)
    public List<OrderModel> getUserHistory(String username) {
        return repo.findByUsernameOrderByPurchaseDateDesc(username);
    }

    // THIS IS CALLED BY THE FRONTEND TIMER EVERY TICK
    public OrderModel updateState(Long id, CurrentState newState) {
        OrderModel order = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        order.setCurrentState(newState);
        return repo.save(order);
    }

    public OrderModel processRefund(Long id) {
        OrderModel order = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        if (order.getStatus() == OrderStatus.REFUNDED) {
            throw new RuntimeException("This order has already been refunded");
        }
        order.setStatus(OrderStatus.REFUNDED);
        return repo.save(order);
    }
}