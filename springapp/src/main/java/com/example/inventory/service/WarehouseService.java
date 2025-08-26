package com.example.inventory.service;

import com.example.inventory.entity.Warehouse;

import java.util.List;
import java.util.Optional;

public interface WarehouseService {
    Warehouse createWarehouse(Warehouse warehouse);
    Optional<Warehouse> getWarehouseById(Long id);
    List<Warehouse> getAllWarehouses();
    void deleteWarehouseById(Long id);
    Warehouse updateWarehouse(Long id, Warehouse warehouse);
}
