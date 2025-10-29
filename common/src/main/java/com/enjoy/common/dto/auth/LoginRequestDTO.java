package com.enjoy.common.dto.auth;

import lombok.Data;

@Data
public class LoginRequestDTO {
    private String loginId;
    private String password;
}
