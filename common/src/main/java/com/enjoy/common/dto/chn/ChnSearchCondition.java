package com.enjoy.common.dto.chn;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ChnSearchCondition {
    private String title;
    private String status;
    private List<String> category;
    private Long agencyId;
    private String keyword;
}
