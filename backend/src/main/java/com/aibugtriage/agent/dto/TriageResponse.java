package com.aibugtriage.agent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TriageResponse {
    private Long logId;
    private String userPrompt;
    private String agentResponse;
    private String rootCauseAnalysis;
    private String suggestedFix;
    private String executedTool;
    private LocalDateTime timestamp;
}