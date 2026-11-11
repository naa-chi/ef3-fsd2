package com.example.demo.orders.service;

import com.example.demo.orders.model.OrderModel;
import com.example.demo.orders.model.OrderStatus;
import com.example.demo.orders.repository.OrderRepository;
import com.example.demo.packages.model.CurrentState;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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
class OrderServiceTest {

    @Mock
    private OrderRepository repo;

    @InjectMocks
    private OrderService service;

    private OrderModel activeOrder;

    @BeforeEach
    void setUp() {
        activeOrder = new OrderModel();
        activeOrder.setId(1L);
        activeOrder.setUsername("alice");
        activeOrder.setPackageOrderId("ABC12345");
        activeOrder.setTotalAmount(15_000);
        activeOrder.setPurchaseDate(LocalDate.now());
        activeOrder.setCurrentState(CurrentState.PENDING);
        activeOrder.setStatus(OrderStatus.ACTIVE);
    }

    // ---------- createOrder ----------

    @Test
    @DisplayName("createOrder sets defaults, persists, and returns the saved entity")
    void createOrderHappyPath() {
        when(repo.existsByPackageOrderId("NEW-001")).thenReturn(false);
        when(repo.save(any(OrderModel.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderModel result = service.createOrder("bob", "NEW-001", 25_000);

        assertThat(result).isNotNull();
        assertThat(result.getUsername()).isEqualTo("bob");
        assertThat(result.getPackageOrderId()).isEqualTo("NEW-001");
        assertThat(result.getTotalAmount()).isEqualTo(25_000);
        assertThat(result.getPurchaseDate()).isEqualTo(LocalDate.now());
        assertThat(result.getCurrentState()).isEqualTo(CurrentState.PENDING);
        assertThat(result.getStatus()).isEqualTo(OrderStatus.ACTIVE);

        ArgumentCaptor<OrderModel> captor = ArgumentCaptor.forClass(OrderModel.class);
        verify(repo).save(captor.capture());
        assertThat(captor.getValue().getPackageOrderId()).isEqualTo("NEW-001");
        verify(repo).existsByPackageOrderId("NEW-001");
    }

    @Test
    @DisplayName("createOrder rejects duplicate tracking codes")
    void createOrderRejectsDuplicates() {
        when(repo.existsByPackageOrderId("DUP-001")).thenReturn(true);

        assertThatThrownBy(() -> service.createOrder("bob", "DUP-001", 1000))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("already exists")
                .hasMessageContaining("DUP-001");

        verify(repo, never()).save(any());
    }

    // ---------- getUserHistory ----------

    @Test
    @DisplayName("getUserHistory delegates to the repository")
    void getUserHistoryDelegatesToRepo() {
        List<OrderModel> history = List.of(activeOrder);
        when(repo.findByUsernameOrderByPurchaseDateDesc("alice")).thenReturn(history);

        List<OrderModel> result = service.getUserHistory("alice");

        assertThat(result).isSameAs(history);
        verify(repo).findByUsernameOrderByPurchaseDateDesc("alice");
    }

    // ---------- updateState ----------

    @Test
    @DisplayName("updateState changes state and saves")
    void updateStateHappyPath() {
        when(repo.findById(1L)).thenReturn(Optional.of(activeOrder));
        when(repo.save(activeOrder)).thenReturn(activeOrder);

        OrderModel result = service.updateState(1L, CurrentState.EN_ROUTE);

        assertThat(result.getCurrentState()).isEqualTo(CurrentState.EN_ROUTE);
        verify(repo).save(activeOrder);
    }

    @Test
    @DisplayName("updateState throws when order is missing")
    void updateStateMissingOrder() {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateState(99L, CurrentState.ARRIVED))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found")
                .hasMessageContaining("99");

        verify(repo, never()).save(any());
    }

    // ---------- processRefund ----------

    @Test
    @DisplayName("processRefund flips ACTIVE to REFUNDED")
    void processRefundHappyPath() {
        when(repo.findById(1L)).thenReturn(Optional.of(activeOrder));
        when(repo.save(activeOrder)).thenReturn(activeOrder);

        OrderModel refunded = service.processRefund(1L);

        assertThat(refunded.getStatus()).isEqualTo(OrderStatus.REFUNDED);
        verify(repo).save(activeOrder);
    }

    @Test
    @DisplayName("processRefund rejects double refunds")
    void processRefundAlreadyRefunded() {
        activeOrder.setStatus(OrderStatus.REFUNDED);
        when(repo.findById(1L)).thenReturn(Optional.of(activeOrder));

        assertThatThrownBy(() -> service.processRefund(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("already been refunded");

        verify(repo, never()).save(any());
    }

    @Test
    @DisplayName("processRefund throws when order is missing")
    void processRefundMissingOrder() {
        when(repo.findById(42L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.processRefund(42L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }
}