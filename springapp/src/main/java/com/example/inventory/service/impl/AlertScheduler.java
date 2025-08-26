package com.example.inventory.service.impl;

import com.example.inventory.service.LowStockAlertService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AlertScheduler {

	private final LowStockAlertService lowStockAlertService;

	public AlertScheduler(LowStockAlertService lowStockAlertService) {
		this.lowStockAlertService = lowStockAlertService;
	}

	// Runs every 60 seconds
	@Scheduled(fixedDelay = 60000L, initialDelay = 15000L)
	public void scan() {
		lowStockAlertService.scanAndGenerateAlerts();
	}
}


