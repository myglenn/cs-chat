package com.enjoy.api.config;

import com.enjoy.common.dto.chn.MsgBroadcastEvtDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class MsgEvtListener {
    private final SimpMessageSendingOperations messagingTemplate;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleMsgBroadcastEvent(MsgBroadcastEvtDTO event) {
        log.info("Broadcasting message {} to {} participants.", event.getMsgInfo().getId(), event.getParticipantLoginIds().size());

        try {
            event.getParticipantLoginIds().forEach(loginId -> {
                messagingTemplate.convertAndSend("/topic/user/" + loginId, event.getMsgInfo());
            });
        } catch (Exception e) {
            log.error("Failed to broadcast WebSocket message after commit.", e);
            // 이 단계의 오류는 롤백되지 않으므로 로깅이 중요합니다.
        }
    }
}
