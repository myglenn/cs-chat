package com.enjoy.api.service;

import com.enjoy.api.config.CdCacheLoader;
import com.enjoy.api.mapper.CmnCdMapper;
import com.enjoy.common.domain.CmnCd;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CmnCdService {
    private final CmnCdMapper cmnCdMapper;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    public CmnCd findByCode(String code) {
        String hashKey = CdCacheLoader.CMN_CD_HASH_KEY;
        HashOperations<String, String, CmnCd> hashOps = redisTemplate.opsForHash();

        try {

            CmnCd cachedCode = hashOps.get(hashKey, code);
            if (cachedCode != null) {
                return cachedCode;
            }


            log.warn("Cache miss for code: {}. Querying DB.", code);
            CmnCd dbCode = cmnCdMapper.findByCode(code);


            if (dbCode != null) {
                hashOps.put(hashKey, code, dbCode);
            }
            return dbCode;

        } catch (Exception e) {
            log.error("Error during Redis operation for code {}: {}", code, e.getMessage());
            return cmnCdMapper.findByCode(code);
        }
    }

    public List<CmnCd> getCodesByGroup(String groupCode) {
        ValueOperations<String, Object> valueOps = redisTemplate.opsForValue();
        String redisKey = CdCacheLoader.CMN_CD_HASH_KEY_PREFIX + groupCode;

        try {


            Object cachedValue = valueOps.get(redisKey);

            if (cachedValue != null) {

                return (List<CmnCd>) cachedValue;
            }


            log.warn("Cache miss for groupCode: {}. Querying DB.", groupCode);
            List<CmnCd> dbCodes = cmnCdMapper.findByGroupCode(groupCode);


            if (dbCodes != null && !dbCodes.isEmpty()) {

                valueOps.set(redisKey, dbCodes);
            }
            return dbCodes;

        } catch (Exception e) {
            log.error("Error during Redis operation for groupCode {}: {}", groupCode, e.getMessage());
            return cmnCdMapper.findByGroupCode(groupCode);
        }
    }
}

