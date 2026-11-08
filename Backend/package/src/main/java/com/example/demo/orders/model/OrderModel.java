package com.example.demo.orders.model;

import com.example.demo.packages.model.CurrentState;
import java.time.LocalDate;
import jakarta.persistence.*;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "dinobox_orders", schema = "DinoRawrX3")
public class OrderModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", nullable = false, length = 100)
    private String username;

    @Column(name = "package_order_id", unique = true, nullable = false, length = 50)
    private String packageOrderId;

    @Column(name = "total_amount", nullable = false)
    private Integer totalAmount;

    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_state", nullable = false, length = 50) // <-- Added length
    private CurrentState currentState;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20) // <-- Added length
    private OrderStatus status;
}