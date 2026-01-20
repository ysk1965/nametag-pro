package com.nametagpro.repository;

import com.nametagpro.entity.Roster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RosterRepository extends JpaRepository<Roster, UUID> {

    Optional<Roster> findByProjectId(UUID projectId);

    void deleteByProjectId(UUID projectId);
}
