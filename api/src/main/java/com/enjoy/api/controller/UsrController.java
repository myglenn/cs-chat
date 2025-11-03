package com.enjoy.api.controller;

import com.enjoy.api.service.usr.UsrService;
import com.enjoy.common.dto.usr.UsrInfoDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UsrController {
    private final UsrService usrService;


    @GetMapping("/me")
    public ResponseEntity<UsrInfoDTO> getMyInfo(@AuthenticationPrincipal UserDetails userDetails) {
        String loginId = userDetails.getUsername();
        UsrInfoDTO myInfo = usrService.findMyInfo(loginId);
        return ResponseEntity.ok(myInfo);
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> updateMyPassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> payload) {

        String loginId = userDetails.getUsername();
        String currentPassword = payload.get("currentPassword");
        String newPassword = payload.get("newPassword");

        usrService.updateMyPassword(loginId, currentPassword, newPassword);

        return ResponseEntity.ok().build();
    }


}
