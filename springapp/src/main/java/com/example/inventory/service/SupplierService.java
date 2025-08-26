package com.example.inventory.service;

import com.example.inventory.entity.Supplier;

import java.util.List;
import java.util.Optional;

public interface SupplierService {
    Supplier createSupplier(Supplier supplier);
    Supplier updateSupplier(Long id, Supplier updatedSupplier);
    Optional<Supplier> getSupplierByName(String name);
    Optional<Supplier> getSupplierById(Long id);
    List<Supplier> getAllSuppliers();
    void deleteSupplierById(Long id);
}
