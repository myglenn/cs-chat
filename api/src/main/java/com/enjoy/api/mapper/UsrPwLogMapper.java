package com.enjoy.api.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

@Mapper
public interface UsrPwLogMapper {
    Optional<String> findCurrentPasswordByUsrId(Long usrId);
    void insertLog(@Param("id") long id,
                   @Param("usrId") long usrId,
                   @Param("oldPw") String oldPw);
}
