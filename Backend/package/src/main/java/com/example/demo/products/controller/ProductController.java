package com.example.demo.products.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.products.model.ProductModel;
import com.example.demo.products.service.ProductService;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController 
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor 
public class ProductController {
    private final ProductService service;

    @Operation(summary = "Does the thing and creates a new product", description = "Creates a new product idk man its self explanatory")
    @PostMapping 
    public ResponseEntity<ProductModel> create(@RequestBody ProductModel product) {
        ProductModel savedProduct = service.createProduct(product);
        return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
    }

    @Operation(summary = "Gets all the thingies", description = "Self explanatory")
    @GetMapping
    public ResponseEntity<List<ProductModel>> getAll() {
        return ResponseEntity.ok(service.getAllProducts());
    }

    @Operation(summary = "Gets a thing per id", description = "Self explanatory")
    @GetMapping("/{id}")
    public ResponseEntity<ProductModel> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getProductById(id));
    }

    @Operation(summary = "Updates all the thingies", description = "Self explanatory")
    @PutMapping("/{id}")
    public ResponseEntity<ProductModel> update(@PathVariable Long id, @RequestBody ProductModel product) {
        return ResponseEntity.ok(service.updateProduct(id, product));
    }

    @Operation(summary = "Eviscerates one entry by its id", description = "Self explanatory")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}