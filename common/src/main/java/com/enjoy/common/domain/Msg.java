package com.enjoy.common.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Msg {
    private Long id;
    private String content;
    private Long chnId;
    private Long senderId;
    private LocalDateTime regDt;
}
