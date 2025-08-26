package com.example.inventory.repository;

import com.example.inventory.entity.Inventory;
import com.example.inventory.entity.Product;
import com.example.inventory.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByProductAndWarehouse(Product product, Warehouse warehouse);
    List<Inventory> findByProduct(Product product);
    List<Inventory> findByWarehouse(Warehouse warehouse);
}