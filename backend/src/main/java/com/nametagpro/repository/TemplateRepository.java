package com.nametagpro.repository;

import com.nametagpro.entity.Template;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TemplateRepository extends JpaRepository<Template, UUID> {

    List<Template> findByProjectIdOrderBySortOrderAsc(UUID projectId);

    int countByProjectId(UUID projectId);

    void deleteByProjectId(UUID projectId);
}
