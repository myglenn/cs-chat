package com.enjoy.common.dto.msg;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MsgSendDTO {
    private String content;
    private List<Long> fileIds;
}
