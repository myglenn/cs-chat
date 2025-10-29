package com.enjoy.web.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class MainController {

    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

    @GetMapping("/")
    public String mainPage() {
        return "index";
    }

    @GetMapping("/agency")
    public String agencyPage() {
        return "agency";
    }

    @GetMapping("/user")
    public String userPage() {
        return "user";
    }

    @GetMapping("/consultation")
    public String consultationPage() {
        return "index";
    }

}
