package com.aibugtriage.agent.dto;

import com.aibugtriage.agent.model.Priority;
import com.aibugtriage.agent.model.Status;
import lombok.Data;

@Data
public class UpdateBugRequest {
    private String title;
    private String description;
    private Status status;
    private Priority priority;
    private Long assigneeId;
}