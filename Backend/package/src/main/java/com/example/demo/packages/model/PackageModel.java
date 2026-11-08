package com.example.demo.packages.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "PackageModel", schema = "DinoRawrX3")
public class PackageModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String orderId;

    @Column(unique = false, nullable = false)
    private LocalDate issueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CurrentState currentState;

    @Column(unique = false, nullable = false)
    private String location;

    /* ── NEW: Travel History relationship ────────────────────── */
    @OneToMany(mappedBy = "packageRef", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("fecha DESC")
    private List<HistState> historial = new ArrayList<>();
}