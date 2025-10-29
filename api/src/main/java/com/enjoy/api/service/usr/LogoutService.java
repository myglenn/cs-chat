package com.enjoy.api.service.usr;

import com.enjoy.api.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class LogoutService {

    private final RedisTemplate<String, String> redisTemplate;
    private final JwtTokenProvider jwtTokenProvider;

    public void addTokenToBlacklist(String accessToken) {
        Long remainingTime = jwtTokenProvider.getRemainingTime(accessToken);
        if (remainingTime > 0) {
            redisTemplate.opsForValue().set(accessToken, "logout", remainingTime, TimeUnit.MILLISECONDS);
        }
    }

    public boolean isTokenBlacklisted(String accessToken) {
        return redisTemplate.opsForValue().get(accessToken) != null;
    }


}
