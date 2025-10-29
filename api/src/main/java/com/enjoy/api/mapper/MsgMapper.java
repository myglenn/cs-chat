package com.enjoy.api.mapper;

import com.enjoy.common.domain.Msg;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

@Mapper
public interface MsgMapper {
    void insert(Msg msg);
    List<Msg> findByChnId(@Param("chnId") Long chnId);
    long countByChnId(Long chnId);
    Optional<Long> findChnIdByMsgId(@Param("msgId") Long msgId);
}
