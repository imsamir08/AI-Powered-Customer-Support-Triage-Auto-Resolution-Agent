package com.aibugtriage.agent.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TriageRequest {
    @NotBlank(message = "Prompt cannot be empty")
    private String prompt;

    private Long bugId; // Optional: provided when referencing a specific bug
}