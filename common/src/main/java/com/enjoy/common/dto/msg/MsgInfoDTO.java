package com.enjoy.common.dto.msg;

import com.enjoy.common.dto.FileInfoDTO;
import com.enjoy.common.dto.usr.UsrInfoDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MsgInfoDTO {
    private Long id;
    private Long chnId;
    private String content;
    private LocalDateTime regDt;
    private UsrInfoDTO sender;

    private List<FileInfoDTO> files;
}
