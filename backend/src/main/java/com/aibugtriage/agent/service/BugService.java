package com.aibugtriage.agent.service;

import com.aibugtriage.agent.dto.*;
import com.aibugtriage.agent.model.*;
import com.aibugtriage.agent.repository.BugRepository;
import com.aibugtriage.agent.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BugService {

    private final BugRepository bugRepository;
    private final UserRepository userRepository;

    public BugService(BugRepository bugRepository, UserRepository userRepository) {
        this.bugRepository = bugRepository;
        this.userRepository = userRepository;
    }

    public BugResponse createBug(CreateBugRequest request, String reporterUsername) {
        User reporter = userRepository.findByUsername(reporterUsername)
                .or(() -> userRepository.findByEmail(reporterUsername))
                .orElseGet(() -> userRepository.findAll().stream().findFirst().orElse(null));

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElse(null);
        }

        Bug bug = Bug.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM)
                .status(request.getStatus() != null ? request.getStatus() : Status.OPEN)
                .reporter(reporter)
                .assignee(assignee)
                .build();

        Bug savedBug = bugRepository.save(bug);
        return mapToResponse(savedBug);
    }

    public List<BugResponse> getAllBugs(Status status, Priority priority) {
        List<Bug> bugs;
        if (status != null) {
            bugs = bugRepository.findByStatus(status);
        } else if (priority != null) {
            bugs = bugRepository.findByPriority(priority);
        } else {
            bugs = bugRepository.findAll();
        }
        return bugs.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public BugResponse getBugById(Long id) {
        Bug bug = bugRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bug not found with id: " + id));
        return mapToResponse(bug);
    }

    public BugResponse updateBug(Long id, UpdateBugRequest request) {
        Bug bug = bugRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bug not found with id: " + id));

        if (request.getTitle() != null) bug.setTitle(request.getTitle());
        if (request.getDescription() != null) bug.setDescription(request.getDescription());
        if (request.getStatus() != null) bug.setStatus(request.getStatus());
        if (request.getPriority() != null) bug.setPriority(request.getPriority());

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId()).orElse(null);
            bug.setAssignee(assignee);
        }

        Bug updatedBug = bugRepository.save(bug);
        return mapToResponse(updatedBug);
    }

    public void deleteBug(Long id) {
        if (!bugRepository.existsById(id)) {
            throw new RuntimeException("Bug not found with id: " + id);
        }
        bugRepository.deleteById(id);
    }

    public BugStatsResponse getBugStats() {
        long total = bugRepository.count();
        long open = bugRepository.countByStatus(Status.OPEN);
        long inProgress = bugRepository.countByStatus(Status.IN_PROGRESS);
        long resolved = bugRepository.countByStatus(Status.RESOLVED);
        long closed = bugRepository.countByStatus(Status.CLOSED);
        long critical = bugRepository.findByPriority(Priority.CRITICAL).size();

        return new BugStatsResponse(total, open, inProgress, resolved, closed, critical);
    }

    public BugResponse mapToResponse(Bug bug) {
        return BugResponse.builder()
                .id(bug.getId())
                .title(bug.getTitle())
                .description(bug.getDescription())
                .status(bug.getStatus())
                .priority(bug.getPriority())
                .reporterUsername(bug.getReporter() != null ? bug.getReporter().getUsername() : null)
                .assigneeUsername(bug.getAssignee() != null ? bug.getAssignee().getUsername() : null)
                .createdAt(bug.getCreatedAt())
                .updatedAt(bug.getUpdatedAt())
                .build();
    }
}