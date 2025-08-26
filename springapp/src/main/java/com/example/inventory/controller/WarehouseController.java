package com.example.inventory.controller;

import com.example.inventory.entity.Warehouse;
import com.example.inventory.service.WarehouseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
// @CrossOrigin(origins="*")
@RequestMapping("/api/warehouses")
public class WarehouseController {

    @Autowired
    private final WarehouseService warehouseService;

    public WarehouseController(WarehouseService warehouseService) {
        this.warehouseService = warehouseService;
    }

    @PostMapping
    public ResponseEntity<Warehouse> createWarehouse(@RequestBody Warehouse warehouse) {
        Warehouse created = warehouseService.createWarehouse(warehouse);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<Warehouse>> getAllWarehouses() {
        return ResponseEntity.ok(warehouseService.getAllWarehouses());
    }

    // Get all warehouses for dropdown selection
    @GetMapping("/dropdown")
    public ResponseEntity<List<Map<String, Object>>> getWarehousesForDropdown() {
        List<Warehouse> warehouses = warehouseService.getAllWarehouses();
        List<Map<String, Object>> dropdownData = warehouses.stream()
                .map(warehouse -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("id", warehouse.getId());
                    data.put("name", warehouse.getName());
                    data.put("location", warehouse.getLocation());
                    return data;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(dropdownData);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Warehouse> getWarehouseById(@PathVariable Long id) {
        return warehouseService.getWarehouseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWarehouse(@PathVariable Long id) {
        warehouseService.deleteWarehouseById(id);
        return ResponseEntity.noContent().build();
    }

     // ✅ PUT (Update)
    @PutMapping("/{id}")
    public ResponseEntity<Warehouse> updateWarehouse(@PathVariable Long id, @RequestBody Warehouse warehouse) {
        try {
            Warehouse updated = warehouseService.updateWarehouse(id, warehouse);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
