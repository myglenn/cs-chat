package com.enjoy.api.controller;

import com.enjoy.api.service.CmnCdService;
import com.enjoy.common.domain.CmnCd;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/common-codes")
@RequiredArgsConstructor
public class CmnCdController {
    private final CmnCdService cmnCdService;

    @GetMapping("/{groupCode}")
    public ResponseEntity<List<CmnCd>> getCodesByGroup(@PathVariable String groupCode) {

        List<CmnCd> codes = cmnCdService.getCodesByGroup(groupCode);
        return ResponseEntity.ok(codes);
    }
}
