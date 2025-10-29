package com.enjoy.api.service;

import com.enjoy.api.mapper.RefreshTokenMapper;
import com.enjoy.api.security.JwtTokenProvider;
import com.enjoy.api.service.usr.UsrService;
import com.enjoy.common.domain.RefreshToken;
import com.enjoy.common.dto.usr.UsrAccountDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final UsrService usrService;
    private final RefreshTokenMapper refreshTokenMapper;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public void saveToken(Long usrId, String token) {
        RefreshToken refreshToken = new RefreshToken(usrId, token);
        refreshTokenMapper.save(refreshToken);
    }

    @Transactional
    public void deleteRefreshToken(String loginId) {
        UsrAccountDTO user = usrService.findUserAccountByLoginId(loginId);
        refreshTokenMapper.deleteByUsrId(user.getId());
    }

    @Transactional(readOnly = true)
    public boolean validateRefreshToken(String token) {
        if (!jwtTokenProvider.validateToken(token)) {return false;}
        String loginId = jwtTokenProvider.getLoginIdFromToken(token);
        UsrAccountDTO user = usrService.findUserAccountByLoginId(loginId);
        RefreshToken refreshTokenInDb = refreshTokenMapper.findByUsrId(user.getId())
                .orElse(null);
        return refreshTokenInDb != null && refreshTokenInDb.getToken().equals(token);
    }

}
