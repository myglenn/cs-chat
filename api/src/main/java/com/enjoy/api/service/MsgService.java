package com.enjoy.api.service;

import com.enjoy.api.mapper.ChnUsrReadStatusMapper;
import com.enjoy.api.mapper.MsgFileMapMapper;
import com.enjoy.api.mapper.MsgMapper;
import com.enjoy.api.mapper.UsrMapper;
import com.enjoy.common.domain.CmnFile;
import com.enjoy.common.domain.Msg;
import com.enjoy.common.domain.MsgFileMap;
import com.enjoy.common.domain.Usr;
import com.enjoy.common.dto.FileInfoDTO;
import com.enjoy.common.dto.msg.MsgInfoDTO;
import com.enjoy.common.dto.msg.MsgSendDTO;
import com.enjoy.common.dto.usr.UsrInfoDTO;
import com.enjoy.common.exception.BusinessException;
import com.enjoy.common.exception.ErrorCodes;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class MsgService {
    private final MsgMapper msgMapper;
    private final UsrMapper usrMapper;
    private final ChnUsrReadStatusMapper chnUsrReadStatusMapper;
    private final MsgFileMapMapper msgFileMapMapper;
    private final CmnFileService cmnFileService;
    private final ChnService chnService;
    private final CmnSeqService cmnSeqService;
    private final SimpMessageSendingOperations messagingTemplate;

    public List<MsgInfoDTO> findMessagesByChannelId(Long chnId) {
        List<Msg> msgList = msgMapper.findByChnId(chnId);
        if (msgList.isEmpty()) {
            return Collections.emptyList();
        }
        List<Long> senderIds = msgList.stream()
                .map(Msg::getSenderId)
                .distinct()
                .collect(Collectors.toList());
        Map<Long, UsrInfoDTO> senderMap = usrMapper.findInfoByIds(senderIds).stream()
                .collect(Collectors.toMap(UsrInfoDTO::getId, Function.identity()));

        List<MsgInfoDTO> dtoList = msgList.stream()
                .map(msg -> MsgInfoDTO.builder()
                        .id(msg.getId())
                        .content(msg.getContent())
                        .regDt(msg.getRegDt())
                        .chnId(msg.getChnId())
                        .chnId(msg.getChnId())
                        .sender(senderMap.get(msg.getSenderId()))
                        .build())
                .collect(Collectors.toList());

        return dtoList;
    }

    public MsgInfoDTO saveAndSendMessage(Long chnId, String senderLoginId, MsgSendDTO requestDTO) {
        Usr sender = usrMapper.findByLoginId(senderLoginId).orElseThrow(() -> new BusinessException(ErrorCodes.USER_NOT_FOUND, "ID: " + senderLoginId));
        long msgId = cmnSeqService.getNextSequenceValue("MSG");
        Msg msg = Msg.builder()
                .chnId(chnId)
                .senderId(sender.getId())
                .content(requestDTO.getContent())
                .regDt(LocalDateTime.now())
                .build();
        msgMapper.insert(msg);
        if (!CollectionUtils.isEmpty(requestDTO.getFileIds())) {
            List<MsgFileMap> mapList = requestDTO.getFileIds().stream()
                    .map(fileId -> new MsgFileMap(msgId, fileId))
                    .collect(Collectors.toList());
            msgFileMapMapper.bulkInsert(mapList);
        }
        MsgInfoDTO msgInfo = convertToInfoDTO(msg);
        List<String> participantLoginIds = chnService.findParticipantLoginIdsByChnId(chnId);
        participantLoginIds.forEach(id -> {
            messagingTemplate.convertAndSend("/topic/user/" + id, msgInfo);
        });
        chnUsrReadStatusMapper.upsertReadStatus(msg.getChnId(), msg.getSenderId(), msg.getId());
        return MsgInfoDTO.builder()
                .id(msg.getId())
                .content(msg.getContent())
                .chnId(msg.getChnId())
                .regDt(msg.getRegDt())
                .chnId(msg.getChnId())
                .sender(UsrInfoDTO.builder()
                        .id(sender.getId())
                        .loginId(sender.getLoginId())
                        .name(sender.getName())
                        .build())
                .build();
    }

    @Transactional(readOnly = true)
    public Resource getFileResourceForDownload(Long fileId, String currentUserLoginId) {
        Long msgId = msgFileMapMapper.findMsgIdByFileId(fileId)
                .orElseThrow(() -> {
                    log.warn("Attempt to download file with no message mapping: fileId={}", fileId);
                    return new BusinessException(ErrorCodes.FILE_NOT_FOUND, "File mapping not found");
                });
        Long chnId = msgMapper.findChnIdByMsgId(msgId)
                .orElseThrow(() -> {
                    log.error("Consistency error: Message {} found in map but not in MSG table for file {}", msgId, fileId);
                    return new BusinessException(ErrorCodes.INVALID_ARGUMENT, "Channel not found for message");
                });
        List<String> participantLoginIds = chnService.findParticipantLoginIdsByChnId(chnId);
        if (!participantLoginIds.contains(currentUserLoginId)) {
            log.warn("Access denied: User {} tried to download file {} from channel {}", currentUserLoginId, fileId, chnId);
            throw new BusinessException(ErrorCodes.ACCESS_DENIED, "File download forbidden");
        }
        log.info("Access granted: User {} downloading file {} from channel {}", currentUserLoginId, fileId, chnId);
        return cmnFileService.loadFileResourceById(fileId);
    }

    @Transactional(readOnly = true)
    public String getOriginalFilenameForDownload(Long fileId) {
        return cmnFileService.getOriginalFilename(fileId);
    }

    private MsgInfoDTO convertToInfoDTO(Msg msg) {
        UsrInfoDTO senderInfo = usrMapper.findInfoById(msg.getSenderId()).orElse(null);

        List<FileInfoDTO> fileInfoList = new ArrayList<>();


        List<Long> fileIds = msgFileMapMapper.findFileIdsByMsgId(msg.getId());

        if (!CollectionUtils.isEmpty(fileIds)) {

            List<CmnFile> files = cmnFileService.findFilesByIds(fileIds);


            fileInfoList = files.stream()
                    .map(cmnFile -> FileInfoDTO.builder()
                            .id(cmnFile.getId())
                            .name(cmnFile.getOriginalName())
                            .type(cmnFile.getFileType())
                            .size(cmnFile.getFileSize())

                            .downloadUrl("/api/msg/files/download/" + cmnFile.getId())
                            .build())
                    .collect(Collectors.toList());
        }

        return MsgInfoDTO.builder()
                .id(msg.getId())
                .chnId(msg.getChnId())
                .content(msg.getContent())
                .regDt(msg.getRegDt())
                .sender(senderInfo)
                .files(fileInfoList)
                .build();
    }
}
