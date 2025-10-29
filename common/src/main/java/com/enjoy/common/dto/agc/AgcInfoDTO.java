package com.enjoy.common.dto.agc;

import com.enjoy.common.dto.usr.UsrInfoDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class AgcInfoDTO extends BaseAgcDTO {
    private Long chnId;
    private Long id;
    private LocalDateTime regDt;
    private UsrInfoDTO manager;
}
