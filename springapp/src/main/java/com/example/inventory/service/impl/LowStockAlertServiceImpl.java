package com.example.inventory.service.impl;

import com.example.inventory.entity.Inventory;
import com.example.inventory.entity.LowStockAlert;
import com.example.inventory.entity.Product;
import com.example.inventory.entity.Warehouse;
import com.example.inventory.repository.InventoryRepository;
import com.example.inventory.repository.LowStockAlertRepository;
import com.example.inventory.service.LowStockAlertService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class LowStockAlertServiceImpl implements LowStockAlertService {

	private final LowStockAlertRepository lowStockAlertRepository;
	private final InventoryRepository inventoryRepository;

	public LowStockAlertServiceImpl(LowStockAlertRepository lowStockAlertRepository,
									  InventoryRepository inventoryRepository) {
		this.lowStockAlertRepository = lowStockAlertRepository;
		this.inventoryRepository = inventoryRepository;
	}

	@Override
	public LowStockAlert createAlert(Product product, Warehouse warehouse, int currentStock, Integer minStockLevel, String message) {
		// Check if an active alert already exists for this product+warehouse
		List<LowStockAlert> existing = lowStockAlertRepository.findByProductAndWarehouseAndResolved(product, warehouse, false);
		if (!existing.isEmpty()) {
			// Update current stock and message on existing alert
			LowStockAlert alert = existing.get(0);
			alert.setCurrentStock(currentStock);
			alert.setMinStockLevel(minStockLevel);
			alert.setMessage(message);
			return lowStockAlertRepository.save(alert);
		}

		LowStockAlert alert = LowStockAlert.builder()
				.product(product)
				.warehouse(warehouse)
				.currentStock(currentStock)
				.minStockLevel(minStockLevel)
				.resolved(false)
				.createdAt(LocalDateTime.now())
				.message(message)
				.build();
		return lowStockAlertRepository.save(alert);
	}

	@Override
	public void resolveAlert(Long alertId) {
		LowStockAlert alert = lowStockAlertRepository.findById(alertId)
				.orElseThrow(() -> new RuntimeException("Alert not found with id: " + alertId));
		if (!Boolean.TRUE.equals(alert.getResolved())) {
			alert.setResolved(true);
			alert.setResolvedAt(LocalDateTime.now());
			lowStockAlertRepository.save(alert);
		}
	}

	@Override
	public void resolveAlertsFor(Product product, Warehouse warehouse) {
		List<LowStockAlert> existing = lowStockAlertRepository.findByProductAndWarehouseAndResolved(product, warehouse, false);
		for (LowStockAlert alert : existing) {
			alert.setResolved(true);
			alert.setResolvedAt(LocalDateTime.now());
		}
		lowStockAlertRepository.saveAll(existing);
	}

	@Override
	public List<LowStockAlert> getActiveAlerts() {
		return lowStockAlertRepository.findByResolvedFalse();
	}

	@Override
	public List<LowStockAlert> getAllAlerts() {
		return lowStockAlertRepository.findAll();
	}

	@Override
	public void scanAndGenerateAlerts() {
		List<Inventory> all = inventoryRepository.findAll();
		for (Inventory inv : all) {
			checkInventoryAndAlert(inv);
		}
	}

	@Override
	public void checkInventoryAndAlert(Inventory inventory) {
		Integer minLevel = inventory.getProduct() != null ? inventory.getProduct().getMinStockLevel() : null;
		int stock = inventory.getStockLevel() == null ? 0 : inventory.getStockLevel();
		if (minLevel != null && stock < minLevel) {
			String msg = "Low stock: " + (inventory.getProduct() != null ? inventory.getProduct().getName() : "Product")
					+ " @ " + (inventory.getWarehouse() != null ? inventory.getWarehouse().getName() : "Warehouse")
					+ " (" + stock + "/" + minLevel + ")";
			createAlert(inventory.getProduct(), inventory.getWarehouse(), stock, minLevel, msg);
		} else {
			// Resolve any existing alerts if stock recovered
			if (inventory.getProduct() != null && inventory.getWarehouse() != null) {
				resolveAlertsFor(inventory.getProduct(), inventory.getWarehouse());
			}
		}
	}
}


