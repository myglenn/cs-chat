package com.enjoy.common.dto.usr;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class UsrAccountDTO extends BaseUsrDTO {
    private Long id;
    private String pw;
}
