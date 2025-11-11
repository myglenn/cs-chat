package com.enjoy.api.controller;

import com.enjoy.api.service.ChnService;
import com.enjoy.api.service.MsgService;
import com.enjoy.api.service.usr.UsrService;
import com.enjoy.common.dto.chn.ChnAddDTO;
import com.enjoy.common.dto.chn.ChnClosedDTO;
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
@RequestMapping("/api/admin/channels")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'OPERATOR')")
@RequiredArgsConstructor
public class ChnAdmController {
    private final ChnService chnService;
    private final UsrService usrService;
    private final MsgService msgService;

    @PostMapping
    public ResponseEntity<ChnInfoDTO> createChannel(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ChnAddDTO requestDTO) {

        ChnInfoDTO createdChannel = chnService.createChannelByAdmin(userDetails.getUsername(), requestDTO);
        if (requestDTO.getContent() != null && !requestDTO.getContent().trim().isEmpty()) {
            MsgSendDTO firstMessageDTO = new MsgSendDTO();
            firstMessageDTO.setContent(requestDTO.getContent());




            msgService.saveAndSendMessage(createdChannel.getId(), userDetails.getUsername(), firstMessageDTO);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(createdChannel);
    }

    @GetMapping
    public ResponseEntity<List<ChnInfoDTO>> getAllChannels(ChnSearchCondition condition, Pageable pageable) {
        List<ChnInfoDTO> channelPage = chnService.findAllChannels(condition, pageable);
        return ResponseEntity.ok(channelPage);
    }

    @GetMapping("/{chnId}")
    public ResponseEntity<ChnInfoDTO> getChannelById(@PathVariable Long chnId) {
        ChnInfoDTO channelInfo = chnService.findChannelById(chnId);
        List<MsgInfoDTO> messages = msgService.findMessagesByChannelId(chnId);
        channelInfo.setMessages(messages);
        return ResponseEntity.ok(channelInfo);
    }

    @PutMapping("/{chnId}/close")
    public ResponseEntity<Void> closeChannel(
            @PathVariable Long chnId,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ChnClosedDTO requestDTO) {

        UsrAccountDTO resolver = usrService.findUserAccountByLoginId(userDetails.getUsername());
        chnService.closeChannel(chnId, resolver.getId(), requestDTO);

        return ResponseEntity.ok().build();
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
