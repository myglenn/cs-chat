package com.enjoy.api.mapper;

import com.enjoy.common.domain.CmnFile;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Optional;

@Mapper
public interface CmnFileMapper {
    void insert(CmnFile cmnFile);
    Optional<CmnFile> findById(Long id);
    List<CmnFile> findByIds(List<Long> ids);
}
