package com.enjoy.api.config;

import com.enjoy.api.service.EmailService;
import com.enjoy.common.dto.EmailSendEvtDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class EmailEvtListener {
    private final EmailService emailService;


    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleEmailSendEvent(EmailSendEvtDTO event) {
        emailService.sendSimpleMessage(
                event.getTo(),
                event.getSubject(),
                event.getText()
        );
    }
}
