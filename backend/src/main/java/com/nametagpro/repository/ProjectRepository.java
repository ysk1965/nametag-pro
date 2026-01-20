package com.nametagpro.repository;

import com.nametagpro.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    Optional<Project> findBySessionIdAndId(String sessionId, UUID id);

    List<Project> findBySessionIdOrderByCreatedAtDesc(String sessionId);

    void deleteBySessionIdAndCreatedAtBefore(String sessionId, LocalDateTime before);
}
