package com.example.inventory.controller;

import com.example.inventory.entity.StockHistory;
import com.example.inventory.entity.Product;
import com.example.inventory.entity.Warehouse;
import com.example.inventory.service.StockHistoryService;
import com.example.inventory.service.ProductService;
import com.example.inventory.service.WarehouseService;
import com.example.inventory.util.StockAdjustmentType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/stock-history")
public class StockHistoryController {

    private final StockHistoryService stockHistoryService;
    private final ProductService productService;
    private final WarehouseService warehouseService;

    @Autowired
    public StockHistoryController(StockHistoryService stockHistoryService,
                                 ProductService productService,
                                 WarehouseService warehouseService) {
        this.stockHistoryService = stockHistoryService;
        this.productService = productService;
        this.warehouseService = warehouseService;
    }

    // ========== CRUD Operations ==========

    // Create new stock history record
    @PostMapping
    public ResponseEntity<?> createStockHistory(@RequestBody StockHistory stockHistory) {
        try {
            StockHistory created = stockHistoryService.createStockHistory(stockHistory);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Failed to create stock history: " + e.getMessage()));
        }
    }

    // Get all stock history records
    @GetMapping
    public ResponseEntity<List<StockHistory>> getAllStockHistory() {
        List<StockHistory> history = stockHistoryService.getAllStockHistory();
        return ResponseEntity.ok(history);
    }

    // Get stock history by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getStockHistoryById(@PathVariable Long id) {
        try {
            Optional<StockHistory> history = stockHistoryService.getStockHistoryById(id);
            if (history.isPresent()) {
                return ResponseEntity.ok(history.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve stock history: " + e.getMessage()));
        }
    }

    // Update stock history record
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStockHistory(@PathVariable Long id, @RequestBody StockHistory stockHistoryDetails) {
        try {
            StockHistory updated = stockHistoryService.updateStockHistory(id, stockHistoryDetails);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Failed to update stock history: " + e.getMessage()));
        }
    }

    // Delete stock history record
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStockHistory(@PathVariable Long id) {
        try {
            stockHistoryService.deleteStockHistory(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete stock history: " + e.getMessage()));
        }
    }

    // ========== Query Operations ==========

    // Get stock history by product
    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getStockHistoryByProduct(@PathVariable Long productId) {
        try {
            Product product = productService.getProductById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
            List<StockHistory> history = stockHistoryService.getStockHistoryByProduct(product);
            return ResponseEntity.ok(history);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve stock history: " + e.getMessage()));
        }
    }

    // Get stock history by warehouse
    @GetMapping("/warehouse/{warehouseId}")
    public ResponseEntity<?> getStockHistoryByWarehouse(@PathVariable Long warehouseId) {
        try {
            Warehouse warehouse = warehouseService.getWarehouseById(warehouseId)
                    .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + warehouseId));
            List<StockHistory> history = stockHistoryService.getStockHistoryByWarehouse(warehouse);
            return ResponseEntity.ok(history);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve stock history: " + e.getMessage()));
        }
    }

    // Get stock history by date range
    @GetMapping("/date-range")
    public ResponseEntity<?> getStockHistoryByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            List<StockHistory> history = stockHistoryService.getStockHistoryByDateRange(startDate, endDate);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Failed to retrieve stock history: " + e.getMessage()));
        }
    }

    // Get stock history by adjustment type
    @GetMapping("/type/{adjustmentType}")
    public ResponseEntity<?> getStockHistoryByAdjustmentType(@PathVariable StockAdjustmentType adjustmentType) {
        try {
            List<StockHistory> history = stockHistoryService.getStockHistoryByAdjustmentType(adjustmentType);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve stock history: " + e.getMessage()));
        }
    }

    // Get stock history by employee email
    @GetMapping("/employee/{email}")
    public ResponseEntity<?> getStockHistoryByPerformedByEmail(@PathVariable String email) {
        try {
            List<StockHistory> history = stockHistoryService.getStockHistoryByPerformedByEmail(email);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve stock history: " + e.getMessage()));
        }
    }

    // Get stock history by product and warehouse combination
    @GetMapping("/product/{productId}/warehouse/{warehouseId}")
    public ResponseEntity<?> getStockHistoryByProductAndWarehouse(
            @PathVariable Long productId, @PathVariable Long warehouseId) {
        try {
            List<StockHistory> history = stockHistoryService.getStockHistoryByProductAndWarehouse(productId, warehouseId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve stock history: " + e.getMessage()));
        }
    }

    // ========== Business Logic Operations ==========

    // Record Stock-In (alternative endpoint)
    @PostMapping("/stock-in")
    public ResponseEntity<?> recordStockIn(@RequestBody Map<String, Object> request) {
        try {
            Long productId = Long.valueOf(request.get("productId").toString());
            Long warehouseId = Long.valueOf(request.get("warehouseId").toString());
            Integer quantity = Integer.valueOf(request.get("quantity").toString());
            String performedByEmail = request.get("performedByEmail").toString();

            if (quantity <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Quantity must be a positive number"));
            }

            if (performedByEmail == null || performedByEmail.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Employee email is required"));
            }

            var result = stockHistoryService.recordStockIn(productId, warehouseId, quantity, performedByEmail.trim());
            return ResponseEntity.ok(result);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid numeric values"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    // Record Stock-Out (alternative endpoint)
    @PostMapping("/stock-out")
    public ResponseEntity<?> recordStockOut(@RequestBody Map<String, Object> request) {
        try {
            Long productId = Long.valueOf(request.get("productId").toString());
            Long warehouseId = Long.valueOf(request.get("warehouseId").toString());
            Integer quantity = Integer.valueOf(request.get("quantity").toString());
            String performedByEmail = request.get("performedByEmail").toString();

            if (quantity <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Quantity must be a positive number"));
            }

            if (performedByEmail == null || performedByEmail.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Employee email is required"));
            }

            var result = stockHistoryService.recordStockOut(productId, warehouseId, quantity, performedByEmail.trim());
            return ResponseEntity.ok(result);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid numeric values"));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Insufficient stock")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }
}
