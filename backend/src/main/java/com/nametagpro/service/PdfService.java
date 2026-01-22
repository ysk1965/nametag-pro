package com.nametagpro.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nametagpro.dto.request.PdfGenerateRequest;
import com.nametagpro.dto.request.PdfGenerateRequest.*;
import com.nametagpro.dto.response.PdfGenerateResponse;
import com.nametagpro.dto.response.PdfRecordResponse;
import com.nametagpro.entity.Generation;
import com.nametagpro.entity.User;
import com.nametagpro.exception.ResourceNotFoundException;
import com.nametagpro.exception.ValidationException;
import com.nametagpro.repository.GenerationRepository;
import com.nametagpro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PdfService {

    private final GenerationRepository generationRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    private static final int MAX_PERSONS = 300;
    private static final int EXPIRY_DAYS = 30;

    // 용지 크기 (mm)
    private static final Map<String, float[]> PAPER_SIZES = Map.of(
            "A4", new float[]{210f, 297f},
            "Letter", new float[]{215.9f, 279.4f}
    );

    // mm to points (1mm = 2.83465 points)
    private static final float MM_TO_POINTS = 2.83465f;

    @Transactional
    public PdfGenerateResponse generatePdf(UUID userId, PdfGenerateRequest request) {
        // 유저 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다"));

        // 검증
        if (request.getPersons().size() > MAX_PERSONS) {
            throw new ValidationException("최대 " + MAX_PERSONS + "명까지만 생성할 수 있습니다");
        }

        // 페이지 수 계산
        ExportConfigData config = request.getExportConfig();
        int[] layout = parseLayout(config.getLayout());
        int cols = layout[0];
        int rows = layout[1];
        int perPage = cols * rows;
        int totalNametags = request.getPersons().size() + calculateBlankPages(request);
        int pageCount = (int) Math.ceil((double) totalNametags / perPage);

        // Generation 레코드 생성 (JSON 데이터 저장)
        Generation generation = Generation.builder()
                .user(user)
                .projectName(request.getProjectName() != null ? request.getProjectName() : "Untitled")
                .pageCount(pageCount)
                .nametagCount(request.getPersons().size())
                .status(Generation.GenerationStatus.COMPLETED)
                .watermarkEnabled(request.getWatermarkEnabled() != null ? request.getWatermarkEnabled() : false)
                .watermarkText(request.getWatermarkText())
                .templateData(toJson(request.getTemplates()))
                .personsData(toJson(request.getPersons()))
                .textFieldsData(toJson(request.getTextFields()))
                .exportConfigData(toJson(request.getExportConfig()))
                .roleMappingsData(toJson(request.getRoleMappings()))
                .roleColorsData(toJson(request.getRoleColors()))
                .expiresAt(LocalDateTime.now().plusDays(EXPIRY_DAYS))
                .build();

        generation = generationRepository.save(generation);

        return PdfGenerateResponse.builder()
                .id(generation.getId())
                .projectName(generation.getProjectName())
                .pageCount(generation.getPageCount())
                .nametagCount(generation.getNametagCount())
                .status(generation.getStatus().name())
                .watermarkEnabled(generation.getWatermarkEnabled())
                .createdAt(generation.getCreatedAt())
                .expiresAt(generation.getExpiresAt())
                .downloadUrl("/api/v1/pdf/" + generation.getId() + "/download")
                .build();
    }

    @Transactional(readOnly = true)
    public List<PdfRecordResponse> getUserPdfRecords(UUID userId) {
        List<Generation> generations = generationRepository.findByUserIdAndNotExpired(userId, LocalDateTime.now());

        return generations.stream()
                .map(this::toRecordResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public byte[] downloadPdf(UUID userId, UUID generationId) {
        Generation generation = generationRepository.findByIdAndUserId(generationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("PDF 기록을 찾을 수 없습니다"));

        if (generation.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ValidationException("만료된 PDF 기록입니다");
        }

        // JSON 데이터에서 PDF 재생성
        try {
            return regeneratePdf(generation);
        } catch (Exception e) {
            log.error("PDF 재생성 실패", e);
            throw new ValidationException("PDF 생성에 실패했습니다: " + e.getMessage());
        }
    }

    @Transactional
    public void deletePdfRecord(UUID userId, UUID generationId) {
        Generation generation = generationRepository.findByIdAndUserId(generationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("PDF 기록을 찾을 수 없습니다"));

        generationRepository.delete(generation);
    }

    /**
     * JSON 데이터에서 PDF 재생성
     */
    private byte[] regeneratePdf(Generation generation) throws IOException {
        // JSON 파싱
        List<TemplateData> templates = fromJson(generation.getTemplateData(),
                objectMapper.getTypeFactory().constructCollectionType(List.class, TemplateData.class));
        List<PersonData> persons = fromJson(generation.getPersonsData(),
                objectMapper.getTypeFactory().constructCollectionType(List.class, PersonData.class));
        List<TextFieldData> textFields = generation.getTextFieldsData() != null ?
                fromJson(generation.getTextFieldsData(),
                        objectMapper.getTypeFactory().constructCollectionType(List.class, TextFieldData.class)) :
                new ArrayList<>();
        ExportConfigData exportConfig = fromJson(generation.getExportConfigData(), ExportConfigData.class);
        Map<String, String> roleMappings = generation.getRoleMappingsData() != null ?
                fromJson(generation.getRoleMappingsData(), Map.class) : new HashMap<>();
        Map<String, String> roleColors = generation.getRoleColorsData() != null ?
                fromJson(generation.getRoleColorsData(), Map.class) : new HashMap<>();

        // PDF 생성
        try (PDDocument document = new PDDocument()) {
            // 용지 크기
            float[] paperSize = PAPER_SIZES.getOrDefault(exportConfig.getPaperSize(), PAPER_SIZES.get("A4"));
            float pageWidth = paperSize[0] * MM_TO_POINTS;
            float pageHeight = paperSize[1] * MM_TO_POINTS;
            float margin = (exportConfig.getMargin() != null ? exportConfig.getMargin() : 10) * MM_TO_POINTS;

            // 레이아웃 계산
            int[] layout = parseLayout(exportConfig.getLayout());
            int cols = layout[0];
            int rows = layout[1];
            int perPage = cols * rows;

            float availableWidth = pageWidth - margin * 2;
            float availableHeight = pageHeight - margin * 2;

            // 그리드 간격
            float gridGap = (exportConfig.getGridGap() != null ? exportConfig.getGridGap() : 0) * MM_TO_POINTS;
            float totalHGaps = gridGap * (cols - 1);
            float totalVGaps = gridGap * (rows - 1);
            float cellWidth = (availableWidth - totalHGaps) / cols;
            float cellHeight = (availableHeight - totalVGaps) / rows;

            // 고정 크기 모드
            boolean useFixedSize = "fixed".equals(exportConfig.getSizeMode());
            float fixedWidth = (exportConfig.getFixedWidth() != null ? exportConfig.getFixedWidth() : 90) * MM_TO_POINTS;
            float fixedHeight = (exportConfig.getFixedHeight() != null ? exportConfig.getFixedHeight() : 55) * MM_TO_POINTS;

            // 템플릿 맵
            Map<String, TemplateData> templateMap = new HashMap<>();
            for (TemplateData t : templates) {
                templateMap.put(t.getId(), t);
            }
            TemplateData defaultTemplate = templates.isEmpty() ? null : templates.get(0);

            // 폰트 로드 (한글 지원)
            PDFont font = loadFont(document);

            // 명찰 렌더링
            int totalItems = persons.size();
            PDPage currentPage = null;
            PDPageContentStream contentStream = null;

            for (int i = 0; i < totalItems; i++) {
                int posIdx = i % perPage;

                // 새 페이지 필요
                if (posIdx == 0) {
                    if (contentStream != null) {
                        // 워터마크 추가
                        if (Boolean.TRUE.equals(generation.getWatermarkEnabled()) && generation.getWatermarkText() != null) {
                            addWatermark(contentStream, font, generation.getWatermarkText(), pageWidth, pageHeight);
                        }
                        contentStream.close();
                    }
                    currentPage = new PDPage(new PDRectangle(pageWidth, pageHeight));
                    document.addPage(currentPage);
                    contentStream = new PDPageContentStream(document, currentPage);
                }

                int col = posIdx % cols;
                int row = posIdx / cols;

                // 셀 위치 계산 (PDF 좌표계는 좌하단이 원점)
                float cellX = margin + col * (cellWidth + gridGap);
                float cellY = pageHeight - margin - (row + 1) * cellHeight - row * gridGap;

                PersonData person = persons.get(i);

                // 템플릿 선택
                TemplateData template = defaultTemplate;
                if (person.getTemplateId() != null && templateMap.containsKey(person.getTemplateId())) {
                    template = templateMap.get(person.getTemplateId());
                }

                if (template == null) continue;

                // 명찰 크기 계산
                float nametagWidth, nametagHeight;
                if (useFixedSize) {
                    nametagWidth = fixedWidth;
                    nametagHeight = fixedHeight;
                } else {
                    float templateAspect = (float) template.getWidth() / template.getHeight();
                    nametagWidth = cellWidth;
                    nametagHeight = cellWidth / templateAspect;
                    if (nametagHeight > cellHeight) {
                        nametagHeight = cellHeight;
                        nametagWidth = cellHeight * templateAspect;
                    }
                }

                // 셀 중앙 배치
                float offsetX = (cellWidth - nametagWidth) / 2;
                float offsetY = (cellHeight - nametagHeight) / 2;
                float x = cellX + offsetX;
                float y = cellY + offsetY;

                // 명찰 이미지 렌더링
                BufferedImage nametagImage = renderNametag(template, person, textFields,
                        (int) (nametagWidth / MM_TO_POINTS * 10), // 픽셀 변환 (대략적)
                        (int) (nametagHeight / MM_TO_POINTS * 10),
                        roleColors);

                if (nametagImage != null) {
                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    ImageIO.write(nametagImage, "PNG", baos);
                    PDImageXObject pdImage = PDImageXObject.createFromByteArray(document, baos.toByteArray(), "nametag");
                    contentStream.drawImage(pdImage, x, y, nametagWidth, nametagHeight);
                }
            }

            // 마지막 페이지 워터마크 및 닫기
            if (contentStream != null) {
                if (Boolean.TRUE.equals(generation.getWatermarkEnabled()) && generation.getWatermarkText() != null) {
                    addWatermark(contentStream, font, generation.getWatermarkText(), pageWidth, pageHeight);
                }
                contentStream.close();
            }

            // PDF 바이트 배열로 변환
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            document.save(output);
            return output.toByteArray();
        }
    }

    /**
     * 명찰 이미지 렌더링 (Java Graphics2D)
     */
    private BufferedImage renderNametag(TemplateData template, PersonData person,
                                         List<TextFieldData> textFields,
                                         int targetWidth, int targetHeight,
                                         Map<String, String> roleColors) {
        try {
            BufferedImage image = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
            Graphics2D g2d = image.createGraphics();

            // 안티앨리어싱
            g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

            // 기본 템플릿인 경우
            if ("default-template".equals(template.getId())) {
                renderDefaultTemplate(g2d, person, textFields, targetWidth, targetHeight, roleColors);
            } else {
                // 커스텀 템플릿: 이미지 로드 후 텍스트 오버레이
                BufferedImage templateImage = loadTemplateImage(template);
                if (templateImage != null) {
                    g2d.drawImage(templateImage, 0, 0, targetWidth, targetHeight, null);
                } else {
                    // 이미지 로드 실패 시 흰 배경
                    g2d.setColor(Color.WHITE);
                    g2d.fillRect(0, 0, targetWidth, targetHeight);
                }

                // 텍스트 필드 렌더링
                renderTextFields(g2d, person, textFields, targetWidth, targetHeight);
            }

            g2d.dispose();
            return image;
        } catch (Exception e) {
            log.error("명찰 렌더링 실패", e);
            return null;
        }
    }

    /**
     * 기본 템플릿 렌더링 (FE와 동일한 스타일)
     */
    private void renderDefaultTemplate(Graphics2D g2d, PersonData person,
                                        List<TextFieldData> textFields,
                                        int width, int height,
                                        Map<String, String> roleColors) {
        // 배경 그라데이션
        GradientPaint gradient = new GradientPaint(0, 0, new Color(248, 250, 252),
                width, height, new Color(226, 232, 240));
        g2d.setPaint(gradient);
        g2d.fillRect(0, 0, width, height);

        // 내부 카드 영역
        int padding = (int) (Math.min(width, height) * 0.03);
        int cardX = padding;
        int cardY = padding;
        int cardWidth = width - padding * 2;
        int cardHeight = height - padding * 2;
        int borderRadius = (int) (Math.min(cardWidth, cardHeight) * 0.05);

        // 카드 배경
        g2d.setColor(Color.WHITE);
        g2d.fillRoundRect(cardX, cardY, cardWidth, cardHeight, borderRadius, borderRadius);

        // 카드 테두리
        g2d.setColor(new Color(203, 213, 225));
        g2d.setStroke(new BasicStroke(2));
        g2d.drawRoundRect(cardX, cardY, cardWidth, cardHeight, borderRadius, borderRadius);

        // 상단 헤더
        int headerHeight = (int) (cardHeight * 0.22);
        Color headerColor = new Color(59, 130, 246); // 기본 파란색
        g2d.setColor(headerColor);
        g2d.fillRoundRect(cardX, cardY, cardWidth, headerHeight, borderRadius, borderRadius);
        // 하단 직각 부분 채우기
        g2d.fillRect(cardX, cardY + headerHeight - borderRadius, cardWidth, borderRadius);

        // 헤더 텍스트
        int headerFontSize = (int) Math.min(cardWidth * 0.08, headerHeight * 0.5);
        g2d.setFont(new Font("SansSerif", Font.BOLD, headerFontSize));
        g2d.setColor(Color.WHITE);
        FontMetrics fm = g2d.getFontMetrics();
        String headerText = "NAME TAG";
        int textX = cardX + (cardWidth - fm.stringWidth(headerText)) / 2;
        int textY = cardY + (headerHeight + fm.getAscent() - fm.getDescent()) / 2;
        g2d.drawString(headerText, textX, textY);

        // 텍스트 필드 렌더링
        renderTextFields(g2d, person, textFields, width, height);
    }

    /**
     * 텍스트 필드 렌더링
     */
    private void renderTextFields(Graphics2D g2d, PersonData person,
                                   List<TextFieldData> textFields,
                                   int width, int height) {
        if (textFields == null || person.getData() == null) return;

        for (TextFieldData field : textFields) {
            String text = person.getData().get(field.getColumn());
            if (text == null || text.isEmpty()) continue;

            StyleData style = field.getStyle();
            int fontStyle = (style.getFontWeight() != null && style.getFontWeight() >= 700) ? Font.BOLD : Font.PLAIN;
            int fontSize = style.getFontSize() != null ? style.getFontSize() : 16;

            g2d.setFont(new Font("SansSerif", fontStyle, fontSize));
            g2d.setColor(parseColor(style.getColor()));

            PositionData pos = field.getPosition();
            int x = (int) (width * pos.getX() / 100);
            int y = (int) (height * pos.getY() / 100);

            // 중앙 정렬
            FontMetrics fm = g2d.getFontMetrics();
            x -= fm.stringWidth(text) / 2;
            y += fm.getAscent() / 2;

            g2d.drawString(text, x, y);
        }
    }

    /**
     * 워터마크 추가 (대각선 반복 패턴)
     */
    private void addWatermark(PDPageContentStream contentStream, PDFont font,
                               String text, float pageWidth, float pageHeight) throws IOException {
        contentStream.saveGraphicsState();

        // 반투명 회색
        contentStream.setNonStrokingColor(0.8f, 0.8f, 0.8f);

        // 워터마크를 여러 위치에 반복 배치
        float fontSize = 40;
        float yStep = 150;
        float xStep = 200;

        for (float y = 100; y < pageHeight; y += yStep) {
            for (float x = 50; x < pageWidth; x += xStep) {
                contentStream.beginText();
                contentStream.setFont(font, fontSize);
                contentStream.newLineAtOffset(x, y);
                try {
                    contentStream.showText(text);
                } catch (Exception e) {
                    // 한글 폰트 문제 시 무시
                    log.debug("워터마크 텍스트 렌더링 실패: {}", e.getMessage());
                }
                contentStream.endText();
            }
        }

        contentStream.restoreGraphicsState();
    }

    /**
     * 템플릿 이미지 로드
     */
    private BufferedImage loadTemplateImage(TemplateData template) {
        try {
            // dataUrl이 있으면 base64 디코딩
            if (template.getDataUrl() != null && template.getDataUrl().startsWith("data:")) {
                String base64 = template.getDataUrl().split(",")[1];
                byte[] imageBytes = Base64.getDecoder().decode(base64);
                return ImageIO.read(new ByteArrayInputStream(imageBytes));
            }

            // imageUrl에서 로드
            if (template.getImageUrl() != null) {
                return ImageIO.read(new URL(template.getImageUrl()));
            }

            return null;
        } catch (Exception e) {
            log.error("템플릿 이미지 로드 실패: {}", template.getId(), e);
            return null;
        }
    }

    /**
     * 한글 폰트 로드
     */
    private PDFont loadFont(PDDocument document) throws IOException {
        // 시스템 폰트 또는 리소스 폰트 사용
        try {
            // classpath에서 폰트 로드 시도
            ClassPathResource fontResource = new ClassPathResource("fonts/NotoSansKR-Regular.ttf");
            if (fontResource.exists()) {
                try (InputStream is = fontResource.getInputStream()) {
                    return PDType0Font.load(document, is);
                }
            }
        } catch (Exception e) {
            log.warn("커스텀 폰트 로드 실패, 기본 폰트 사용");
        }

        // 기본 폰트 사용 (한글 미지원)
        return PDType0Font.load(document,
                PdfService.class.getResourceAsStream("/org/apache/pdfbox/resources/ttf/LiberationSans-Regular.ttf"));
    }

    private int[] parseLayout(String layout) {
        if (layout == null) return new int[]{2, 2};
        String[] parts = layout.split("x");
        if (parts.length != 2) return new int[]{2, 2};
        try {
            return new int[]{Integer.parseInt(parts[0]), Integer.parseInt(parts[1])};
        } catch (NumberFormatException e) {
            return new int[]{2, 2};
        }
    }

    private int calculateBlankPages(PdfGenerateRequest request) {
        ExportConfigData config = request.getExportConfig();
        if (config.getBlankPagesPerTemplate() != null && !config.getBlankPagesPerTemplate().isEmpty()) {
            return config.getBlankPagesPerTemplate().values().stream().mapToInt(Integer::intValue).sum();
        }
        return config.getBlankPages() != null ? config.getBlankPages() : 0;
    }

    private Color parseColor(String colorStr) {
        if (colorStr == null) return Color.BLACK;
        try {
            if (colorStr.startsWith("#")) {
                return Color.decode(colorStr);
            }
            return Color.BLACK;
        } catch (Exception e) {
            return Color.BLACK;
        }
    }

    private String toJson(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.error("JSON 직렬화 실패", e);
            return null;
        }
    }

    private <T> T fromJson(String json, Class<T> clazz) {
        if (json == null) return null;
        try {
            return objectMapper.readValue(json, clazz);
        } catch (JsonProcessingException e) {
            log.error("JSON 역직렬화 실패", e);
            return null;
        }
    }

    private <T> T fromJson(String json, com.fasterxml.jackson.databind.JavaType type) {
        if (json == null) return null;
        try {
            return objectMapper.readValue(json, type);
        } catch (JsonProcessingException e) {
            log.error("JSON 역직렬화 실패", e);
            return null;
        }
    }

    private PdfRecordResponse toRecordResponse(Generation g) {
        long daysUntilExpiry = ChronoUnit.DAYS.between(LocalDateTime.now(), g.getExpiresAt());
        return PdfRecordResponse.builder()
                .id(g.getId())
                .projectName(g.getProjectName())
                .pageCount(g.getPageCount())
                .nametagCount(g.getNametagCount())
                .status(g.getStatus().name())
                .watermarkEnabled(g.getWatermarkEnabled())
                .watermarkText(g.getWatermarkText())
                .createdAt(g.getCreatedAt())
                .expiresAt(g.getExpiresAt())
                .daysUntilExpiry((int) Math.max(0, daysUntilExpiry))
                .build();
    }
}
