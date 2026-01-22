package com.nametagpro.controller;

import com.nametagpro.dto.request.PdfGenerateRequest;
import com.nametagpro.dto.response.PdfGenerateResponse;
import com.nametagpro.dto.response.PdfRecordResponse;
import com.nametagpro.exception.AuthException;
import com.nametagpro.service.PdfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pdf")
@RequiredArgsConstructor
public class PdfController {

    private final PdfService pdfService;

    /**
     * PDF 생성 (로그인 유저 전용)
     * - JSON 데이터를 저장하고 Generation 레코드 생성
     * - 실제 PDF는 다운로드 시점에 재생성
     */
    @PostMapping("/generate")
    public ResponseEntity<PdfGenerateResponse> generatePdf(
            @Valid @RequestBody PdfGenerateRequest request) {
        UUID userId = getAuthenticatedUserId();
        if (userId == null) {
            throw new AuthException("로그인이 필요합니다");
        }

        PdfGenerateResponse response = pdfService.generatePdf(userId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 내 PDF 기록 목록 조회
     */
    @GetMapping("/records")
    public ResponseEntity<List<PdfRecordResponse>> getMyPdfRecords() {
        UUID userId = getAuthenticatedUserId();
        if (userId == null) {
            throw new AuthException("로그인이 필요합니다");
        }

        List<PdfRecordResponse> records = pdfService.getUserPdfRecords(userId);
        return ResponseEntity.ok(records);
    }

    /**
     * PDF 다운로드 (재생성)
     */
    @GetMapping("/{generationId}/download")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable UUID generationId) {
        UUID userId = getAuthenticatedUserId();
        if (userId == null) {
            throw new AuthException("로그인이 필요합니다");
        }

        byte[] pdfBytes = pdfService.downloadPdf(userId, generationId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"nametag.pdf\"")
                .body(pdfBytes);
    }

    /**
     * PDF 기록 삭제
     */
    @DeleteMapping("/{generationId}")
    public ResponseEntity<Void> deletePdfRecord(@PathVariable UUID generationId) {
        UUID userId = getAuthenticatedUserId();
        if (userId == null) {
            throw new AuthException("로그인이 필요합니다");
        }

        pdfService.deletePdfRecord(userId, generationId);
        return ResponseEntity.noContent().build();
    }

    private UUID getAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UUID) {
            return (UUID) auth.getPrincipal();
        }
        return null;
    }
}
