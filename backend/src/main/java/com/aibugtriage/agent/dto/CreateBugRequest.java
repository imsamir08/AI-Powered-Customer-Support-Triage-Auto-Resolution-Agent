package com.aibugtriage.agent.dto;

import com.aibugtriage.agent.model.Priority;
import com.aibugtriage.agent.model.Status;
import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateBugRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    @JsonAlias({"rawDescription", "description"})
    private String description;

    private Priority priority; // Optional: defaults to MEDIUM if null
    private Status status;     // Optional: defaults to OPEN if null

    @JsonAlias({"assignedToId", "assigneeId"})
    private Long assigneeId;   // Optional
}