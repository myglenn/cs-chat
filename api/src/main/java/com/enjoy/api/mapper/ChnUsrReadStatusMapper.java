package com.enjoy.api.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Mapper
public interface ChnUsrReadStatusMapper {
    List<Map<String, Object>> findLastReadMsgIdsByUser(@Param("userId") Long userId, @Param("chnIds") Set<Long> chnIds);
    long countUnreadMessages(@Param("chnId") Long chnId, @Param("lastReadMsgId") Long lastReadMsgId);
    Long findLastMsgIdByChnId(@Param("chnId") Long chnId);
    void upsertReadStatus(@Param("chnId") Long chnId, @Param("userId") Long userId, @Param("lastReadMsgId") Long lastReadMsgId);
}
