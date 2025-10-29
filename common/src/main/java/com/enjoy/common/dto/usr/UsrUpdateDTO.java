package com.enjoy.common.dto.usr;

import lombok.Data;

@Data
public class UsrUpdateDTO {
    private Long agcId;
    private String name;
    private String role;
    private String email;
}
