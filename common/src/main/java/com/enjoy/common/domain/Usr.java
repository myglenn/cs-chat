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
    private String email;
    private String name;
    private String role;
    private String status;
    private Long agcId;
    private LocalDateTime regDt;

    public void updateInfo(String name, String email, String role, Long agcId) {
        this.name = name;
        this.email = email;
        this.role = role;
        this.agcId = agcId;
    }

    public void softDelete() {
        this.status = "DELETED";
        this.name = "탈퇴한사용자";
        this.email = null;
        this.pw = "deleted_user_password_hash";
    }

    public void updateNameAndEmail(String name, String email) {
        this.name = name;
        this.email = email;
    }

}
