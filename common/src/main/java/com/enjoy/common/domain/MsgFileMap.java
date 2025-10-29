package com.enjoy.common.domain;

import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class MsgFileMap {
    private Long msgId;
    private Long fileId;
}
