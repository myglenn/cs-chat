package com.enjoy.api.security;

import com.enjoy.api.service.usr.LogoutService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final LogoutService logoutService;

    private final List<String> excludedPaths = Arrays.asList(
            "/login",
            "/api/auth/login",
            "/api/auth/reissue",
            "/api/auth/check-id"
    );

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider, LogoutService logoutService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.logoutService = logoutService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        boolean isExcluded = excludedPaths.stream().anyMatch(path::equals);

        if (isExcluded) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = jwtTokenProvider.resolveAccessToken(request);

        if (token != null && jwtTokenProvider.validateToken(token)) {
            if (!logoutService.isTokenBlacklisted(token)) {
                Authentication authentication = jwtTokenProvider.getAuthentication(token);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }


}
