package com.example.inventory.service;

import com.example.inventory.entity.StockHistory;
import com.example.inventory.entity.Product;
import com.example.inventory.entity.Warehouse;
import com.example.inventory.entity.Inventory;
import com.example.inventory.util.StockAdjustmentType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface StockHistoryService {
    // CRUD Operations
    StockHistory createStockHistory(StockHistory stockHistory);
    List<StockHistory> getAllStockHistory();
    Optional<StockHistory> getStockHistoryById(Long id);
    StockHistory updateStockHistory(Long id, StockHistory stockHistoryDetails);
    void deleteStockHistory(Long id);
    
    // Business Logic Operations
    Inventory recordStockIn(Long productId, Long warehouseId, Integer quantity, String performedByEmail);
    Inventory recordStockOut(Long productId, Long warehouseId, Integer quantity, String performedByEmail);
    
    // Query Operations
    List<StockHistory> getStockHistoryByProduct(Product product);
    List<StockHistory> getStockHistoryByWarehouse(Warehouse warehouse);
    List<StockHistory> getStockHistoryByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    List<StockHistory> getStockHistoryByAdjustmentType(StockAdjustmentType adjustmentType);
    List<StockHistory> getStockHistoryByPerformedByEmail(String email);
    List<StockHistory> getStockHistoryByProductAndWarehouse(Long productId, Long warehouseId);
}
