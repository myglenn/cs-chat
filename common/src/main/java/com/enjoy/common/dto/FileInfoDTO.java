package com.enjoy.common.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@Builder
@ToString
public class FileInfoDTO {
    private Long id;
    private String name;
    private String type;
    private Long size;
    private String downloadUrl;
}
