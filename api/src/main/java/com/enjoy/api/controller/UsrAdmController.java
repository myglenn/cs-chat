package com.enjoy.api.controller;

import com.enjoy.api.service.usr.UsrService;
import com.enjoy.common.dto.usr.UsrAddDTO;
import com.enjoy.common.dto.usr.UsrInfoDTO;
import com.enjoy.common.dto.usr.UsrSearchCondition;
import com.enjoy.common.dto.usr.UsrUpdateDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class UsrAdmController {
    private final UsrService usrService;


    @PostMapping
    public ResponseEntity<UsrInfoDTO> createUser(@RequestBody UsrAddDTO requestDTO) {
        UsrInfoDTO createdUser = usrService.createUserBySuperAdmin(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UsrInfoDTO> getUserById(@PathVariable Long userId) {
        UsrInfoDTO userInfo = usrService.findUsrById(userId);
        return ResponseEntity.ok(userInfo);
    }


    @GetMapping
    public ResponseEntity<Page<UsrInfoDTO>> getAllUsers(
            UsrSearchCondition condition,
            Pageable pageable
    ) {
        Page<UsrInfoDTO> userPage = usrService.findAllUsersBySuperAdmin(condition, pageable);
        return ResponseEntity.ok(userPage);
    }


    @PutMapping("/{userId}")
    public ResponseEntity<UsrInfoDTO> updateUser(@PathVariable Long userId, @RequestBody UsrUpdateDTO requestDTO) {
        UsrInfoDTO updatedUser = usrService.updateUserBySuperAdmin(userId, requestDTO);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        usrService.deleteUserBySuperAdmin(userId);
        return ResponseEntity.noContent().build();
    }
}
