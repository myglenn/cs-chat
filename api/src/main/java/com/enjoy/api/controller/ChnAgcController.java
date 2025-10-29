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
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
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
@PreAuthorize("hasAnyRole('AGENCY_ADMIN', 'AGENCY_REP')")
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

        return ResponseEntity.ok(channelInfo);
    }
    @PostMapping("/{chnId}/read")
    public ResponseEntity<Void> markChannelAsRead(
            @PathVariable Long chnId,
            Principal principal) {

        String loginId = principal.getName();
        UsrAccountDTO user = usrService.findUserAccountByLoginId(loginId);
        Long currentUserId = user.getId();

        chnService.markChannelAsRead(chnId, currentUserId);

        return ResponseEntity.ok().build();
    }
}
