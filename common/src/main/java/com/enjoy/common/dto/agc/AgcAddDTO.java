package com.enjoy.common.dto.agc;

import com.enjoy.common.dto.usr.UsrAddDTO;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class AgcAddDTO extends BaseAgcDTO {
    private UsrAddDTO usr;
}
