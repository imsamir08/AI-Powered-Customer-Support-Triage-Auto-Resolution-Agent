package com.aibugtriage.agent.tools;

import com.aibugtriage.agent.dto.*;
import com.aibugtriage.agent.model.Priority;
import com.aibugtriage.agent.model.Status;
import com.aibugtriage.agent.service.BugService;
import com.aibugtriage.agent.tools.ToolDtos.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;

import java.util.List;
import java.util.function.Function;

@Configuration
public class BugTriageTools {

    private final BugService bugService;

    public BugTriageTools(BugService bugService) {
        this.bugService = bugService;
    }

    @Bean
    @Description("Creates a new bug ticket in the repository with a title, description, priority, and status.")
    public Function<CreateBugInput, BugResponse> createBugTool() {
        return input -> {
            CreateBugRequest req = new CreateBugRequest();
            req.setTitle(input.title());
            req.setDescription(input.description());
            req.setPriority(input.priority() != null ? input.priority() : Priority.MEDIUM);
            req.setStatus(input.status() != null ? input.status() : Status.OPEN);
            
            // "AI-Agent" is recorded as the fallback reporter when created via tool execution
            return bugService.createBug(req, "admin");
        };
    }

    @Bean
    @Description("Searches and filters bug tickets by status (e.g., OPEN, RESOLVED) or priority (e.g., CRITICAL, HIGH).")
    public Function<SearchBugsInput, List<BugResponse>> searchBugsTool() {
        return input -> bugService.getAllBugs(input.status(), input.priority());
    }

    @Bean
    @Description("Retrieves overall statistics on total, open, resolved, and critical bugs.")
    public Function<EmptyInput, BugStatsResponse> getBugStatsTool() {
        return input -> bugService.getBugStats();
    }

    @Bean
    @Description("Fetches a bug by ID to inspect its title, description, priority, and status for root cause analysis.")
    public Function<AnalyzeBugInput, BugResponse> analyzeBugTool() {
        return input -> bugService.getBugById(input.bugId());
    }

    @Bean
    @Description("Marks a specific bug as RESOLVED by its bug ID.")
    public Function<ResolveBugInput, BugResponse> resolveBugTool() {
        return input -> {
            UpdateBugRequest req = new UpdateBugRequest();
            req.setStatus(Status.RESOLVED);
            return bugService.updateBug(input.bugId(), req);
        };
    }
}