package com.aibugtriage.agent.dto;

import com.aibugtriage.agent.model.Priority;
import com.aibugtriage.agent.model.Status;
import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

@Data
public class UpdateBugRequest {
    private String title;

    @JsonAlias({"rawDescription", "description"})
    private String description;

    private Status status;
    private Priority priority;

    @JsonAlias({"assignedToId", "assigneeId"})
    private Long assigneeId;
}