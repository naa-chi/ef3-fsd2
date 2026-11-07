package com.example.demo.products.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.products.model.ProductModel;

public interface ProductRepository extends JpaRepository<ProductModel, Long> {

}
