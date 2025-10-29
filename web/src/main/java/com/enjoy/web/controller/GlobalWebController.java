package com.enjoy.web.controller;

import com.enjoy.api.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
@RequiredArgsConstructor
public class GlobalWebController {
    private final JwtTokenProvider jwtTokenProvider;
    @ModelAttribute("userRole")
    public String addUserRoleToModel(HttpServletRequest request) {
        String userRole = null;
        String token = jwtTokenProvider.resolveAccessToken(request);
        if (token != null && jwtTokenProvider.validateToken(token)) {
            userRole = jwtTokenProvider.getRolesFromToken(token);
        }
        return userRole;
    }
}
