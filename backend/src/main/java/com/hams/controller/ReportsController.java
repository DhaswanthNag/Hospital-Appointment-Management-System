package com.hams.controller;

import com.hams.dto.ReportsAnalyticsResponse;
import com.hams.service.ReportsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportsController {

    private final ReportsService reportsService;

    public ReportsController(
            ReportsService reportsService
    ) {
        this.reportsService = reportsService;
    }

    @GetMapping("/analytics")
    public ResponseEntity<ReportsAnalyticsResponse> getAnalytics() {

        return ResponseEntity.ok(
                reportsService.getAnalytics()
        );
    }
}