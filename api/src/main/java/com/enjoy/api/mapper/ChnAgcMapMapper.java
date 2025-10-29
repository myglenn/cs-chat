package com.enjoy.api.mapper;

import com.enjoy.common.domain.ChnAgcMap;
import com.enjoy.common.dto.agc.AgcInfoDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface ChnAgcMapMapper {
    void bulkInsert(List<ChnAgcMap> mapList);
    List<AgcInfoDTO> findParticipantsByChnId(Long chnId);
    List<AgcInfoDTO> findParticipantsByChnIds(List<Long> chnIds);
    List<Long> findAgcIdsByChnId(Long chnId);
}
