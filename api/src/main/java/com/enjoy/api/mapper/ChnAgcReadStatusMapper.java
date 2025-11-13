package com.enjoy.api.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Mapper
public interface ChnAgcReadStatusMapper {
    List<Map<String, Object>> findLastReadMsgIdsByAgc(@Param("agcId") Long agcId, @Param("chnIds") Set<Long> chnIds);

    long countUnreadMessages(@Param("chnId") Long chnId, @Param("lastReadMsgId") Long lastReadMsgId);

    Long findLastMsgIdByChnId(@Param("chnId") Long chnId);

    void upsertReadStatus(@Param("chnId") Long chnId, @Param("agcId") Long agcId, @Param("lastReadMsgId") Long lastReadMsgId);
}
