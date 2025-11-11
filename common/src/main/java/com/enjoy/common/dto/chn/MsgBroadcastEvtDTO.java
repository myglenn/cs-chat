package com.enjoy.common.dto.chn;

import com.enjoy.common.dto.msg.MsgInfoDTO;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Getter
@RequiredArgsConstructor
public class MsgBroadcastEvtDTO {
    private final MsgInfoDTO msgInfo;
    private final List<String> participantLoginIds;
}
