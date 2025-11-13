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

    @PostMapping("/me/check-password")
    public ResponseEntity<Map<String, Boolean>> checkMyPassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> payload) {
        String loginId = userDetails.getUsername();
        String password = payload.get("password");
        boolean isMatch = usrService.checkMyPassword(loginId, password);
        return ResponseEntity.ok(Map.of("isMatch", isMatch));
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

    @PutMapping("/me/name")
    public ResponseEntity<UsrInfoDTO> updateMyName(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> payload) {

        String loginId = userDetails.getUsername();
        String newName = payload.get("name");

        UsrInfoDTO updatedUser = usrService.updateMyName(loginId, newName);

        return ResponseEntity.ok(updatedUser);
    }


}
