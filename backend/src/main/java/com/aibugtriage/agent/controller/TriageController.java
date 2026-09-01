package com.aibugtriage.agent.controller;

import com.aibugtriage.agent.dto.TriageRequest;
import com.aibugtriage.agent.dto.TriageResponse;
import com.aibugtriage.agent.model.TriageLog;
import com.aibugtriage.agent.service.TriageService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/triage")
public class TriageController {

    private final TriageService triageService;

    public TriageController(TriageService triageService) {
        this.triageService = triageService;
    }

    @PostMapping("/prompt")
    public ResponseEntity<TriageResponse> handlePrompt(@Valid @RequestBody TriageRequest request) {
        return ResponseEntity.ok(triageService.processPrompt(request));
    }

    @GetMapping("/logs/{bugId}")
    public ResponseEntity<List<TriageLog>> getLogsByBug(@PathVariable Long bugId) {
        return ResponseEntity.ok(triageService.getLogsForBug(bugId));
    }
}