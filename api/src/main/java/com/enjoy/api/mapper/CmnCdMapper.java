package com.enjoy.api.mapper;

import com.enjoy.common.domain.CmnCd;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CmnCdMapper {
    List<CmnCd> findAll();

    CmnCd findByCode(String code);

    List<CmnCd> findAllUsedCodes();
    List<CmnCd> findByGroupCode(String groupCode);
}
