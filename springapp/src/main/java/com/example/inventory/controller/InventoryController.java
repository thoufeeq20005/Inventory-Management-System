package com.example.inventory.controller;

import com.example.inventory.entity.Inventory;
import com.example.inventory.entity.StockHistory;
import com.example.inventory.util.StockAdjustmentType;
import com.example.inventory.repository.InventoryRepository;
import com.example.inventory.repository.ProductRepository;
import com.example.inventory.repository.WarehouseRepository;
import com.example.inventory.repository.StockHistoryRepository;
import com.example.inventory.service.InventoryService;
import com.example.inventory.service.ProductService;
import com.example.inventory.service.WarehouseService;
import com.example.inventory.service.StockHistoryService;
import com.example.inventory.entity.Product;
import com.example.inventory.entity.Warehouse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {
    
    private final InventoryService inventoryService;
    private final ProductService productService;
    private final WarehouseService warehouseService;
    private final StockHistoryService stockHistoryService;

    public InventoryController(InventoryService inventoryService,
                               ProductService productService,
                               WarehouseService warehouseService,
                               StockHistoryService stockHistoryService) {
        this.inventoryService = inventoryService;
        this.productService = productService;
        this.warehouseService = warehouseService;
        this.stockHistoryService = stockHistoryService;
    }

    // Create inventory
    @PostMapping
    public ResponseEntity<Inventory> createInventory(@RequestBody Inventory inventory) {
        Inventory saved = inventoryService.createOrUpdateInventory(inventory);
        return ResponseEntity.ok(saved);
    }

    // Get all inventory
    @GetMapping
    public ResponseEntity<List<Inventory>> getAll() {
        return ResponseEntity.ok(inventoryService.getAll());
    }

    // Get inventory by id
    @GetMapping("/{id}")
    public ResponseEntity<Inventory> getById(@PathVariable Long id) {
        return inventoryService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get inventory by product
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Inventory>> getByProduct(@PathVariable Long productId) {
        return productService.getProductById(productId)
                .map(inventoryService::getByProduct)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get inventory by warehouse
    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<List<Inventory>> getByWarehouse(@PathVariable Long warehouseId) {
        return warehouseService.getWarehouseById(warehouseId)
                .map(inventoryService::getByWarehouse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete inventory
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        inventoryService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Stock adjustment request DTO
    public static class StockAdjustmentRequest {
        public Long productId;
        public Long warehouseId;
        public Integer quantity;
        public String performedByEmail;
    }

    // Record Stock-In
    @PostMapping("/stock-in")
    public ResponseEntity<?> stockIn(@RequestBody StockAdjustmentRequest request) {
        try {
            if (request.quantity == null || request.quantity <= 0) {
                return ResponseEntity.badRequest().body("Quantity must be a positive number");
            }
            
            if (request.performedByEmail == null || request.performedByEmail.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Employee email is required");
            }

            Inventory updatedInventory = stockHistoryService.recordStockIn(
                request.productId, 
                request.warehouseId, 
                request.quantity, 
                request.performedByEmail.trim()
            );

            return ResponseEntity.ok(updatedInventory);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }

    // Record Stock-Out
    @PostMapping("/stock-out")
    public ResponseEntity<?> stockOut(@RequestBody StockAdjustmentRequest request) {
        try {
            if (request.quantity == null || request.quantity <= 0) {
                return ResponseEntity.badRequest().body("Quantity must be a positive number");
            }
            
            if (request.performedByEmail == null || request.performedByEmail.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Employee email is required");
            }

            Inventory updatedInventory = stockHistoryService.recordStockOut(
                request.productId, 
                request.warehouseId, 
                request.quantity, 
                request.performedByEmail.trim()
            );

            return ResponseEntity.ok(updatedInventory);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Insufficient stock")) {
                return ResponseEntity.status(409).body(e.getMessage());
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Internal server error: " + e.getMessage());
        }
    }

    // Get stock history
    @GetMapping("/history")
    public ResponseEntity<List<StockHistory>> getStockHistory() {
        List<StockHistory> history = stockHistoryService.getAllStockHistory();
        return ResponseEntity.ok(history);
    }

    // Get stock history by product
    @GetMapping("/history/product/{productId}")
    public ResponseEntity<List<StockHistory>> getStockHistoryByProduct(@PathVariable Long productId) {
        try {
            Product product = productService.getProductById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            List<StockHistory> history = stockHistoryService.getStockHistoryByProduct(product);
            return ResponseEntity.ok(history);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Get stock history by warehouse
    @GetMapping("/history/warehouse/{warehouseId}")
    public ResponseEntity<List<StockHistory>> getStockHistoryByWarehouse(@PathVariable Long warehouseId) {
        try {
            Warehouse warehouse = warehouseService.getWarehouseById(warehouseId)
                    .orElseThrow(() -> new RuntimeException("Warehouse not found"));
            List<StockHistory> history = stockHistoryService.getStockHistoryByWarehouse(warehouse);
            return ResponseEntity.ok(history);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
