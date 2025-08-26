package com.example.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String sku;

    // Optional descriptive fields for catalog management
    private String category;
    private String unit;
    private Double price;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    private Integer minStockLevel;

    public void setQuantity00() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setQuantity00'");
    }

    public void setQuantity(int i) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setQuantity'");
    }
}