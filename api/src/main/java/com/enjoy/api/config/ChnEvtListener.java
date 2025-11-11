package com.enjoy.api.config;

import com.enjoy.api.service.ChnService;
import com.enjoy.common.dto.chn.ChnBroadcastEvtDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChnEvtListener {
    private final SimpMessageSendingOperations messagingTemplate;
    private final ChnService chnService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    public void handleChnBroadcastEvent(ChnBroadcastEvtDTO event) {
        Long chnId = event.getChnInfo().getId();

        try {
            List<String> participantLoginIds = chnService.findParticipantLoginIdsByChnId(chnId);

            log.info("Broadcasting new channel {} to {} participants.", chnId, participantLoginIds.size());

            participantLoginIds.forEach(loginId -> {
                messagingTemplate.convertAndSend("/topic/user/" + loginId, event.getChnInfo());
            });
        } catch (Exception e) {
            log.error("Failed to broadcast WebSocket message for new channel {} after commit.", chnId, e);
        }
    }
}
