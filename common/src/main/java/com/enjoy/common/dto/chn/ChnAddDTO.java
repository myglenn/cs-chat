package com.enjoy.common.dto.chn;

import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class ChnAddDTO extends BaseChnDTO {
    private List<Long> agcIds;
    private String content;
    private List<Long> fileIds;
}
