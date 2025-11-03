package com.enjoy.api.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UsrPwMapper {
    void insert(@Param("usrId") Long usrId, @Param("pw") String pw);
    void update(@Param("usrId") Long usrId, @Param("pw") String pw);
}
