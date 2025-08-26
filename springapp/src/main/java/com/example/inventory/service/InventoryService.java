
package com.example.inventory.service;

import com.example.inventory.entity.Inventory;
import com.example.inventory.entity.Product;
import com.example.inventory.entity.Warehouse;

import java.util.List;
import java.util.Optional;

public interface InventoryService {
    Inventory createOrUpdateInventory(Inventory inventory);
    Optional<Inventory> getById(Long id);
    Optional<Inventory> getByProductAndWarehouse(Product product, Warehouse warehouse);
    List<Inventory> getByProduct(Product product);
    List<Inventory> getByWarehouse(Warehouse warehouse);
    List<Inventory> getAll();
    void deleteById(Long id);
}
