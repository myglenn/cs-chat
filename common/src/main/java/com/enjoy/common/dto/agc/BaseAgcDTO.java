package com.enjoy.common.dto.agc;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class BaseAgcDTO {
    private String code;    
    private String name;    
    private String bizNum;
    private String email;
    private String zipCode;
    private String baseAddr;
    private String dtlAddr;
    private String tel;     
    private String ceo;     
    private String status;
}
