package com.enjoy.api.controller;

import com.enjoy.common.dto.msg.MsgInfoDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class MsgController {
    private final SimpMessageSendingOperations messagingTemplate;

    @MessageMapping("/chat/{channelId}")
    public void message(@DestinationVariable Long channelId, MsgInfoDTO message) {
        if (message.getChnId() == null) {
            message.setChnId(channelId);
        }
        messagingTemplate.convertAndSend("/topic/chn/" + message.getChnId(), message);
    }

}
