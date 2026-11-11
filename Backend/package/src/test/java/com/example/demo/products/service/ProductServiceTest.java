package com.example.demo.products.service;

import com.example.demo.products.model.ProductModel;
import com.example.demo.products.model.ProductType;
import com.example.demo.products.repository.ProductRepository;
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
class ProductServiceTest {

    @Mock
    private ProductRepository repo;

    @InjectMocks
    private ProductService service;

    private ProductModel sample() {
        ProductModel p = new ProductModel();
        p.setId(1L);
        p.setProductName("Test");
        p.setProductPrice(1000);
        p.setProductStock(10);
        p.setManufacturer("ACME");
        p.setManufacturingDate(LocalDate.of(2025, 1, 1));
        p.setType(ProductType.FOOD);
        return p;
    }

    @Test
    void getAllProductsDelegatesToRepo() {
        List<ProductModel> all = List.of(sample());
        when(repo.findAll()).thenReturn(all);

        assertThat(service.getAllProducts()).isSameAs(all);
    }

    @Test
    void getProductByIdReturnsEntity() {
        ProductModel p = sample();
        when(repo.findById(1L)).thenReturn(Optional.of(p));

        assertThat(service.getProductById(1L)).isSameAs(p);
    }

    @Test
    void getProductByIdThrowsWhenMissing() {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getProductById(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("99");
    }

    @Test
    void createProductSavesEntity() {
        ProductModel p = sample();
        when(repo.save(p)).thenReturn(p);

        assertThat(service.createProduct(p)).isSameAs(p);
        verify(repo).save(p);
    }

    @Test
    @DisplayName("updateProduct copies all mutable fields from the request")
    void updateProductCopiesFields() {
        ProductModel existing = sample();
        ProductModel incoming = new ProductModel();
        incoming.setProductName("Updated");
        incoming.setProductPrice(2000);
        incoming.setProductStock(5);
        incoming.setManufacturer("NewCo");
        incoming.setManufacturingDate(LocalDate.of(2026, 3, 3));
        incoming.setType(ProductType.ELECTRONICS);

        when(repo.findById(1L)).thenReturn(Optional.of(existing));
        when(repo.save(existing)).thenReturn(existing);

        ProductModel result = service.updateProduct(1L, incoming);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getProductName()).isEqualTo("Updated");
        assertThat(result.getProductPrice()).isEqualTo(2000);
        assertThat(result.getProductStock()).isEqualTo(5);
        assertThat(result.getManufacturer()).isEqualTo("NewCo");
        assertThat(result.getManufacturingDate()).isEqualTo(LocalDate.of(2026, 3, 3));
        assertThat(result.getType()).isEqualTo(ProductType.ELECTRONICS);
    }

    @Test
    void updateProductThrowsWhenMissing() {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateProduct(99L, new ProductModel()))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void deleteProductHappyPath() {
        when(repo.existsById(1L)).thenReturn(true);

        service.deleteProduct(1L);

        verify(repo).deleteById(1L);
    }

    @Test
    void deleteProductThrowsWhenMissing() {
        when(repo.existsById(1L)).thenReturn(false);

        assertThatThrownBy(() -> service.deleteProduct(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Cannot delete");

        verify(repo, never()).deleteById(any());
    }
}