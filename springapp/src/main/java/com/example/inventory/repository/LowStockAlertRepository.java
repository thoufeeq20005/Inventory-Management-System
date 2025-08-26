package com.example.inventory.repository;

import com.example.inventory.entity.LowStockAlert;
import com.example.inventory.entity.Product;
import com.example.inventory.entity.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LowStockAlertRepository extends JpaRepository<LowStockAlert, Long> {
	List<LowStockAlert> findByResolvedFalse();
	List<LowStockAlert> findByProductAndWarehouseAndResolved(Product product, Warehouse warehouse, Boolean resolved);
}


