package com.enjoy.api.service;

import com.enjoy.api.mapper.AgcDtlMapper;
import com.enjoy.api.mapper.AgcMapper;
import com.enjoy.api.mapper.UsrMapper;
import com.enjoy.api.service.usr.UsrService;
import com.enjoy.common.domain.Agc;
import com.enjoy.common.domain.AgcDtl;
import com.enjoy.common.dto.agc.*;
import com.enjoy.common.dto.usr.UsrAddDTO;
import com.enjoy.common.dto.usr.UsrInfoDTO;
import com.enjoy.common.exception.BusinessException;
import com.enjoy.common.exception.ErrorCodes;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AgcService {

    private final AgcMapper agcMapper;
    private final AgcDtlMapper agcDtlMapper;
    private final UsrService usrService;


    @Transactional
    public AgcInfoDTO createAgency(AgcAddDTO requestDTO) {
        Agc agc = Agc.builder()
                .code(requestDTO.getCode())
                .name(requestDTO.getName())
                .build();
        agcMapper.insert(agc);

        AgcDtl agcDtl = AgcDtl.builder()
                .agcId(agc.getId())
                .bizNum(requestDTO.getBizNum())
                .email(requestDTO.getEmail())
                .zipCode(requestDTO.getZipCode())
                .baseAddr(requestDTO.getBaseAddr())
                .dtlAddr(requestDTO.getDtlAddr())
                .tel(requestDTO.getTel())
                .ceo(requestDTO.getCeo())
                .build();
        agcDtlMapper.insert(agcDtl);

        UsrAddDTO usrToAdd = requestDTO.getUsr();
        if (usrToAdd != null) {
            usrToAdd.setAgcId(agc.getId());
            usrToAdd.setRole("AGENCY_ADMIN");
            usrService.createUserBySuperAdmin(usrToAdd);
        }

        return this.findAgencyById(agc.getId());
    }


    public void deleteAgency(Long agcId) {
        Agc agc = agcMapper.findById(agcId)
                .orElseThrow(() -> new BusinessException(ErrorCodes.AGENCY_NOT_FOUND, agcId));
        agc.softDelete();
        agcMapper.update(agc);
    }


    public AgcInfoDTO findAgencyById(Long agcId) {
        Agc agc = agcMapper.findById(agcId)
                .orElseThrow(() -> new BusinessException(ErrorCodes.AGENCY_NOT_FOUND, agcId));
        AgcDtl agcDtl = agcDtlMapper.findById(agcId).orElse(new AgcDtl());
        UsrInfoDTO managerInfo = usrService.findFirstManagerByAgcId(agcId)
                .orElse(null);
        return convertToInfoDTO(agc, agcDtl, managerInfo);
    }

    @Transactional(readOnly = true)
    public List<AgcInfoDTO> findAllAgenciesNoPaging(AgcSearchCondition condition) {

        return agcMapper.findAllNoPaging(condition);
    }


    @Transactional(readOnly = true)
    public Page<AgcInfoDTO> findAllAgencies(AgcSearchCondition condition, Pageable pageable) {
        List<AgcInfoDTO> content = agcMapper.findWithPagingAndFilter(condition, pageable);
        long total = agcMapper.countWithFilter(condition);
        return new PageImpl<>(content, pageable, total);
    }


    public AgcInfoDTO updateAgencyBySuperAdmin(Long agcId, AgcUpdateDTO requestDTO) {
        Agc agc = agcMapper.findById(agcId)
                .orElseThrow(() -> new BusinessException(ErrorCodes.AGENCY_NOT_FOUND, agcId));
        AgcDtl agcDtl = agcDtlMapper.findById(agcId)
                .orElseThrow(() -> new BusinessException(ErrorCodes.AGENCY_NOT_FOUND, agcId));
        agc.update(requestDTO.getCode(), requestDTO.getName());
        agcDtl.update(requestDTO.getBizNum(), requestDTO.getEmail(), requestDTO.getZipCode(), requestDTO.getBaseAddr(), requestDTO.getDtlAddr(), requestDTO.getTel(), requestDTO.getCeo());

        agcMapper.update(agc);
        agcDtlMapper.update(agcDtl);

        return findAgencyById(agcId);
    }

    @Transactional
    public void bulkDeleteAgencies(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return;
        }
        agcMapper.bulkUpdateStatus(ids, "DELETED");
    }


    @Transactional
    public void bulkUpdateStatus(List<Long> ids, String status) {
        if (status == null || status.isEmpty()) {
            return;
        }
        if (ids == null || ids.isEmpty()) {
            return;
        }
        agcMapper.bulkUpdateStatus(ids, status);
    }





    private AgcInfoDTO convertToInfoDTO(Agc agc, AgcDtl agcDtl, UsrInfoDTO usrInfo) {
        return AgcInfoDTO.builder()
                .id(agc.getId())
                .code(agc.getCode())
                .name(agc.getName())
                .regDt(agc.getRegDt())
                .bizNum(agcDtl.getBizNum())
                .email(agcDtl.getEmail())
                .zipCode(agcDtl.getZipCode())
                .baseAddr(agcDtl.getBaseAddr())
                .dtlAddr(agcDtl.getDtlAddr())
                .tel(agcDtl.getTel())
                .ceo(agcDtl.getCeo())
                .manager(usrInfo)
                .build();
    }


}
