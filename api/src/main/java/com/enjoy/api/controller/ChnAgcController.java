package com.enjoy.api.controller;

import com.enjoy.api.service.ChnService;
import com.enjoy.api.service.MsgService;
import com.enjoy.api.service.usr.UsrService;
import com.enjoy.common.dto.chn.ChnAddDTO;
import com.enjoy.common.dto.chn.ChnInfoDTO;
import com.enjoy.common.dto.chn.ChnSearchCondition;
import com.enjoy.common.dto.msg.MsgInfoDTO;
import com.enjoy.common.dto.msg.MsgSendDTO;
import com.enjoy.common.dto.usr.UsrAccountDTO;
import com.enjoy.common.dto.usr.UsrInfoDTO;
import com.enjoy.common.exception.BusinessException;
import com.enjoy.common.exception.ErrorCodes;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/agency/channels")
@PreAuthorize("hasRole('AGENCY_ADMIN')")
@RequiredArgsConstructor
public class ChnAgcController {
    private final ChnService chnService;
    private final UsrService usrService;
    private final MsgService msgService;

    @PostMapping
    public ResponseEntity<ChnInfoDTO> createChannel(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ChnAddDTO requestDTO) {

        ChnInfoDTO createdChannel = chnService.createChannelByAgency(userDetails.getUsername(), requestDTO);
        if (requestDTO.getContent() != null && !requestDTO.getContent().trim().isEmpty()) {
            MsgSendDTO firstMessageDTO = new MsgSendDTO();
            firstMessageDTO.setContent(requestDTO.getContent());

            msgService.saveAndSendMessage(createdChannel.getId(), userDetails.getUsername(), firstMessageDTO);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(createdChannel);
    }

    @GetMapping
    public ResponseEntity<List<ChnInfoDTO>> getMyAgencyChannels(
            @AuthenticationPrincipal UserDetails userDetails,
            ChnSearchCondition condition,
            Pageable pageable) {

        UsrAccountDTO user = usrService.findUserAccountByLoginId(userDetails.getUsername());
        List<ChnInfoDTO> channelPage = chnService.findChannelsByAgency(user.getAgcId(), condition, pageable);

        return ResponseEntity.ok(channelPage);
    }

    @GetMapping("/{chnId}")
    public ResponseEntity<ChnInfoDTO> getChannelById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long chnId) {

        UsrAccountDTO user = usrService.findUserAccountByLoginId(userDetails.getUsername());
        ChnInfoDTO channelInfo = chnService.findChannelByIdForAgency(chnId, user.getAgcId());
        List<MsgInfoDTO> messages = msgService.findMessagesByChannelId(chnId);
        channelInfo.setMessages(messages);

        List<String> adminRoles = List.of("SUPER_ADMIN", "OPERATOR");

        boolean hasAdminMsg = messages.stream().anyMatch(msg -> {
            UsrInfoDTO sender = msg.getSender();
            return sender != null && adminRoles.contains(sender.getRole());
        });

        channelInfo.setHasAdminMessage(hasAdminMsg);

        return ResponseEntity.ok(channelInfo);
    }
    @PostMapping("/{chnId}/read")
    public ResponseEntity<Void> markChannelAsRead(
            @PathVariable Long chnId) {

        chnService.markChannelAsRead(chnId);

        return ResponseEntity.ok().build();
    }
    @PutMapping("/{chnId}/withdraw")
    public ResponseEntity<Void> withdrawChannel(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long chnId) {

        String loginId = userDetails.getUsername();
        UsrAccountDTO user = usrService.findUserAccountByLoginId(loginId);

        ChnInfoDTO channelInfo = chnService.findChannelByIdForAgency(chnId, user.getAgcId());

        if (!"IN_PROGRESS".equals(channelInfo.getStatus())) {
            throw new BusinessException(ErrorCodes.INVALID_ARGUMENT, "진행중인 상담만 철회할 수 있습니다.");
        }

        if (!"CON".equals(channelInfo.getType())) {
            throw new BusinessException(ErrorCodes.INVALID_ARGUMENT, "상담 채널만 철회할 수 있습니다.");
        }

        List<MsgInfoDTO> messages = msgService.findMessagesByChannelId(chnId);
        List<String> adminRoles = List.of("SUPER_ADMIN", "OPERATOR");

        boolean hasAdminMsg = messages.stream().anyMatch(msg -> {
            UsrInfoDTO sender = msg.getSender();
            return sender != null && adminRoles.contains(sender.getRole());
        });

        if (hasAdminMsg) {
            throw new BusinessException(ErrorCodes.ACCESS_DENIED, "본사 담당자가 이미 응답한 상담입니다.");
        }

        chnService.updateChannelStatus(chnId, "WITHDRAWN");

        return ResponseEntity.ok().build();
    }

}
