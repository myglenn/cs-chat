package com.enjoy.api.mapper;

import com.enjoy.common.domain.AgcDtl;
import org.apache.ibatis.annotations.Mapper;

import java.util.Optional;

@Mapper
public interface AgcDtlMapper {
    void insert(AgcDtl agcDtl);
    void update(AgcDtl agcDtl);
    Optional<AgcDtl> findById(Long agcId);
}
