package com.example.demo.packages.service;

import com.example.demo.packages.model.CurrentState;
import com.example.demo.packages.model.HistState;
import com.example.demo.packages.model.PackageModel;
import com.example.demo.packages.repository.PackageRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PackageServiceTest {

    @Mock
    private PackageRepository repo;

    @InjectMocks
    private PackageService service;

    private PackageModel newPackage(CurrentState state, String location) {
        PackageModel p = new PackageModel();
        p.setCurrentState(state);
        p.setLocation(location);
        return p;
    }

    // ---------- createPackage ----------

    @Test
    @DisplayName("createPackage generates an 8-char uppercase tracking code and dates the package today")
    void createPackageGeneratesTrackingCode() {
        when(repo.save(any(PackageModel.class))).thenAnswer(inv -> inv.getArgument(0));

        PackageModel saved = service.createPackage(newPackage(CurrentState.PENDING, "Santiago"));

        assertThat(saved.getOrderId()).hasSize(8);
        assertThat(saved.getOrderId()).isUpperCase();
        assertThat(saved.getIssueDate()).isEqualTo(LocalDate.now());
    }

    @Test
    @DisplayName("createPackage seeds an initial HistState when state is provided")
    void createPackageSeedsInitialHistory() {
        when(repo.save(any(PackageModel.class))).thenAnswer(inv -> inv.getArgument(0));

        PackageModel saved = service.createPackage(newPackage(CurrentState.PENDING, "Santiago"));

        assertThat(saved.getHistorial()).hasSize(1);
        HistState entry = saved.getHistorial().get(0);
        assertThat(entry.getEstado()).isEqualTo("PENDING");
        assertThat(entry.getUbicacion()).isEqualTo("Santiago");
        assertThat(entry.getFecha()).isNotNull();
        assertThat(entry.getPackageRef()).isSameAs(saved);
    }

    @Test
    @DisplayName("createPackage skips history seeding when state is null")
    void createPackageWithoutStateSkipsHistory() {
        when(repo.save(any(PackageModel.class))).thenAnswer(inv -> inv.getArgument(0));

        PackageModel saved = service.createPackage(newPackage(null, "Santiago"));

        assertThat(saved.getHistorial()).isEmpty();
    }

    // ---------- read operations ----------

    @Test
    void getAllPackagesDelegatesToRepo() {
        List<PackageModel> all = List.of(newPackage(CurrentState.ARRIVED, "X"));
        when(repo.findAll()).thenReturn(all);

        assertThat(service.getAllPackages()).isSameAs(all);
    }

    @Test
    void getPackageByIdReturnsEntity() {
        PackageModel p = newPackage(CurrentState.ARRIVED, "X");
        p.setId(7L);
        when(repo.findById(7L)).thenReturn(Optional.of(p));

        assertThat(service.getPackageById(7L)).isSameAs(p);
    }

    @Test
    void getPackageByIdThrowsWhenMissing() {
        when(repo.findById(7L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getPackageById(7L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found")
                .hasMessageContaining("7");
    }

    @Test
    void getPackageByOrderIdReturnsEntity() {
        PackageModel p = newPackage(CurrentState.ARRIVED, "X");
        when(repo.findByOrderId("ABCD1234")).thenReturn(Optional.of(p));

        assertThat(service.getPackageByOrderId("ABCD1234")).isSameAs(p);
    }

    @Test
    void getPackageByOrderIdThrowsWhenMissing() {
        when(repo.findByOrderId("NOPE")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getPackageByOrderId("NOPE"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("NOPE");
    }

    // ---------- updatePackage ----------

    @Test
    @DisplayName("updatePackage mutates state + location and appends a HistState")
    void updatePackageAppendsHistory() {
        PackageModel existing = newPackage(CurrentState.PENDING, "Santiago");
        existing.setId(1L);
        existing.getHistorial().add(new HistState(existing, "PENDING", "Santiago"));

        PackageModel incoming = newPackage(CurrentState.EN_ROUTE, "Valparaíso");

        when(repo.findById(1L)).thenReturn(Optional.of(existing));
        when(repo.save(existing)).thenReturn(existing);

        PackageModel result = service.updatePackage(1L, incoming);

        assertThat(result.getCurrentState()).isEqualTo(CurrentState.EN_ROUTE);
        assertThat(result.getLocation()).isEqualTo("Valparaíso");
        assertThat(result.getHistorial()).hasSize(2);

        HistState newest = result.getHistorial().get(result.getHistorial().size() - 1);
        assertThat(newest.getEstado()).isEqualTo("EN_ROUTE");
        assertThat(newest.getUbicacion()).isEqualTo("Valparaíso");
    }

    @Test
    void updatePackageThrowsWhenMissing() {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updatePackage(99L, newPackage(CurrentState.LOST, "?")))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }

    // ---------- deletePackage ----------

    @Test
    void deletePackageHappyPath() {
        when(repo.existsById(1L)).thenReturn(true);

        service.deletePackage(1L);

        verify(repo).deleteById(1L);
    }

    @Test
    void deletePackageThrowsWhenMissing() {
        when(repo.existsById(1L)).thenReturn(false);

        assertThatThrownBy(() -> service.deletePackage(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Cannot delete");

        verify(repo, never()).deleteById(any());
    }
}