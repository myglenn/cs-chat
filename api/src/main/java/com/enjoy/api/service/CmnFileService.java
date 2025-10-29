package com.enjoy.api.service;

import com.enjoy.api.mapper.CmnFileMapper;
import com.enjoy.common.domain.CmnFile;
import com.enjoy.common.exception.BusinessException;
import com.enjoy.common.exception.ErrorCodes;
import org.springframework.beans.factory.annotation.Value;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CmnFileService {
    private final CmnFileMapper cmnFileMapper;
    private final CmnSeqService cmnSeqService;

    @Value("${file.upload-dir}")
    private String uploadBaseDir;

    @Transactional
    public Long storeFile(MultipartFile file, Long uploaderId) {
        if (file.isEmpty()) {

            throw new BusinessException(ErrorCodes.INVALID_ARGUMENT);
        }

        try {

            long fileId = cmnSeqService.getNextSequenceValue("CMN_FILE");


            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }


            String storedFilename = UUID.randomUUID().toString() + fileExtension;


            LocalDateTime now = LocalDateTime.now();
            String datePath = now.format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
            Path storageDirectory = Paths.get(uploadBaseDir, datePath).toAbsolutePath().normalize();


            Files.createDirectories(storageDirectory);

            Path targetLocation = storageDirectory.resolve(storedFilename);


            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);


            CmnFile cmnFile = CmnFile.builder()
                    .id(fileId)
                    .originalName(originalFilename)
                    .storedPath(targetLocation.toString())
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .uploaderId(uploaderId)
                    .uploadDt(now)
                    .build();


            cmnFileMapper.insert(cmnFile);


            return fileId;

        } catch (IOException ex) {
            log.error("파일 저장 중 오류 발생: {}", file.getOriginalFilename(), ex);

            throw new BusinessException(ErrorCodes.FILE_STORAGE_ERROR, ex);
        }
    }

    @Transactional(readOnly = true)
    public Resource loadFileResourceById(Long fileId) {

        CmnFile cmnFile = cmnFileMapper.findById(fileId)
                .orElseThrow(() -> new BusinessException(ErrorCodes.FILE_NOT_FOUND, fileId));




        try {
            Path filePath = Paths.get(cmnFile.getStoredPath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                log.error("File not found or not readable at path: {}", cmnFile.getStoredPath());
                throw new BusinessException(ErrorCodes.FILE_NOT_FOUND, "File not readable");
            }
        } catch (MalformedURLException ex) {
            log.error("Malformed URL for file path: {}", cmnFile.getStoredPath(), ex);
            throw new BusinessException(ErrorCodes.INVALID_FILE_PATH, ex);
        }
    }

    @Transactional(readOnly = true)
    public String getOriginalFilename(Long fileId) {
        CmnFile cmnFile = cmnFileMapper.findById(fileId)
                .orElseThrow(() -> new BusinessException(ErrorCodes.FILE_NOT_FOUND, fileId));

        return cmnFile.getOriginalName();
    }

    @Transactional(readOnly = true)
    public List<CmnFile> findFilesByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return new ArrayList<>();
        }
        return cmnFileMapper.findByIds(ids);
    }
}
