package com.aibugtriage.agent.repository;

import com.aibugtriage.agent.model.Bug;
import org.springframework.data.jpa.repository.JpaRepository;
import com.aibugtriage.agent.model.Status;
import com.aibugtriage.agent.model.Priority;

import java.util.List;

public interface BugRepository extends JpaRepository<Bug, Long> {
    List<Bug> findByStatus(Status status);
    List<Bug> findByPriority(Priority priority);
    long countByStatus(Status status);
}
