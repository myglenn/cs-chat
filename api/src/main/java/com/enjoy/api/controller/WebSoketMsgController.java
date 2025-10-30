package com.enjoy.api.controller;

import com.enjoy.api.service.ChnService;
import com.enjoy.api.service.MsgService;
import com.enjoy.common.dto.msg.MsgInfoDTO;
import com.enjoy.common.dto.msg.MsgSendDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class WebSoketMsgController {
    private final MsgService msgService;
    private final SimpMessageSendingOperations messagingTemplate;

    @MessageMapping("/channels/{chnId}/send")
    public void sendMessage(
            @DestinationVariable Long chnId,
            Principal principal,
            @Payload MsgSendDTO requestDTO) {

        String loginId = principal.getName();
        MsgInfoDTO info = msgService.saveAndSendMessage(chnId, loginId, requestDTO);
        System.out.println(" info = " + info);
    }
}
