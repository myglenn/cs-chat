package com.enjoy.api.mapper;

import com.enjoy.common.domain.ChnLog;
import com.enjoy.common.dto.chn.ChnLogInfoDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Mapper
public interface ChnLogMapper {
    void insert(ChnLog chnLog);
}
