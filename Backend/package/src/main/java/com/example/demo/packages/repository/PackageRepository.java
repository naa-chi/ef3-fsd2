package com.example.demo.packages.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.packages.model.PackageModel;
import java.util.Optional;

public interface PackageRepository extends JpaRepository<PackageModel, Long> {
    Optional<PackageModel> findByOrderId(String orderId);
}
