package com.enjoy.api.service.usr;

import com.enjoy.api.mapper.UsrMapper;
import com.enjoy.common.dto.usr.UsrAccountDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthUserDetailService implements UserDetailsService {
    private final UsrService usrService;

    @Override
    public UserDetails loadUserByUsername(String loginId) throws UsernameNotFoundException {
        UsrAccountDTO user = usrService.findUserAccountByLoginId(loginId);
        return User.builder()
                .username(user.getLoginId())
                .password(user.getPw())
                .roles(user.getRole())
                .build();
    }
}
