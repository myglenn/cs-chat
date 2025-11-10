package com.enjoy.common.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class EmailSendEvtDTO {
    private final String to;
    private final String subject;
    private final String text;
}
