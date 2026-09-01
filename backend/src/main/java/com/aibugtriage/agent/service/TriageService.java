package com.aibugtriage.agent.service;

import com.aibugtriage.agent.dto.TriageRequest;
import com.aibugtriage.agent.dto.TriageResponse;
import com.aibugtriage.agent.model.Bug;
import com.aibugtriage.agent.model.TriageLog;
import com.aibugtriage.agent.repository.BugRepository;
import com.aibugtriage.agent.repository.TriageLogRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TriageService {

    private final ChatClient chatClient;
    private final TriageLogRepository triageLogRepository;
    private final BugRepository bugRepository;

    public TriageService(ChatClient.Builder chatClientBuilder,
                          TriageLogRepository triageLogRepository,
                          BugRepository bugRepository) {
        this.chatClient = chatClientBuilder.build();
        this.triageLogRepository = triageLogRepository;
        this.bugRepository = bugRepository;
    }

    public TriageResponse processPrompt(TriageRequest request) {
        // System instructions to guide tool usage and structured output formatting
        String systemMessage = """
                You are an expert AI Bug Triage Agent.
                Your task is to analyze developer queries, invoke available tools when appropriate, 
                and assist in managing and diagnosing software bugs.

                Available Tools:
                - createBugTool: Creates a new bug ticket.
                - searchBugsTool: Searches bugs by status or priority.
                - getBugStatsTool: Returns bug counts and statistics.
                - analyzeBugTool: Retrives details for a single bug.
                - resolveBugTool: Marks a bug as RESOLVED.

                When asked to analyze or fix a bug, provide a clear 'Root Cause Analysis' 
                and a concrete 'Suggested Fix' in your output response.
                """;

        String aiResponse = chatClient.prompt()
                .system(systemMessage)
                .user(request.getPrompt())
                .functions("createBugTool", "searchBugsTool", "getBugStatsTool", "analyzeBugTool", "resolveBugTool")
                .call()
                .content();

        // Extract potential root cause & fix annotations if present
        String rootCause = extractSection(aiResponse, "Root Cause Analysis:");
        String suggestedFix = extractSection(aiResponse, "Suggested Fix:");

        Bug referencedBug = null;
        if (request.getBugId() != null) {
            referencedBug = bugRepository.findById(request.getBugId()).orElse(null);
        }

        // Persist execution log
        TriageLog log = TriageLog.builder()
                .bug(referencedBug)
                .userPrompt(request.getPrompt())
                .rootCauseAnalysis(rootCause != null ? rootCause : "N/A")
                .suggestedFix(suggestedFix != null ? suggestedFix : "N/A")
                .executedTool("AUTO_DETECTED")
                .build();

        TriageLog savedLog = triageLogRepository.save(log);

        return TriageResponse.builder()
                .logId(savedLog.getId())
                .userPrompt(request.getPrompt())
                .agentResponse(aiResponse)
                .rootCauseAnalysis(savedLog.getRootCauseAnalysis())
                .suggestedFix(savedLog.getSuggestedFix())
                .executedTool(savedLog.getExecutedTool())
                .timestamp(savedLog.getTimestamp() != null ? savedLog.getTimestamp() : LocalDateTime.now())
                .build();
    }

    public List<TriageLog> getLogsForBug(Long bugId) {
        return triageLogRepository.findByBugId(bugId);
    }

    private String extractSection(String content, String header) {
        if (content == null || !content.contains(header)) {
            return null;
        }
        int start = content.indexOf(header) + header.length();
        int end = content.indexOf("\n\n", start);
        return end != -1 ? content.substring(start, end).trim() : content.substring(start).trim();
    }
}