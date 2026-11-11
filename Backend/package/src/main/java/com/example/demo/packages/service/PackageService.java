package com.example.demo.packages.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.packages.model.HistState;
import com.example.demo.packages.model.PackageModel;
import com.example.demo.packages.repository.PackageRepository;

import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PackageService {

    private final PackageRepository repo;

    public PackageModel createPackage(PackageModel packageDetails) {
        String trackingCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        packageDetails.setOrderId(trackingCode);
        packageDetails.setIssueDate(LocalDate.now());

        // Defensive: never allow a null history list (fixes NPE on new-user checkout)
        if (packageDetails.getHistorial() == null) {
            packageDetails.setHistorial(new ArrayList<>());
        }

        // Log the initial state in the travel history
        if (packageDetails.getCurrentState() != null) {
            String loc = packageDetails.getLocation() != null ? packageDetails.getLocation() : "Unknown";
            HistState initialHistory = new HistState(
                    packageDetails,
                    packageDetails.getCurrentState().name(),
                    loc
            );
            packageDetails.getHistorial().add(initialHistory);
        }

        return repo.save(packageDetails);
    }

    @Transactional(readOnly = true)
    public List<PackageModel> getAllPackages() {
        return repo.findAll();
    }

    @Transactional(readOnly = true)
    public PackageModel getPackageById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public PackageModel getPackageByOrderId(String orderId) {
        return repo.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Package not found with code: " + orderId));
    }

    public PackageModel updatePackage(Long id, PackageModel packageDetails) {
        PackageModel existingPackage = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found with id: " + id));

        existingPackage.setCurrentState(packageDetails.getCurrentState());
        existingPackage.setLocation(packageDetails.getLocation());

        // Defensive: never allow a null history list
        if (existingPackage.getHistorial() == null) {
            existingPackage.setHistorial(new ArrayList<>());
        }

        if (packageDetails.getCurrentState() != null) {
            String loc = packageDetails.getLocation() != null ? packageDetails.getLocation() : "Unknown";
            HistState newHistory = new HistState(
                    existingPackage,
                    packageDetails.getCurrentState().name(),
                    loc
            );
            existingPackage.getHistorial().add(newHistory);
        }

        return repo.save(existingPackage);
    }

    public void deletePackage(Long id) {
        if (!repo.existsById(id)) {
            throw new RuntimeException("Cannot delete. Package not found with id: " + id);
        }
        repo.deleteById(id);
    }
}