package com.example.demo.packages.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.packages.model.PackageModel;
import com.example.demo.packages.service.PackageService;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController 
@RequestMapping("/api/v1/Packages")
@RequiredArgsConstructor 
public class PackageController {
    private final PackageService service;

    @Operation(summary = "Does the thing and creates a new Package", description = "Creates a new Package idk man its self explanatory")
    @PostMapping 
    public ResponseEntity<PackageModel> create(@RequestBody PackageModel Package) {
        PackageModel savedPackage = service.createPackage(Package);
        return new ResponseEntity<>(savedPackage, HttpStatus.CREATED);
    }

    @Operation(summary = "Gets all the thingies", description = "Self explanatory")
    @GetMapping
    public ResponseEntity<List<PackageModel>> getAll() {
        return ResponseEntity.ok(service.getAllPackages());
    }

    @Operation(summary = "Gets a thing per id", description = "Self explanatory")
    @GetMapping("/{id}")
    public ResponseEntity<PackageModel> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getPackageById(id));
    }

    @Operation(summary = "Updates all the thingies", description = "Self explanatory")
    @PutMapping("/{id}")
    public ResponseEntity<PackageModel> update(@PathVariable Long id, @RequestBody PackageModel Package) {
        return ResponseEntity.ok(service.updatePackage(id, Package));
    }

    @Operation(summary = "Eviscerates one entry by its id", description = "Self explanatory")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deletePackage(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get package by tracking code", description = "Public endpoint for users to track their packages")
    @GetMapping("/track/{orderId}")
    public ResponseEntity<PackageModel> getByTrackingCode(@PathVariable String orderId) {
        return ResponseEntity.ok(service.getPackageByOrderId(orderId));
    }
}
