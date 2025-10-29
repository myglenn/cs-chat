package com.enjoy.api.config;

import com.enjoy.api.mapper.CmnCdMapper;
import com.enjoy.common.domain.CmnCd;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class CdCacheLoader implements ApplicationRunner {
    public static final String CMN_CD_HASH_KEY = "commonCodes";
    public static final String CMN_CD_HASH_KEY_PREFIX = "cmncd::";
    private final CmnCdMapper cmnCdMapper;
    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        log.info("Loading Common Codes into Redis Cache...");
        try {
            List<CmnCd> allUsedCodes = cmnCdMapper.findAllUsedCodes();
            if (CollectionUtils.isEmpty(allUsedCodes)) {
                log.warn("No usable common codes found in DB to load into cache.");
                return;
            }


            Map<String, List<CmnCd>> groupedCodes = allUsedCodes.stream()
                    .collect(Collectors.groupingBy(CmnCd::getGroupCode));

            groupedCodes.forEach((groupCode, codes) -> {
                try {
                    String redisKey = CMN_CD_HASH_KEY_PREFIX + groupCode;
                    redisTemplate.opsForValue().set(redisKey, codes);
                    log.debug("Cached common codes for group: {}", groupCode);
                } catch (Exception e) {
                    log.error("Error saving common codes for group {} to Redis", groupCode, e);
                }
            });
            log.info("Successfully loaded {} common code groups into Redis.", groupedCodes.size());

            log.info("Populating individual common codes into Hash: {}", CMN_CD_HASH_KEY);
            HashOperations<String, String, CmnCd> hashOps = redisTemplate.opsForHash();

            allUsedCodes.forEach(code -> {
                try {
                    hashOps.put(CMN_CD_HASH_KEY, code.getCode(), code);
                } catch (Exception e) {
                    log.error("Error saving single code {} to Redis Hash", code.getCode(), e);
                }
            });
            log.info("Successfully loaded {} individual codes into Redis Hash.", allUsedCodes.size());

        } catch (Exception e) {
            log.error("Failed to load common codes into Redis cache.", e);
        }
    }
}
