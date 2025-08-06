package com.yourpackage;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    // CORS configuration moved to SecurityConfig for better security integration
    // This class is kept for future MVC configuration needs
}