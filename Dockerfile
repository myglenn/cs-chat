FROM gradle:8.3.0-jdk17 AS builder
WORKDIR /app

# 루트 의존성 파일 먼저 복사
COPY build.gradle.kts settings.gradle.kts ./

# 각 모듈의 build.gradle 파일 복사
COPY api/build.gradle.kts ./api/
COPY common/build.gradle.kts ./common/
COPY web/build.gradle.kts ./web/

# 의존성만 먼저 다운로드
RUN gradle dependencies --no-daemon

# 전체 소스 코드 복사
COPY . .

# 의존성은 캐시된 상태로 빌드 실행
RUN gradle build -x test --no-daemon

FROM amazoncorretto:17-slim
WORKDIR /app

# ARG로 빌드 시 사용할 모듈을 지정할 수 있습니다.
# 예: docker-compose build --build-arg WAR_MODULE=web
ARG WAR_MODULE=api

COPY --from=builder /app/${WAR_MODULE}/build/libs/*.war app.war

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.war"]