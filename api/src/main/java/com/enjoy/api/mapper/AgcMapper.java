package com.enjoy.api.mapper;

import com.enjoy.common.domain.Agc;
import com.enjoy.common.dto.agc.AgcInfoDTO;
import com.enjoy.common.dto.agc.AgcSearchCondition;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

@Mapper
public interface AgcMapper {
    void insert(Agc agc);
    void update(Agc agc);
    Optional<Agc> findById(Long id);
    Optional<AgcInfoDTO> findFullInfoById(Long id);
    List<AgcInfoDTO> findWithPagingAndFilter(@Param("condition") AgcSearchCondition condition, @Param("pageable") Pageable pageable);
    long countWithFilter(@Param("condition") AgcSearchCondition condition);
    int bulkUpdateStatus(@Param("ids")List<Long> ids, @Param("status")String status);
    List<AgcInfoDTO> findAllNoPaging(AgcSearchCondition condition);
}
