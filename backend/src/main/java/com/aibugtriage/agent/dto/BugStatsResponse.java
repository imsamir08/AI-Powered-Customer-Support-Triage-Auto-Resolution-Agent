package com.aibugtriage.agent.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BugStatsResponse {
    private long total;
    private long open;
    private long inProgress;
    private long resolved;
    private long closed;
    private long critical;
}