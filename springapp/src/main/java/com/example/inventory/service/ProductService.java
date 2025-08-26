package com.example.inventory.service;

import com.example.inventory.entity.Product;

import java.util.List;
import java.util.Optional;

public interface ProductService {
    Product createProduct(Product product);
    Product updateProduct(Long id, Product updatedProduct);
    Optional<Product> getProductBySku(String sku);
    Optional<Product> getProductById(Long id);
    List<Product> getAllProducts();
    void deleteProductById(Long id);
}
