package com.enjoy.api.controller;

import com.enjoy.api.mapper.TestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class TestController {
    private final TestMapper testMapper;

    @GetMapping("/test/time")
    public String time() {
        return "Database current time: " + testMapper.getCurrentTime();
    }

}
