package com.example.inventory.service.impl;

import com.example.inventory.entity.Supplier;
import com.example.inventory.repository.SupplierRepository;
import com.example.inventory.service.SupplierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    @Autowired

    public SupplierServiceImpl(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    @Override
    public Supplier createSupplier(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    @Override
    public Optional<Supplier> getSupplierByName(String name) {
        return supplierRepository.findByName(name);
    }

    @Override
    public Optional<Supplier> getSupplierById(Long id) {
        return supplierRepository.findById(id);
    }

    @Override
    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    @Override
    public void deleteSupplierById(Long id) {
        supplierRepository.deleteById(id);
    }
    @Override
    public Supplier updateSupplier(Long id, Supplier updatedSupplier) {
    return supplierRepository.findById(id)
        .map(existingSupplier -> {
            existingSupplier.setName(updatedSupplier.getName());
            existingSupplier.setContactPerson(updatedSupplier.getContactPerson());
            existingSupplier.setEmail(updatedSupplier.getEmail());
            existingSupplier.setPhone(updatedSupplier.getPhone());
            existingSupplier.setAddress(updatedSupplier.getAddress());
            existingSupplier.setPaymentTerms(updatedSupplier.getPaymentTerms());
            return supplierRepository.save(existingSupplier);
        })
        .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));
}

}
