package com.example.inventory.entity;

import com.example.inventory.util.StockAdjustmentType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne
    @JoinColumn(name = "warehouse_id")
    private Warehouse warehouse;

    private Integer adjustmentQuantity;

    @Enumerated(EnumType.STRING)
    private StockAdjustmentType adjustmentType;

    private LocalDateTime timestamp;

    // Email or identifier of the employee who performed this action
    private String performedByEmail;
}