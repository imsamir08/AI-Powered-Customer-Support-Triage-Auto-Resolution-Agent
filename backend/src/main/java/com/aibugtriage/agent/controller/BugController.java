package com.aibugtriage.agent.controller;

import com.aibugtriage.agent.dto.*;
import com.aibugtriage.agent.model.Priority;
import com.aibugtriage.agent.model.Status;
import com.aibugtriage.agent.service.BugService;
import com.aibugtriage.agent.service.TriageService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bugs")
@CrossOrigin(origins = "http://localhost:5173")
public class BugController {

    private final BugService bugService;
    private final TriageService triageService;

    public BugController(BugService bugService, TriageService triageService) {
        this.bugService = bugService;
        this.triageService = triageService;
    }

    @PostMapping
    public ResponseEntity<BugResponse> createBug(@Valid @RequestBody CreateBugRequest request,
                                                 Authentication authentication) {
        String reporterUsername = (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName()))
                ? authentication.getName()
                : "system";
        return ResponseEntity.ok(bugService.createBug(request, reporterUsername));
    }

    // Handles frontend submitTriagePrompt call (/api/bugs/triage)
    @PostMapping("/triage")
    public ResponseEntity<BugResponse> triageBugPrompt(@RequestBody Map<String, String> payload,
                                                        Authentication authentication) {
        String prompt = payload != null ? payload.get("prompt") : "";
        String reporterUsername = (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName()))
                ? authentication.getName()
                : "system";

        String title = (prompt != null && prompt.trim().length() > 50)
                ? prompt.trim().substring(0, 47) + "..."
                : (prompt != null && !prompt.trim().isEmpty() ? prompt.trim() : "AI Triaged Issue");

        String description = (prompt != null) ? prompt : "";

        // Pass through AI triage service
        try {
            TriageRequest triageRequest = new TriageRequest();
            triageRequest.setPrompt(prompt);
            TriageResponse triageResponse = triageService.processPrompt(triageRequest);
            if (triageResponse != null && triageResponse.getRootCauseAnalysis() != null && !"N/A".equals(triageResponse.getRootCauseAnalysis())) {
                description = description + "\n\nRoot Cause Analysis:\n" + triageResponse.getRootCauseAnalysis();
                if (triageResponse.getSuggestedFix() != null && !"N/A".equals(triageResponse.getSuggestedFix())) {
                    description = description + "\n\nSuggested Fix:\n" + triageResponse.getSuggestedFix();
                }
            }
        } catch (Exception e) {
            // Gracefully continue with direct issue creation if AI LLM fails
        }

        CreateBugRequest request = new CreateBugRequest();
        request.setTitle(title);
        request.setDescription(description);
        request.setStatus(Status.OPEN);
        request.setPriority(Priority.MEDIUM);

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

    // Supports both /api/bugs/stats and /api/bugs/analytics/overview
    @GetMapping({"/stats", "/analytics/overview"})
    public ResponseEntity<BugStatsResponse> getBugStats() {
        return ResponseEntity.ok(bugService.getBugStats());
    }
}