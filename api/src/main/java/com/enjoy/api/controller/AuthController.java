package com.enjoy.api.controller;

import com.enjoy.api.mapper.UsrMapper;
import com.enjoy.api.security.JwtTokenProvider;
import com.enjoy.api.service.usr.LogoutService;
import com.enjoy.api.service.RefreshTokenService;
import com.enjoy.api.service.usr.UsrService;
import com.enjoy.common.dto.auth.LoginRequestDTO;
import com.enjoy.common.dto.auth.TokenDTO;
import com.enjoy.common.dto.usr.UsrAccountDTO;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final UsrMapper usrMapper;
    private final LogoutService logoutService;
    private final UsrService usrService;

    @PostMapping("/login")
    public ResponseEntity<TokenDTO> login(@RequestBody LoginRequestDTO loginRequest, HttpServletResponse response) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getLoginId(), loginRequest.getPassword())
        );

        String accessToken = jwtTokenProvider.createAccessToken(authentication);
        String refreshToken = jwtTokenProvider.createRefreshToken(authentication);

        UsrAccountDTO user = usrService.findUserAccountByLoginId(authentication.getName());

        refreshTokenService.saveToken(user.getId(), refreshToken);
        TokenDTO TokenDTO = new TokenDTO("Bearer", accessToken, refreshToken);
        Cookie accessTokenCookie = new Cookie("accessToken", accessToken);
        accessTokenCookie.setHttpOnly(true);
        accessTokenCookie.setPath("/");
        response.addCookie(accessTokenCookie);

        Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setPath("/");
        response.addCookie(refreshTokenCookie);

        return ResponseEntity.ok(TokenDTO);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request, HttpServletResponse response, @AuthenticationPrincipal UserDetails userDetails) {
        String accessToken = jwtTokenProvider.resolveAccessToken(request);
        if (accessToken != null) {
            logoutService.addTokenToBlacklist(accessToken);
        }

        refreshTokenService.deleteRefreshToken(userDetails.getUsername());

        Cookie accessTokenCookie = new Cookie("accessToken", null);
        accessTokenCookie.setMaxAge(0);
        accessTokenCookie.setPath("/");
        response.addCookie(accessTokenCookie);

        Cookie refreshTokenCookie = new Cookie("refreshToken", null);
        refreshTokenCookie.setMaxAge(0);
        refreshTokenCookie.setPath("/");
        response.addCookie(refreshTokenCookie);

        return ResponseEntity.ok("로그아웃 되었습니다.");
    }

    @PostMapping("/reissue")
    public ResponseEntity<TokenDTO> reissue(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = jwtTokenProvider.resolveRefreshToken(request);

        if (refreshToken != null && jwtTokenProvider.validateToken(refreshToken) && refreshTokenService.validateRefreshToken(refreshToken)) {

            Authentication authentication = jwtTokenProvider.getAuthentication(refreshToken);
            String newAccessToken = jwtTokenProvider.createAccessToken(authentication);
            String newRefreshToken = jwtTokenProvider.createRefreshToken(authentication);
            UsrAccountDTO user = usrService.findUserAccountByLoginId(authentication.getName());
            refreshTokenService.saveToken(user.getId(), newRefreshToken);
            TokenDTO TokenDTO = new TokenDTO("Bearer", newAccessToken, newRefreshToken);

            Cookie accessTokenCookie = new Cookie("accessToken", newAccessToken);
            accessTokenCookie.setHttpOnly(true);
            accessTokenCookie.setPath("/");
            response.addCookie(accessTokenCookie);

            Cookie refreshTokenCookie = new Cookie("refreshToken", newRefreshToken);
            refreshTokenCookie.setHttpOnly(true);
            refreshTokenCookie.setPath("/");
            response.addCookie(refreshTokenCookie);

            return ResponseEntity.ok(TokenDTO);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
    }

    @PostMapping("/check-id")
    public ResponseEntity<Map<String, Boolean>> checkLoginIdDuplicate(@RequestBody Map<String, String> payload) {
        String loginId = payload.get("loginId");

        boolean isDuplicate = usrService.isLoginIdDuplicate(loginId);
        Map<String, Boolean> response = Map.of("isDuplicate", isDuplicate);
        return ResponseEntity.ok(response);
    }

}
