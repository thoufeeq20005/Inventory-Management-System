package com.example.inventory.service.impl;

import com.example.inventory.entity.Product;
import com.example.inventory.entity.Supplier;
import com.example.inventory.repository.ProductRepository;
import com.example.inventory.repository.SupplierRepository;
import com.example.inventory.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    
    @Autowired
    public ProductServiceImpl(ProductRepository productRepository, SupplierRepository supplierRepository) {
        this.productRepository = productRepository;
        this.supplierRepository = supplierRepository;
    }

    @Override
    public Product createProduct(Product product) {
        // Attach supplier if provided
        if (product.getSupplier() != null && product.getSupplier().getId() != null) {
            Long supplierId = product.getSupplier().getId();
            Supplier fullSupplier = supplierRepository.findById(supplierId)
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
            product.setSupplier(fullSupplier);
        } else {
            product.setSupplier(null);
        }
        return productRepository.save(product);
    }

    @Override
    public Optional<Product> getProductBySku(String sku) {
        return productRepository.findBySku(sku);
    }

    @Override
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Override
    public void deleteProductById(Long id) {
        productRepository.deleteById(id);
    }
    @Override
public Product updateProduct(Long id, Product updatedProduct) {
    return productRepository.findById(id).map(existingProduct -> {
        existingProduct.setName(updatedProduct.getName());
        existingProduct.setSku(updatedProduct.getSku());
        existingProduct.setDescription(updatedProduct.getDescription());
        existingProduct.setMinStockLevel(updatedProduct.getMinStockLevel());
        existingProduct.setCategory(updatedProduct.getCategory());
        existingProduct.setUnit(updatedProduct.getUnit());
        existingProduct.setPrice(updatedProduct.getPrice());

        if (updatedProduct.getSupplier() != null && updatedProduct.getSupplier().getId() != null) {
            Supplier supplier = supplierRepository.findById(updatedProduct.getSupplier().getId())
                    .orElseThrow(() -> new RuntimeException("Supplier not found"));
            existingProduct.setSupplier(supplier);
        } else {
            existingProduct.setSupplier(null);
        }

        return productRepository.save(existingProduct);
    }).orElseThrow(() -> new RuntimeException("Product not found with id " + id));
}

}
