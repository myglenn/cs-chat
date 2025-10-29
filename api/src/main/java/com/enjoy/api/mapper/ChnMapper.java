package com.enjoy.api.mapper;

import com.enjoy.common.domain.Chn;
import com.enjoy.common.dto.chn.ChnSearchCondition;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

@Mapper
public interface ChnMapper {
    void insert(Chn chn);
    void update(Chn chn);
    Optional<Chn> findById(Long id);
    List<Chn> findWithPagingAndFilter(ChnSearchCondition condition);
    long countWithFilter(@Param("condition") ChnSearchCondition condition);
}
