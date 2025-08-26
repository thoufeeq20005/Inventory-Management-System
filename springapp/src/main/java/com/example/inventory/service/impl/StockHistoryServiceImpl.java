package com.example.inventory.service.impl;

import com.example.inventory.entity.Inventory;
import com.example.inventory.entity.Product;
import com.example.inventory.entity.StockHistory;
import com.example.inventory.entity.Warehouse;
import com.example.inventory.repository.InventoryRepository;
import com.example.inventory.repository.ProductRepository;
import com.example.inventory.repository.StockHistoryRepository;
import com.example.inventory.repository.WarehouseRepository;
import com.example.inventory.service.StockHistoryService;
import com.example.inventory.service.LowStockAlertService;
import com.example.inventory.util.StockAdjustmentType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class StockHistoryServiceImpl implements StockHistoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final StockHistoryRepository stockHistoryRepository;
    private final LowStockAlertService lowStockAlertService;

    @Autowired
    public StockHistoryServiceImpl(InventoryRepository inventoryRepository,
                                  ProductRepository productRepository,
                                  WarehouseRepository warehouseRepository,
                                  StockHistoryRepository stockHistoryRepository,
                                  LowStockAlertService lowStockAlertService) {
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
        this.warehouseRepository = warehouseRepository;
        this.stockHistoryRepository = stockHistoryRepository;
        this.lowStockAlertService = lowStockAlertService;
    }

    // ========== CRUD Operations ==========

    @Override
    public StockHistory createStockHistory(StockHistory stockHistory) {
        if (stockHistory.getTimestamp() == null) {
            stockHistory.setTimestamp(LocalDateTime.now());
        }
        return stockHistoryRepository.save(stockHistory);
    }

    @Override
    public List<StockHistory> getAllStockHistory() {
        return stockHistoryRepository.findAll();
    }

    @Override
    public Optional<StockHistory> getStockHistoryById(Long id) {
        return stockHistoryRepository.findById(id);
    }

    @Override
    public StockHistory updateStockHistory(Long id, StockHistory stockHistoryDetails) {
        StockHistory existingHistory = stockHistoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock history not found with id: " + id));

        // Update fields
        if (stockHistoryDetails.getProduct() != null) {
            existingHistory.setProduct(stockHistoryDetails.getProduct());
        }
        if (stockHistoryDetails.getWarehouse() != null) {
            existingHistory.setWarehouse(stockHistoryDetails.getWarehouse());
        }
        if (stockHistoryDetails.getAdjustmentType() != null) {
            existingHistory.setAdjustmentType(stockHistoryDetails.getAdjustmentType());
        }
        if (stockHistoryDetails.getAdjustmentQuantity() != null) {
            existingHistory.setAdjustmentQuantity(stockHistoryDetails.getAdjustmentQuantity());
        }
        if (stockHistoryDetails.getPerformedByEmail() != null) {
            existingHistory.setPerformedByEmail(stockHistoryDetails.getPerformedByEmail());
        }
        if (stockHistoryDetails.getTimestamp() != null) {
            existingHistory.setTimestamp(stockHistoryDetails.getTimestamp());
        }

        return stockHistoryRepository.save(existingHistory);
    }

    @Override
    public void deleteStockHistory(Long id) {
        if (!stockHistoryRepository.existsById(id)) {
            throw new RuntimeException("Stock history not found with id: " + id);
        }
        stockHistoryRepository.deleteById(id);
    }

    // ========== Business Logic Operations ==========

    @Override
    public Inventory recordStockIn(Long productId, Long warehouseId, Integer quantity, String performedByEmail) {
        // Validate inputs
        if (productId == null || warehouseId == null || quantity == null || quantity <= 0) {
            throw new RuntimeException("Invalid input parameters");
        }

        // Get product and warehouse
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + warehouseId));

        // Find existing inventory or create new one
        Inventory inventory = inventoryRepository.findByProductAndWarehouse(product, warehouse)
                .orElse(new Inventory());

        if (inventory.getId() == null) {
            // New inventory record
            inventory.setProduct(product);
            inventory.setWarehouse(warehouse);
            inventory.setStockLevel(quantity);
        } else {
            // Update existing inventory
            inventory.setStockLevel(inventory.getStockLevel() + quantity);
        }

        // Save inventory
        inventory = inventoryRepository.save(inventory);

        // Create stock history record
        StockHistory stockHistory = new StockHistory();
        stockHistory.setProduct(product);
        stockHistory.setWarehouse(warehouse);
        stockHistory.setAdjustmentType(StockAdjustmentType.ADD);
        stockHistory.setAdjustmentQuantity(quantity);
        stockHistory.setPerformedByEmail(performedByEmail);
        stockHistory.setTimestamp(LocalDateTime.now());

        stockHistoryRepository.save(stockHistory);

        // Check alerts after stock change
        lowStockAlertService.checkInventoryAndAlert(inventory);

        return inventory;
    }

    @Override
    public Inventory recordStockOut(Long productId, Long warehouseId, Integer quantity, String performedByEmail) {
        // Validate inputs
        if (productId == null || warehouseId == null || quantity == null || quantity <= 0) {
            throw new RuntimeException("Invalid input parameters");
        }

        // Get product and warehouse
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + warehouseId));

        // Find existing inventory
        Inventory inventory = inventoryRepository.findByProductAndWarehouse(product, warehouse)
                .orElseThrow(() -> new RuntimeException("No inventory found for this product and warehouse"));

        // Check if sufficient stock is available
        if (inventory.getStockLevel() < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + inventory.getStockLevel() + ", Requested: " + quantity);
        }

        // Update inventory
        inventory.setStockLevel(inventory.getStockLevel() - quantity);
        inventory = inventoryRepository.save(inventory);

        // Create stock history record
        StockHistory stockHistory = new StockHistory();
        stockHistory.setProduct(product);
        stockHistory.setWarehouse(warehouse);
        stockHistory.setAdjustmentType(StockAdjustmentType.REMOVE);
        stockHistory.setAdjustmentQuantity(quantity);
        stockHistory.setPerformedByEmail(performedByEmail);
        stockHistory.setTimestamp(LocalDateTime.now());

        stockHistoryRepository.save(stockHistory);

        // Check alerts after stock change
        lowStockAlertService.checkInventoryAndAlert(inventory);

        return inventory;
    }

    // ========== Query Operations ==========

    @Override
    public List<StockHistory> getStockHistoryByProduct(Product product) {
        return stockHistoryRepository.findByProduct(product);
    }

    @Override
    public List<StockHistory> getStockHistoryByWarehouse(Warehouse warehouse) {
        return stockHistoryRepository.findByWarehouse(warehouse);
    }

    @Override
    public List<StockHistory> getStockHistoryByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return stockHistoryRepository.findByTimestampBetween(startDate, endDate);
    }

    @Override
    public List<StockHistory> getStockHistoryByAdjustmentType(StockAdjustmentType adjustmentType) {
        return stockHistoryRepository.findByAdjustmentType(adjustmentType);
    }

    @Override
    public List<StockHistory> getStockHistoryByPerformedByEmail(String email) {
        return stockHistoryRepository.findByPerformedByEmail(email);
    }

    @Override
    public List<StockHistory> getStockHistoryByProductAndWarehouse(Long productId, Long warehouseId) {
        return stockHistoryRepository.findByProductIdAndWarehouseId(productId, warehouseId);
    }
}
