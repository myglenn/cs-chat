package com.enjoy.common.domain;

import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Getter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Agc {
    private Long id;
    private String code;
    private String name;
    private String status;
    private LocalDateTime regDt;

    public void update(String code, String name) {
        this.code = code;
        this.name = name;
    }

    public void updateName(String name) {
        this.name = name;
    }

    public void softDelete() {
        this.status = "DELETED";
    }
}
