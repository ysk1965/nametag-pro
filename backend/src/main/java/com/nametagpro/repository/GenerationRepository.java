package com.nametagpro.repository;

import com.nametagpro.entity.Generation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GenerationRepository extends JpaRepository<Generation, UUID> {

    List<Generation> findByProjectIdOrderByCreatedAtDesc(UUID projectId);

    Optional<Generation> findByIdAndProjectId(UUID id, UUID projectId);
}
