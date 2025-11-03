package com.enjoy.common.dto.usr;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class BaseUsrDTO {
    private Long agcId;
    private String loginId;
    private String name;
    private String role;
}
