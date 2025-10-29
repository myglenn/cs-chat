package com.enjoy.api.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface CmnSeqMapper {
    Long findCurrentValueByName(@Param("name") String seqName);
    void insertSequence(@Param("name") String seqName, @Param("value") long initialValue);
    int incrementValueByName(@Param("name") String seqName);
}
