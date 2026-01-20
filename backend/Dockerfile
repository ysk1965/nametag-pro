# Build stage
FROM gradle:8-jdk17 AS build
WORKDIR /app
COPY build.gradle settings.gradle ./
COPY src ./src
RUN gradle bootJar --no-daemon

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Install fonts for Korean text rendering in PDF
RUN apk add --no-cache fontconfig ttf-dejavu

# Copy JAR from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup
USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q --spider http://localhost:8080/api/v1/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
