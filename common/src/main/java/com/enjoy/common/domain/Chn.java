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
public class Chn {
    private Long id;
    private String type;
    private String title;
    private String category;
    private String status;
    private Long creatorId;
    private LocalDateTime regDt;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private Long lastMsgId;

    public void close(String category) {
        this.status = "CLOSED";
        this.category = category;
    }
}
