package com.example.inventory.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "low_stock_alerts", uniqueConstraints = {
		@UniqueConstraint(columnNames = {"product_id", "warehouse_id", "resolved"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LowStockAlert {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(optional = false)
	@JoinColumn(name = "product_id")
	private Product product;

	@ManyToOne(optional = false)
	@JoinColumn(name = "warehouse_id")
	private Warehouse warehouse;

	@Column(nullable = false)
	private Integer currentStock;

	@Column
	private Integer minStockLevel;

	@Column(nullable = false)
	private Boolean resolved;

	@Column(nullable = false)
	private LocalDateTime createdAt;

	@Column
	private LocalDateTime resolvedAt;

	@Column(length = 255)
	private String message;
}


