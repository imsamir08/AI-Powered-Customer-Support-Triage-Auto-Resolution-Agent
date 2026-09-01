package com.aibugtriage.agent.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class BugStatsResponse {
    private long totalBugs;
    private long openBugs;
    private long inProgressBugs;
    private long resolvedBugs;
    private long closedBugs;
    private long criticalBugs;
}