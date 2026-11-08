package com.example.demo.packages.model;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "historial_estado", schema = "DinoRawrX3")
public class HistState {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", nullable = false)
    @JsonIgnore // Prevents infinite JSON recursion
    private PackageModel packageRef;

    @Column(nullable = false)
    private String estado;

    @Column(nullable = false)
    private String ubicacion;

    @Column(nullable = false)
    private LocalDateTime fecha;

    // Custom constructor for convenience
    public HistState(PackageModel packageRef, String estado, String ubicacion) {
        this.packageRef = packageRef;
        this.estado = estado;
        this.ubicacion = ubicacion;
        this.fecha = LocalDateTime.now();
    }
}