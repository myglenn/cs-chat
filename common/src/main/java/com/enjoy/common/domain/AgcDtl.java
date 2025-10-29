package com.enjoy.common.domain;

import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgcDtl {
    private Long agcId;
    private String bizNum;
    private String email;
    private String zipCode;
    private String baseAddr;
    private String dtlAddr;
    private String tel;
    private String ceo;


    public void update(String bizNum, String email, String zipCode, String baseAddr, String dtlAddr,  String tel, String ceo) {
        this.bizNum = bizNum;
        this.email = email;
        this.zipCode = zipCode;
        this.baseAddr = baseAddr;
        this.dtlAddr = dtlAddr;
        this.tel = tel;
        this.ceo = ceo;
    }
}
