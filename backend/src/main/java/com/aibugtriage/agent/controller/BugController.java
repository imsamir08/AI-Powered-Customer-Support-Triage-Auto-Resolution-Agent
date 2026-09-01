package com.aibugtriage.agent.controller;

import com.aibugtriage.agent.dto.*;
import com.aibugtriage.agent.model.Priority;
import com.aibugtriage.agent.model.Status;
import com.aibugtriage.agent.service.BugService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bugs")
public class BugController {

    private final BugService bugService;

    public BugController(BugService bugService) {
        this.bugService = bugService;
    }

    @PostMapping
    public ResponseEntity<BugResponse> createBug(@Valid @RequestBody CreateBugRequest request,
                                                 Authentication authentication) {
        String reporterUsername = authentication.getName();
        return ResponseEntity.ok(bugService.createBug(request, reporterUsername));
    }

    @GetMapping
    public ResponseEntity<List<BugResponse>> getAllBugs(
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Priority priority) {
        return ResponseEntity.ok(bugService.getAllBugs(status, priority));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BugResponse> getBugById(@PathVariable Long id) {
        return ResponseEntity.ok(bugService.getBugById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BugResponse> updateBug(@PathVariable Long id,
                                                 @RequestBody UpdateBugRequest request) {
        return ResponseEntity.ok(bugService.updateBug(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBug(@PathVariable Long id) {
        bugService.deleteBug(id);
        return ResponseEntity.ok("Bug deleted successfully");
    }

    @GetMapping("/stats")
    public ResponseEntity<BugStatsResponse> getBugStats() {
        return ResponseEntity.ok(bugService.getBugStats());
    }
}