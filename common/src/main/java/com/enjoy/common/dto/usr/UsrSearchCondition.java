package com.enjoy.common.dto.usr;

import lombok.*;

@Data
public class UsrSearchCondition {
    private Long agcId;
    private String loginId;
    private String name;
    private String role;
    private String email;
}
