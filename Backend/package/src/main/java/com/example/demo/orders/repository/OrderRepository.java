package com.example.demo.orders.repository;

import com.example.demo.orders.model.OrderModel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<OrderModel, Long> {
    List<OrderModel> findByUsernameOrderByPurchaseDateDesc(String username);
    boolean existsByPackageOrderId(String packageOrderId);
}