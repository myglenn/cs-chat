package com.enjoy.api.mapper;

import com.enjoy.common.domain.Usr;
import com.enjoy.common.dto.usr.UsrAccountDTO;
import com.enjoy.common.dto.usr.UsrInfoDTO;
import com.enjoy.common.dto.usr.UsrSearchCondition;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

@Mapper
public interface UsrMapper {
    Optional<Usr> findByLoginId(String loginId);

    long countAll();

    List<Usr> findWithPaging(Pageable pageable);

    long countWithFilter(@Param("condition") UsrSearchCondition condition);

    List<Usr> findWithPagingAndFilter(@Param("condition") UsrSearchCondition condition, @Param("pageable") Pageable pageable);

    int insert(Usr usr);

    Optional<Usr> findById(Long id);

    int existsByLoginId(String loginId);

    int update(Usr usr);

    int updateStatusAndClearInfo(Usr usr);

    Optional<UsrInfoDTO> findInfoById(Long id);

    List<UsrInfoDTO> findInfoByIds(List<Long> ids);

    Optional<UsrInfoDTO> findFirstManagerByAgcId(Long agcId);

    List<String> findLoginIdsByAgcIds(List<Long> agcIds);

    String findLoginIdById(Long id);

    List<String> findLoginIdsByRoles(List<String> roles);

    int bulkUpdateStatus(@Param("ids") List<Long> ids, @Param("status") String status);

    int bulkUpdateStatusByAgcId(@Param("agcId") Long agcId, @Param("status") String status);
}
