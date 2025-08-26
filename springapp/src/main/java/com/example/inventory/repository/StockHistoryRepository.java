package com.example.inventory.repository;

import com.example.inventory.entity.StockHistory;
import com.example.inventory.entity.Product;
import com.example.inventory.entity.Warehouse;
import com.example.inventory.util.StockAdjustmentType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface StockHistoryRepository extends JpaRepository<StockHistory, Long> {
    List<StockHistory> findByProduct(Product product);
    List<StockHistory> findByWarehouse(Warehouse warehouse);
    List<StockHistory> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
    List<StockHistory> findByAdjustmentType(StockAdjustmentType adjustmentType);
    List<StockHistory> findByPerformedByEmail(String email);
    List<StockHistory> findByProductIdAndWarehouseId(Long productId, Long warehouseId);
}