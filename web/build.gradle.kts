plugins {
    id("org.springframework.boot")
    id("io.spring.dependency-management")
    id("java")
    war
}

dependencies {
    implementation(project(":api"))
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf")
    providedRuntime("org.springframework.boot:spring-boot-starter-tomcat")
    implementation("org.webjars:sockjs-client:1.5.1")
    implementation("org.webjars:stomp-websocket:2.3.4")
    implementation("org.webjars:webjars-locator-core")
}