package com.enjoy.api.mapper;

import com.enjoy.common.domain.MsgFileMap;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface MsgFileMapMapper {
    void insert(MsgFileMap msgFileMap);
    void bulkInsert(List<MsgFileMap> mapList);
    Optional<Long> findMsgIdByFileId(@Param("fileId") Long fileId);
    List<Long> findFileIdsByMsgId(@Param("msgId") Long msgId);
}
