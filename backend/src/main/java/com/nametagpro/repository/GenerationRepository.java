package com.nametagpro.repository;

import com.nametagpro.entity.Generation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GenerationRepository extends JpaRepository<Generation, UUID> {

    List<Generation> findByProjectIdOrderByCreatedAtDesc(UUID projectId);

    Optional<Generation> findByIdAndProjectId(UUID id, UUID projectId);

    // 유저별 PDF 기록 조회 (만료되지 않은 것만)
    @Query("SELECT g FROM Generation g WHERE g.user.id = :userId AND g.expiresAt > :now ORDER BY g.createdAt DESC")
    List<Generation> findByUserIdAndNotExpired(@Param("userId") UUID userId, @Param("now") LocalDateTime now);

    // 유저별 특정 Generation 조회
    Optional<Generation> findByIdAndUserId(UUID id, UUID userId);

    // 만료된 레코드 삭제 (스케줄러용)
    @Modifying
    @Query("DELETE FROM Generation g WHERE g.expiresAt < :now")
    int deleteExpiredRecords(@Param("now") LocalDateTime now);

    // 유저별 총 Generation 개수
    long countByUserId(UUID userId);
}
