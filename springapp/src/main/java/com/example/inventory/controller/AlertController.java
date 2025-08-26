package com.example.inventory.controller;

import com.example.inventory.entity.LowStockAlert;
import com.example.inventory.service.LowStockAlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

	private final LowStockAlertService lowStockAlertService;

	public AlertController(LowStockAlertService lowStockAlertService) {
		this.lowStockAlertService = lowStockAlertService;
	}

	@GetMapping("/active")
	public ResponseEntity<List<LowStockAlert>> getActiveAlerts() {
		return ResponseEntity.ok(lowStockAlertService.getActiveAlerts());
	}

	@GetMapping
	public ResponseEntity<List<LowStockAlert>> getAllAlerts() {
		return ResponseEntity.ok(lowStockAlertService.getAllAlerts());
	}

	@PostMapping("/{id}/resolve")
	public ResponseEntity<Void> resolve(@PathVariable Long id) {
		lowStockAlertService.resolveAlert(id);
		return ResponseEntity.noContent().build();
	}
}


