package com.nametagpro.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

@Configuration
public class S3Config {

    @Value("${aws.credentials.access-key}")
    private String accessKey;

    @Value("${aws.credentials.secret-key}")
    private String secretKey;

    @Value("${aws.s3.region}")
    private String region;

    @Value("${aws.endpoint:}")
    private String endpoint;

    @Bean
    public S3Client s3Client() {
        var credentialsProvider = StaticCredentialsProvider.create(
            AwsBasicCredentials.create(accessKey, secretKey)
        );

        var builder = S3Client.builder()
            .region(Region.of(region))
            .credentialsProvider(credentialsProvider);

        // Use custom endpoint for LocalStack
        if (endpoint != null && !endpoint.isEmpty()) {
            builder.endpointOverride(URI.create(endpoint))
                .forcePathStyle(true);
        }

        return builder.build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        var credentialsProvider = StaticCredentialsProvider.create(
            AwsBasicCredentials.create(accessKey, secretKey)
        );

        var builder = S3Presigner.builder()
            .region(Region.of(region))
            .credentialsProvider(credentialsProvider);

        if (endpoint != null && !endpoint.isEmpty()) {
            builder.endpointOverride(URI.create(endpoint));
        }

        return builder.build();
    }
}
