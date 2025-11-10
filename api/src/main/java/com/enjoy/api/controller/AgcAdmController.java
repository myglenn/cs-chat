package com.enjoy.api.controller;

import com.enjoy.api.service.AgcService;
import com.enjoy.common.dto.agc.AgcAddDTO;
import com.enjoy.common.dto.agc.AgcInfoDTO;
import com.enjoy.common.dto.agc.AgcSearchCondition;
import com.enjoy.common.dto.agc.AgcUpdateDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/agencies")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'OPERATOR')")
@RequiredArgsConstructor
public class AgcAdmController {
    private final AgcService agcService;
    private final ObjectMapper objectMapper;


    @PostMapping
    public ResponseEntity<AgcInfoDTO> createAgency(@RequestBody AgcAddDTO requestDTO,
                                                   HttpServletRequest request) {
        String baseUrl = request.getScheme() + "://" + request.getServerName() +
                (request.getServerPort() == 80 || request.getServerPort() == 443 ? "" : ":" + request.getServerPort());
        AgcInfoDTO createdAgency = agcService.createAgency(requestDTO, baseUrl);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAgency);
    }

    @GetMapping
    public ResponseEntity<Page<AgcInfoDTO>> getAllAgencies(AgcSearchCondition condition, Pageable pageable) {
        Page<AgcInfoDTO> agencyPage = agcService.findAllAgencies(condition, pageable);
        return ResponseEntity.ok(agencyPage);
    }

    @GetMapping("/{agcId}")
    public ResponseEntity<AgcInfoDTO> getAgencyById(@PathVariable Long agcId) {
        AgcInfoDTO agencyInfo = agcService.findAgencyById(agcId);
        return ResponseEntity.ok(agencyInfo);
    }

    @PutMapping("/{agcId}")
    public ResponseEntity<AgcInfoDTO> updateAgency(@PathVariable Long agcId, @RequestBody AgcUpdateDTO requestDTO) {
        AgcInfoDTO updatedAgency = agcService.updateAgencyBySuperAdmin(agcId, requestDTO);
        return ResponseEntity.ok(updatedAgency);
    }

    @DeleteMapping("/{agcId}")
    public ResponseEntity<Void> deleteAgency(@PathVariable Long agcId) {
        agcService.deleteAgency(agcId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<AgcInfoDTO>> searchAllAgencies(AgcSearchCondition condition) {

        List<AgcInfoDTO> agencyList = agcService.findAllAgenciesNoPaging(condition);
        return ResponseEntity.ok(agencyList);
    }

    @PostMapping("/bulk-delete")
    public ResponseEntity<Void> bulkDeleteAgencies(@RequestBody List<Long> ids) {
        agcService.bulkDeleteAgencies(ids);
        return ResponseEntity.noContent().build();
    }


    @PostMapping("/bulk-status-change")
    public ResponseEntity<Void> bulkUpdateAgencyStatus(@RequestBody Map<String, Object> payload) {
        List<Long> ids = objectMapper.convertValue(payload.get("ids"), new TypeReference<List<Long>>() {});
        String status = (String) payload.get("status");
        agcService.bulkUpdateStatus(ids, status);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{agcId}/password")
    public ResponseEntity<Void> updateAgencyManagerPassword(
            @PathVariable Long agcId,
            @RequestBody Map<String, String> payload) {

        String newPassword = payload.get("newPassword");
        agcService.updateAgencyManagerPassword(agcId, newPassword);

        return ResponseEntity.ok().build();
    }

}
