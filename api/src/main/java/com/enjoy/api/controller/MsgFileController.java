package com.enjoy.api.controller;

import com.enjoy.api.service.CmnFileService;
import com.enjoy.api.service.MsgService;
import com.enjoy.api.service.usr.UsrService;
import com.enjoy.common.dto.usr.UsrAccountDTO;
import org.springframework.core.io.Resource;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/msg/files")
@RequiredArgsConstructor
public class MsgFileController {
    private final CmnFileService cmnFileService;
    private final MsgService msgService;
    private final UsrService usrService;

    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        UsrAccountDTO currentUser = usrService.findUserAccountByLoginId(userDetails.getUsername());
        Long uploaderId = currentUser.getId();
        Long fileId = cmnFileService.storeFile(file, uploaderId);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("fileId", fileId));
    }

    @GetMapping("/download/{fileId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long fileId,
            @AuthenticationPrincipal UserDetails userDetails) {

        String currentUserLoginId = userDetails.getUsername();
        Resource resource = msgService.getFileResourceForDownload(fileId, currentUserLoginId);
        String originalFilename = msgService.getOriginalFilenameForDownload(fileId);
        String encodedFilename = URLEncoder.encode(originalFilename, StandardCharsets.UTF_8).replaceAll("\\+", "%20");
        MediaType contentType = MediaType.APPLICATION_OCTET_STREAM;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(contentType);

        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedFilename + "\"; filename*=UTF-8''" + encodedFilename);


        try {
            headers.setContentLength(resource.contentLength());
        } catch (IOException e) {
            log.warn("다운로드 파일 크기 확인 불가: {}", fileId, e);
        }


        return ResponseEntity.ok()
                .headers(headers)
                .body(resource);
    }

}
