package com.nametagpro.scheduler;

import com.nametagpro.repository.GenerationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class PdfCleanupScheduler {

    private final GenerationRepository generationRepository;

    /**
     * 매일 새벽 3시에 만료된 PDF 레코드 삭제
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupExpiredPdfRecords() {
        log.info("만료된 PDF 기록 정리 시작...");

        try {
            int deletedCount = generationRepository.deleteExpiredRecords(LocalDateTime.now());
            log.info("만료된 PDF 기록 {}건 삭제 완료", deletedCount);
        } catch (Exception e) {
            log.error("PDF 기록 정리 중 오류 발생", e);
        }
    }
}
