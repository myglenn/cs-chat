package com.enjoy.common.dto.chn;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ChnStatusUpdateEvtDTO {
    private Long chnId;
    private String status;
    private String category;

    public ChnStatusUpdateEvtDTO(Long chnId, String status) {
        this.chnId = chnId;
        this.status = status;
        this.category = null;
    }
}
