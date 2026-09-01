package com.aibugtriage.agent.tools;

import com.aibugtriage.agent.model.Priority;
import com.aibugtriage.agent.model.Status;

public class ToolDtos {

    // Input for createBug
    public record CreateBugInput(String title, String description, Priority priority, Status status) {}

    // Input for searchBugs
    public record SearchBugsInput(Status status, Priority priority) {}

    // Input for getBugStats (No arguments needed)
    public record EmptyInput() {}

    // Input for analyzeBug
    public record AnalyzeBugInput(Long bugId) {}

    // Input for resolveBug
    public record ResolveBugInput(Long bugId, String resolutionNotes) {}
}