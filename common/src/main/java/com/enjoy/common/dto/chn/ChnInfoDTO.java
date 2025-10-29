package com.enjoy.common.dto.chn;

import com.enjoy.common.dto.agc.AgcInfoDTO;
import com.enjoy.common.dto.msg.MsgInfoDTO;
import com.enjoy.common.dto.usr.UsrInfoDTO;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ChnInfoDTO extends BaseChnDTO {
    private Long id;
    private String status;
    private long unreadCount;
    private LocalDateTime regDt;
    private UsrInfoDTO creator;
    private List<AgcInfoDTO> participants;
    private List<MsgInfoDTO> messages;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
}
