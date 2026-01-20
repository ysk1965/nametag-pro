package com.nametagpro.service;

import com.nametagpro.entity.Project;
import com.nametagpro.entity.Template;
import com.nametagpro.exception.ResourceNotFoundException;
import com.nametagpro.exception.ValidationException;
import com.nametagpro.repository.TemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TemplateService {

    private final TemplateRepository templateRepository;
    private final S3Service s3Service;

    private static final List<String> ALLOWED_TYPES = List.of("image/jpeg", "image/png", "image/jpg");
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final int MAX_TEMPLATES = 10;

    @Transactional
    public List<Template> uploadTemplates(Project project, List<MultipartFile> files) throws IOException {
        validateFiles(project.getId(), files);

        List<Template> templates = new ArrayList<>();
        int order = templateRepository.countByProjectId(project.getId());

        for (MultipartFile file : files) {
            // Get image dimensions
            BufferedImage image = ImageIO.read(file.getInputStream());
            if (image == null) {
                throw new ValidationException("이미지를 읽을 수 없습니다: " + file.getOriginalFilename());
            }

            // Upload to S3
            String imageUrl = s3Service.uploadFile(file, "templates");

            Template template = Template.builder()
                .project(project)
                .fileName(file.getOriginalFilename())
                .imageUrl(imageUrl)
                .width(image.getWidth())
                .height(image.getHeight())
                .sortOrder(order++)
                .build();

            templates.add(templateRepository.save(template));
        }

        return templates;
    }

    @Transactional(readOnly = true)
    public List<Template> getTemplates(UUID projectId) {
        return templateRepository.findByProjectIdOrderBySortOrderAsc(projectId);
    }

    @Transactional
    public Template updateTemplateRole(UUID templateId, String role) {
        Template template = templateRepository.findById(templateId)
            .orElseThrow(() -> new ResourceNotFoundException("Template not found"));

        template.setRole(role);
        return templateRepository.save(template);
    }

    @Transactional
    public void deleteTemplate(UUID templateId) {
        if (!templateRepository.existsById(templateId)) {
            throw new ResourceNotFoundException("Template not found");
        }
        templateRepository.deleteById(templateId);
    }

    private void validateFiles(UUID projectId, List<MultipartFile> files) {
        int currentCount = templateRepository.countByProjectId(projectId);

        if (currentCount + files.size() > MAX_TEMPLATES) {
            throw new ValidationException("템플릿은 최대 " + MAX_TEMPLATES + "개까지 업로드 가능합니다");
        }

        for (MultipartFile file : files) {
            if (!ALLOWED_TYPES.contains(file.getContentType())) {
                throw new ValidationException("JPG, PNG 파일만 업로드 가능합니다");
            }
            if (file.getSize() > MAX_FILE_SIZE) {
                throw new ValidationException("파일 크기는 10MB 이하여야 합니다");
            }
        }
    }
}
