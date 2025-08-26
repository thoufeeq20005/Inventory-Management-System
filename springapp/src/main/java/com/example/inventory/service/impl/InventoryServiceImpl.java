package com.example.inventory.service.impl;

import com.example.inventory.entity.Inventory;
import com.example.inventory.entity.Product;
import com.example.inventory.entity.Warehouse;
import com.example.inventory.repository.InventoryRepository;
import com.example.inventory.repository.ProductRepository;
import com.example.inventory.repository.WarehouseRepository;
import com.example.inventory.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class InventoryServiceImpl implements InventoryService {

    @Autowired
    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;

    public InventoryServiceImpl(InventoryRepository inventoryRepository,ProductRepository productRepository,WarehouseRepository warehouseRepository) {
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
        this.warehouseRepository = warehouseRepository;
    }

    @Override
    public Inventory createOrUpdateInventory(Inventory inventory) {
        Long productId = inventory.getProduct().getId();
        Long warehouseId = inventory.getWarehouse().getId();

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + warehouseId));

        // Ensure fully loaded entities are set
        inventory.setProduct(product);
        inventory.setWarehouse(warehouse);

        // Optional: Check if already exists (prevent duplicate product+warehouse)
        inventoryRepository.findByProductAndWarehouse(product, warehouse).ifPresent(existing -> {
            throw new RuntimeException("Inventory already exists for this product and warehouse.");
        });

        return inventoryRepository.save(inventory);
    }

    @Override
    public Optional<Inventory> getById(Long id) {
        return inventoryRepository.findById(id);
    }

    @Override
    public Optional<Inventory> getByProductAndWarehouse(Product product, Warehouse warehouse) {
        return inventoryRepository.findByProductAndWarehouse(product, warehouse);
    }

    @Override
    public List<Inventory> getByProduct(Product product) {
        return inventoryRepository.findByProduct(product);
    }

    @Override
    public List<Inventory> getByWarehouse(Warehouse warehouse) {
        return inventoryRepository.findByWarehouse(warehouse);
    }

    @Override
    public List<Inventory> getAll() {
        return inventoryRepository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        inventoryRepository.deleteById(id);
    }
}
