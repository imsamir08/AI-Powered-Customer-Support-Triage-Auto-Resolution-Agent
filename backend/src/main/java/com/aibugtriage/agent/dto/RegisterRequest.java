package com.aibugtriage.agent.dto;

import com.aibugtriage.agent.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    private String username; // Optional from frontend; fallback to email in controller

    private String name;     // Added to capture name sent by client.ts

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    private Role role;
}