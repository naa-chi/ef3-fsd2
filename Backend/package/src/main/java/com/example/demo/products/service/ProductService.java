package com.example.demo.products.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.products.model.ProductModel;
import com.example.demo.products.repository.ProductRepository;

import lombok.RequiredArgsConstructor;

import java.util.List;

@Service 
@RequiredArgsConstructor 
@Transactional 
public class ProductService {
    private final ProductRepository repo;

    @Transactional(readOnly = true)
    public List<ProductModel> getAllProducts() {
        return repo.findAll();
    }

    @Transactional(readOnly = true)
    public ProductModel getProductById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    public ProductModel createProduct(ProductModel product) {
        return repo.save(product);
    }

    public ProductModel updateProduct(Long id, ProductModel productDetails) {
        ProductModel existingProduct = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        existingProduct.setProductName(productDetails.getProductName());
        existingProduct.setProductPrice(productDetails.getProductPrice());
        existingProduct.setProductStock(productDetails.getProductStock());
        existingProduct.setManufacturer(productDetails.getManufacturer());
        existingProduct.setManufacturingDate(productDetails.getManufacturingDate());
        existingProduct.setType(productDetails.getType());

        return repo.save(existingProduct);
    }

    public void deleteProduct(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Cannot delete. Product not found with id: " + id);
        }
        repo.deleteById(id);
    }
}