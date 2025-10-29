package com.enjoy.common.domain;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CmnFile {
    private Long id;
    private String originalName;
    private String storedPath;
    private String fileType;
    private Long fileSize;
    private Long uploaderId;
    private LocalDateTime uploadDt;

    @Builder
    public CmnFile(Long id, String originalName, String storedPath, String fileType, Long fileSize, Long uploaderId, LocalDateTime uploadDt) {
        this.id = id;
        this.originalName = originalName;
        this.storedPath = storedPath;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.uploaderId = uploaderId;
        this.uploadDt = uploadDt;
    }
}
