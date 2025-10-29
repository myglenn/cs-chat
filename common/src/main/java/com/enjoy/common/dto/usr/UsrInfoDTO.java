package com.enjoy.common.dto.usr;

import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class UsrInfoDTO extends BaseUsrDTO {
    private Long id;
    private LocalDateTime regDt;
}
