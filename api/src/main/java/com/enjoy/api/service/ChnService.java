package com.enjoy.api.service;

import com.enjoy.api.mapper.*;
import com.enjoy.common.domain.Chn;
import com.enjoy.common.domain.ChnAgcMap;
import com.enjoy.common.domain.ChnLog;
import com.enjoy.common.domain.Usr;
import com.enjoy.common.dto.agc.AgcInfoDTO;
import com.enjoy.common.dto.chn.ChnAddDTO;
import com.enjoy.common.dto.chn.ChnClosedDTO;
import com.enjoy.common.dto.chn.ChnInfoDTO;
import com.enjoy.common.dto.chn.ChnSearchCondition;
import com.enjoy.common.dto.msg.MsgInfoDTO;
import com.enjoy.common.dto.msg.MsgSendDTO;
import com.enjoy.common.dto.usr.UsrInfoDTO;
import com.enjoy.common.exception.BusinessException;
import com.enjoy.common.exception.ErrorCodes;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ChnService {

    private final ChnMapper chnMapper;
    private final ChnAgcMapMapper chnAgcMapMapper;
    private final ChnLogMapper chnLogMapper;
    private final UsrMapper usrMapper;
    private final SimpMessageSendingOperations messagingTemplate;
    private final ChnUsrReadStatusMapper chnUsrReadStatusMapper;
    private final CmnSeqService cmnSeqService;

    public ChnInfoDTO createChannelByAgency(String loginId, ChnAddDTO requestDTO) {
        Usr creator = usrMapper.findByLoginId(loginId)
                .orElseThrow(() -> new BusinessException(ErrorCodes.USER_NOT_FOUND, loginId));
        requestDTO.setAgcIds(Collections.singletonList(creator.getAgcId()));
        return createChannelInternal(creator.getId(), requestDTO);
    }

    public ChnInfoDTO createChannelByAdmin(String loginId, ChnAddDTO requestDTO) {
        Usr creator = usrMapper.findByLoginId(loginId)
                .orElseThrow(() -> new BusinessException(ErrorCodes.USER_NOT_FOUND, loginId));
        return createChannelInternal(creator.getId(), requestDTO);
    }

    public void closeChannel(Long chnId, Long resolverId, ChnClosedDTO requestDTO) {
        Chn chn = chnMapper.findById(chnId)
                .orElseThrow(() -> new BusinessException(ErrorCodes.CHANNEL_NOT_FOUND, chnId));

        String oldStatus = chn.getStatus();
        chn.close(requestDTO.getCategory());
        chnMapper.update(chn);

        long chnLogId = cmnSeqService.getNextSequenceValue("CHN_LOG");

        ChnLog log = ChnLog.builder().id(chnLogId).chnId(chnId).usrId(resolverId)
                .oldStatus(oldStatus).newStatus(chn.getStatus()).build();
        chnLogMapper.insert(log);
    }

    public List<String> findParticipantLoginIdsByChnId(Long chnId) {

        Chn chn = chnMapper.findById(chnId)
                .orElseThrow(() -> new BusinessException(ErrorCodes.CHANNEL_NOT_FOUND, chnId));
        Long creatorId = chn.getCreatorId();


        List<Long> agcIds = chnAgcMapMapper.findAgcIdsByChnId(chnId);


        List<String> participantLoginIds = new java.util.ArrayList<>();
        if (!agcIds.isEmpty()) {
            participantLoginIds.addAll(usrMapper.findLoginIdsByAgcIds(agcIds));
        }


        String creatorLoginId = usrMapper.findLoginIdById(creatorId);
        if (creatorLoginId != null && !participantLoginIds.contains(creatorLoginId)) {
            participantLoginIds.add(creatorLoginId);
        }

        List<String> adminRoles = List.of("SUPER_ADMIN", "OPERATOR");
        List<String> adminLoginIds = usrMapper.findLoginIdsByRoles(adminRoles);

        if (adminLoginIds != null) {
            participantLoginIds.addAll(adminLoginIds);
        }


        return participantLoginIds.stream().distinct().collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ChnInfoDTO findChannelById(Long chnId) {
        Chn chn = chnMapper.findById(chnId)
                .orElseThrow(() -> new BusinessException(ErrorCodes.CHANNEL_NOT_FOUND, chnId));

        UsrInfoDTO creator = usrMapper.findInfoById(chn.getCreatorId()).orElse(null);
        List<AgcInfoDTO> participants = chnAgcMapMapper.findParticipantsByChnId(chnId);
        List<MsgInfoDTO> msgs = Collections.emptyList();

        return convertToInfoDTO(chn, creator, participants, msgs);
    }

    @Transactional(readOnly = true)
    public List<ChnInfoDTO> findAllChannels(ChnSearchCondition condition, Pageable pageable) {
        return findChannelsInternal(condition);
    }

    @Transactional(readOnly = true)
    public List<ChnInfoDTO> findChannelsByAgency(Long agcId, ChnSearchCondition condition, Pageable pageable) {
        condition.setAgencyId(agcId);
        return findChannelsInternal(condition);
    }

    @Transactional(readOnly = true)
    public ChnInfoDTO findChannelByIdForAgency(Long chnId, Long userAgcId) {
        ChnInfoDTO channelInfo = this.findChannelById(chnId);
        boolean isParticipant = channelInfo.getParticipants().stream()
                .anyMatch(agc -> agc.getId().equals(userAgcId));
        if (!isParticipant) {
            throw new BusinessException(ErrorCodes.ACCESS_DENIED);
        }
        return channelInfo;
    }

    @Transactional
    public void markChannelAsRead(Long chnId, Long userId) {
        Long lastMsgId = chnUsrReadStatusMapper.findLastMsgIdByChnId(chnId);
        if (lastMsgId != null) {
            chnUsrReadStatusMapper.upsertReadStatus(chnId, userId, lastMsgId);
        }
    }

    public void updateChannelStatus(Long chnId, String status) {
        chnMapper.updateStatus(chnId, status);
    }


    private ChnInfoDTO createChannelInternal(Long creatorId, ChnAddDTO requestDTO) {
        long nextChnId = cmnSeqService.getNextSequenceValue("CHN");
        Chn chn = Chn.builder()
                .id(nextChnId)
                .type(requestDTO.getType())
                .title(requestDTO.getTitle())
                .status("IN_PROGRESS")
                .creatorId(creatorId)
                .category(requestDTO.getCategory())
                .build();
        chnMapper.insert(chn);

        if (!CollectionUtils.isEmpty(requestDTO.getAgcIds())) {
            List<ChnAgcMap> mapList = requestDTO.getAgcIds().stream()
                    .map(agcId -> new ChnAgcMap(chn.getId(), agcId))
                    .collect(Collectors.toList());
            chnAgcMapMapper.bulkInsert(mapList);
        }


        ChnInfoDTO newChannelInfo = findChannelById(chn.getId());


        List<String> participantLoginIds = findParticipantLoginIdsByChnId(chn.getId());
        participantLoginIds.forEach(id -> {
            messagingTemplate.convertAndSend("/topic/user/" + id, newChannelInfo);
        });
        return newChannelInfo;
    }

    private List<ChnInfoDTO> findChannelsInternal(ChnSearchCondition condition) {
        Long currentUserId = getCurrentUserId();
        List<Chn> chnList = chnMapper.findWithPagingAndFilter(condition);

        if (chnList.isEmpty()) { return Collections.emptyList(); }

        Set<Long> chnIds = chnList.stream().map(Chn::getId).collect(Collectors.toSet());

        List<Map<String, Object>> readStatusList = chnUsrReadStatusMapper.findLastReadMsgIdsByUser(currentUserId, chnIds);

        Map<Long, Long> lastReadMap;
        if (readStatusList != null) {
            lastReadMap = readStatusList.stream()
                    .filter(map -> map.get("mapKey") instanceof Number && map.get("mapValue") instanceof Number)
                    .collect(Collectors.toMap(
                            map -> ((Number) map.get("mapKey")).longValue(),
                            map -> ((Number) map.get("mapValue")).longValue(),
                            (existingValue, newValue) -> newValue
                    ));
        } else {
            lastReadMap = Collections.emptyMap();
        }

        Map<Long, Long> unreadCountMap = chnList.stream()
                .collect(Collectors.toMap(
                        Chn::getId,
                        chn -> {
                            Long currentChnId = chn.getId();
                            Long lastReadMsgId = lastReadMap.get(currentChnId);
                            Long channelLastMsgId = chn.getLastMsgId();

                            long count;
                            if (lastReadMsgId == null) {
                                count = chnUsrReadStatusMapper.countUnreadMessages(currentChnId, 0L);
                            } else if (channelLastMsgId != null && lastReadMsgId < channelLastMsgId) {
                                count = chnUsrReadStatusMapper.countUnreadMessages(currentChnId, lastReadMsgId);
                            } else {
                                count = 0L;
                            }
                            return count;
                        }
                ));


        List<Long> creatorIds = chnList.stream().map(Chn::getCreatorId).distinct().collect(Collectors.toList());
        Map<Long, UsrInfoDTO> creatorMap = usrMapper.findInfoByIds(creatorIds).stream()
                .collect(Collectors.toMap(UsrInfoDTO::getId, Function.identity()));
        Map<Long, List<AgcInfoDTO>> participantsMap = chnAgcMapMapper.findParticipantsByChnIds(chnList.stream().map(Chn::getId).collect(Collectors.toList())).stream()
                .collect(Collectors.groupingBy(AgcInfoDTO::getChnId));
        List<ChnInfoDTO> dtoList = chnList.stream().map(chn -> convertToInfoDTO(
                chn,
                creatorMap.get(chn.getCreatorId()),
                participantsMap.getOrDefault(chn.getId(), Collections.emptyList()),
                unreadCountMap.getOrDefault(chn.getId(), 0L)
        )).collect(Collectors.toList());
        return dtoList;
    }

    private ChnInfoDTO convertToInfoDTO(Chn chn, UsrInfoDTO creator, List<AgcInfoDTO> participants, long unreadCount) {
        String title = chn.getTitle();
        String type = chn.getType();


        if ("DM".equals(type)) {
            if (participants != null && !participants.isEmpty()) {

                title = participants.get(0).getName();
                if (participants.size() > 1) {
                    title += " 외 " + (participants.size() - 1) + "개";
                }
            } else {
                title = "DM";
            }
        }
        return ChnInfoDTO.builder()
                .id(chn.getId())
                .title(title)
                .category(chn.getCategory())
                .status(chn.getStatus())
                .regDt(chn.getRegDt())
                .creator(creator)
                .participants(participants)
                .type(type)
                .unreadCount(unreadCount)
                .lastMessage(chn.getLastMessage())
                .lastMessageTime(chn.getLastMessageTime())
                .build();
    }

    private ChnInfoDTO convertToInfoDTO(Chn chn, UsrInfoDTO creator, List<AgcInfoDTO> participants, List<MsgInfoDTO> msgs) {
        String title = chn.getTitle();
        String type = chn.getType();


        if ("DM".equals(type)) {
            if (participants != null && !participants.isEmpty()) {

                title = participants.get(0).getName();
                if (participants.size() > 1) {
                    title += " 외 " + (participants.size() - 1) + "개";
                }
            } else {
                title = "DM";
            }
        }
        return ChnInfoDTO.builder()
                .id(chn.getId())
                .title(title)
                .category(chn.getCategory())
                .status(chn.getStatus())
                .regDt(chn.getRegDt())
                .messages(msgs)
                .creator(creator)
                .participants(participants)
                .type(type)
                .lastMessage(chn.getLastMessage())
                .lastMessageTime(chn.getLastMessageTime())
                .build();
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();

            String loginId;
            if (principal instanceof UserDetails) {
                loginId = ((UserDetails) principal).getUsername();
            } else if (principal instanceof String) {
                loginId = (String) principal;
            } else {
                loginId = null;
            }

            if (loginId == null) {
                throw new BusinessException(ErrorCodes.ACCESS_DENIED);
            }

            Usr currentUser = usrMapper.findByLoginId(loginId)
                    .orElseThrow(() -> new BusinessException(ErrorCodes.USER_NOT_FOUND, loginId));
            return currentUser.getId();
        }

        throw new BusinessException(ErrorCodes.ACCESS_DENIED);
    }
}
