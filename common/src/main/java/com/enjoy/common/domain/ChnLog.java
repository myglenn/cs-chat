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
public class ChnLog {
    private Long id;
    private Long chnId;
    private Long usrId; 
    private String oldStatus;
    private String newStatus;
    private LocalDateTime regDt;
}
