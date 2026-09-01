package com.aibugtriage.agent.dto;

import com.aibugtriage.agent.model.Priority;
import com.aibugtriage.agent.model.Status;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BugResponse {
    private Long id;
    private String title;
    private String description;
    private Status status;
    private Priority priority;
    private String reporterUsername;
    private String assigneeUsername;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}