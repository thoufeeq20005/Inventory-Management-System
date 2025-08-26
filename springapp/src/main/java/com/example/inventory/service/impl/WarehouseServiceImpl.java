package com.example.inventory.service.impl;

import com.example.inventory.entity.Warehouse;
import com.example.inventory.repository.WarehouseRepository;
import com.example.inventory.service.WarehouseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WarehouseServiceImpl implements WarehouseService {

    @Autowired
    private final WarehouseRepository warehouseRepository;

    public WarehouseServiceImpl(WarehouseRepository warehouseRepository) {
        this.warehouseRepository = warehouseRepository;
    }

    @Override
    public Warehouse createWarehouse(Warehouse warehouse) {
        return warehouseRepository.save(warehouse);
    }

    @Override
    public Optional<Warehouse> getWarehouseById(Long id) {
        return warehouseRepository.findById(id);
    }

    @Override
    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
    }

    @Override
    public void deleteWarehouseById(Long id) {
        warehouseRepository.deleteById(id);
    }

     public Warehouse updateWarehouse(Long id, Warehouse updatedWarehouse) {
        return warehouseRepository.findById(id)
                .map(existingWarehouse -> {
                    existingWarehouse.setName(updatedWarehouse.getName());
                    existingWarehouse.setLocation(updatedWarehouse.getLocation());
                    return warehouseRepository.save(existingWarehouse);
                })
                .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + id));
    }
}
