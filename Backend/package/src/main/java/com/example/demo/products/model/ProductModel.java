package com.example.demo.products.model;

import java.time.LocalDate;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter // shitass noargs and allargs was breaking thoroughly wtf man
@Setter
@Entity
@Table(name = "ProductModel", schema = "DinoRawrsX3")
public class ProductModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long Id;

    @Column(unique = false, nullable = false)
    private String productName;

    @Column(unique = false, nullable = false)
    @Min(value=0)
    @Max(value=999999)
    private Integer productPrice;

    @Column(unique = false, nullable = false)
    @Min(value=0)
    @Max(value=999999)
    private Integer productStock;

    @Column(unique = false, nullable = false)
    private String manufacturer;

    @Column(unique = false, nullable = false)
    private LocalDate manufacturingDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductType type;
}
