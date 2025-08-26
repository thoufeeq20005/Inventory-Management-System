package com.example.inventory.service;

import com.example.inventory.entity.Inventory;
import com.example.inventory.entity.LowStockAlert;
import com.example.inventory.entity.Product;
import com.example.inventory.entity.Warehouse;

import java.util.List;

public interface LowStockAlertService {
	LowStockAlert createAlert(Product product, Warehouse warehouse, int currentStock, Integer minStockLevel, String message);
	void resolveAlert(Long alertId);
	void resolveAlertsFor(Product product, Warehouse warehouse);
	List<LowStockAlert> getActiveAlerts();
	List<LowStockAlert> getAllAlerts();

	// Scans all inventory rows and creates alerts as needed
	void scanAndGenerateAlerts();

	// Checks a specific inventory row after change
	void checkInventoryAndAlert(Inventory inventory);
}


