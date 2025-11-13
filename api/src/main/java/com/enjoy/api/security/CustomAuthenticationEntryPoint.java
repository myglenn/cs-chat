package com.enjoy.api.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;

@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private static final List<String> STATIC_RESOURCE_PATHS = List.of("/js/", "/css/", "/images/", "/webjars/");

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException {
        String requestURI = request.getRequestURI();

        if (requestURI.startsWith("/api/") || requestURI.startsWith("/ws-stomp/")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"error\": \"Unauthorized\", \"message\": \"인증이 필요합니다.\"}");

        } else if (isStaticResource(requestURI)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        } else {
            response.sendRedirect("/login");
        }
    }
    private boolean isStaticResource(String requestURI) {
        return STATIC_RESOURCE_PATHS.stream().anyMatch(requestURI::startsWith);
    }

}
