package com.enjoy.common.dto.chn;

import com.enjoy.common.dto.usr.UsrInfoDTO;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChnLogInfoDTO {
    private Long id;
    private String oldStatus;
    private String newStatus;
    private LocalDateTime regDt;
    private UsrInfoDTO changer;
}
