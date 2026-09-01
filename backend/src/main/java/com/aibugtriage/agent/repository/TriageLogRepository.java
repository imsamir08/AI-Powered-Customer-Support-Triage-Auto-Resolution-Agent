package com.aibugtriage.agent.repository;

import com.aibugtriage.agent.model.TriageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TriageLogRepository extends JpaRepository<TriageLog, Long> {
    List<TriageLog> findByBugId(Long bugId);
}
