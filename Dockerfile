#FROM gradle:8.3.0-jdk17 AS builder
#WORKDIR /app
#
## 루트 의존성 파일 먼저 복사
#COPY build.gradle.kts settings.gradle.kts ./
#
## 각 모듈의 build.gradle 파일 복사
#COPY api/build.gradle.kts ./api/
#COPY common/build.gradle.kts ./common/
#COPY web/build.gradle.kts ./web/
#
## 의존성만 먼저 다운로드
#RUN gradle dependencies --no-daemon
#
## 전체 소스 코드 복사
#COPY . .
#
## 의존성은 캐시된 상태로 빌드 실행
#RUN gradle build -x test --no-daemon
#
#FROM openjdk:17-jdk
#WORKDIR /app
#
## ARG로 빌드 시 사용할 모듈을 지정할 수 있습니다.
## 예: docker-compose build --build-arg WAR_MODULE=web
#ARG WAR_MODULE=api
#
#COPY --from=builder /app/${WAR_MODULE}/build/libs/*.war app.war
#
#EXPOSE 8080
#
#ENTRYPOINT ["java", "-jar", "app.war"]
# 캐시에 남아있어 유일하게 작동하는 gradle 이미지를 최종 이미지로 사용합니다.
FROM gradle:8.3.0-jdk17
WORKDIR /app

# (캐시용) 의존성 파일 먼저 복사
COPY build.gradle.kts settings.gradle.kts ./
COPY api/build.gradle.kts ./api/
COPY common/build.gradle.kts ./common/
COPY web/build.gradle.kts ./web/

# 의존성 다운로드 (docker-compose.override.yml의 볼륨 캐시 사용)
RUN gradle dependencies --no-daemon

# 전체 소스 코드 복사
COPY . .

# 빌드 실행
RUN gradle build -x test --no-daemon

# docker-compose에서 받은 모듈 인자 사용 (web)
ARG WAR_MODULE=web

# 포트 열기
EXPOSE 8080

# 문제가 되는 2단계(FROM openjdk...) 없이,
#    여기서 바로 WAR 파일을 실행
CMD ["sh", "-c", "java -jar /app/${WAR_MODULE}/build/libs/*.war"]