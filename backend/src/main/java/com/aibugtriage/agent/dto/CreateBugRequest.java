package com.aibugtriage.agent.dto;

import com.aibugtriage.agent.model.Priority;
import com.aibugtriage.agent.model.Status;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateBugRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private Priority priority; // Optional: defaults to MEDIUM if null
    private Status status;     // Optional: defaults to OPEN if null
    private Long assigneeId;   // Optional
}