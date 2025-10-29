package com.enjoy.common.domain;

import lombok.Data;

@Data
public class CmnCd {
    private String code;
    private String groupCode;
    private String name;
    private int sortOrder;
    private int isUsed;
}
