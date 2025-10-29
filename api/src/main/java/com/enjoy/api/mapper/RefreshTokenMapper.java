package com.enjoy.api.mapper;

import com.enjoy.common.domain.RefreshToken;
import org.apache.ibatis.annotations.Mapper;

import java.util.Optional;

@Mapper
public interface RefreshTokenMapper {
    void save(RefreshToken refreshToken);

    Optional<RefreshToken> findByUsrId(Long usrId);

    void deleteByUsrId(Long usrId);
}
