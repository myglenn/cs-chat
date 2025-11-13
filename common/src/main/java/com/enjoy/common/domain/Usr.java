package com.enjoy.common.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Usr {
    private Long id;
    private String loginId;
    private String pw;
    private String name;
    private String role;
    private String status;
    private Long agcId;
    private LocalDateTime regDt;

    public void updateInfo(String name, String role, Long agcId) {
        this.name = name;
        this.role = role;
        this.agcId = agcId;
    }

}
