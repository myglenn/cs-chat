package com.enjoy.api.controller;

import com.enjoy.api.service.AgcService;
import com.enjoy.api.service.usr.UsrService;
import com.enjoy.common.dto.agc.AgcInfoDTO;
import com.enjoy.common.dto.agc.AgcMyUpdateDTO;
import com.enjoy.common.dto.usr.UsrInfoDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/agency/my-agency")
@PreAuthorize("hasRole('AGENCY_ADMIN')")
@RequiredArgsConstructor
public class AgcAgencyController {
    private final AgcService agcService;
    private final UsrService usrService;

    @GetMapping
    public ResponseEntity<AgcInfoDTO> getMyAgencyInfo(@AuthenticationPrincipal UserDetails userDetails) {
        UsrInfoDTO adminInfo = usrService.findMyInfo(userDetails.getUsername());
        AgcInfoDTO agencyInfo = agcService.findAgencyById(adminInfo.getAgcId());
        return ResponseEntity.ok(agencyInfo);
    }
}
