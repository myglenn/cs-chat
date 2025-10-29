package com.enjoy.api.config;

import com.enjoy.api.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class StompHandler implements ChannelInterceptor {
    private final JwtTokenProvider jwtTokenProvider; 


    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {

            
            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);

                
                if (jwtTokenProvider.validateToken(token)) { 
                    
                    Authentication authentication = jwtTokenProvider.getAuthentication(token); 

                    
                    accessor.setUser(authentication);
                    log.info("STOMP user authenticated: {}", authentication.getName());
                } else {
                    log.warn("STOMP connection attempt with invalid JWT.");
                }
            } else {
                log.warn("STOMP connection attempt without Authorization header.");
            }
        }
        return message;
    }
}

