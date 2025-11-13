package com.enjoy.web.controller;

import com.enjoy.api.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@Slf4j
@ControllerAdvice
@RequiredArgsConstructor
public class GlobalWebController {
    private final JwtTokenProvider jwtTokenProvider;

    @ModelAttribute("userRole")
    public String addUserRoleToModel(HttpServletRequest request) {
        String userRole = null;
        String token = jwtTokenProvider.resolveAccessToken(request);

        if (token != null) {
            try {
                if (jwtTokenProvider.validateToken(token)) {
                    userRole = jwtTokenProvider.getRolesFromToken(token);
                }
            } catch (Exception e) {
                if (e.getClass().getName().equals("io.jsonwebtoken.ExpiredJwtException")) {
                    log.debug("Expired token found in GlobalWebController, ignoring.");
                } else {
                    log.debug("Invalid token found in GlobalWebController, ignoring: {}", e.getMessage());
                }
            }
        }
        return userRole;
    }
}
