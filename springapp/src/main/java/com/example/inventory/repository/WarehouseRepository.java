package com.example.inventory.repository;

import com.example.inventory.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    boolean existsByName(String name);
}