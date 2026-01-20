package com.nametagpro.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Value("${aws.endpoint:}")
    private String endpoint;

    public String uploadFile(MultipartFile file, String prefix) throws IOException {
        String key = prefix + "/" + UUID.randomUUID() + getExtension(file.getOriginalFilename());

        PutObjectRequest request = PutObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .contentType(file.getContentType())
            .build();

        s3Client.putObject(request, RequestBody.fromInputStream(
            file.getInputStream(), file.getSize()));

        return getPublicUrl(key);
    }

    public String uploadBytes(byte[] data, String key, String contentType) {
        PutObjectRequest request = PutObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .contentType(contentType)
            .build();

        s3Client.putObject(request, RequestBody.fromBytes(data));

        return getPublicUrl(key);
    }

    public String getPresignedUrl(String key, Duration duration) {
        GetObjectRequest getRequest = GetObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
            .signatureDuration(duration)
            .getObjectRequest(getRequest)
            .build();

        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }

    public byte[] downloadFile(String key) {
        GetObjectRequest request = GetObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .build();

        return s3Client.getObjectAsBytes(request).asByteArray();
    }

    private String getPublicUrl(String key) {
        if (endpoint != null && !endpoint.isEmpty()) {
            // LocalStack URL
            return endpoint + "/" + bucketName + "/" + key;
        }
        // AWS S3 URL
        return "https://" + bucketName + ".s3.amazonaws.com/" + key;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
}
