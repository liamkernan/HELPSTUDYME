package com.yourpackage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class QuestionRequest {
    
    @NotBlank(message = "Subject is required")
    @Size(min = 2, max = 100, message = "Subject must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\s\\-_.()]+$", message = "Subject contains invalid characters")
    private String subject;
    
    @Pattern(regexp = "^(multiple-choice|free-response)$", message = "Type must be 'multiple-choice' or 'free-response'")
    private String type = "multiple-choice";

    public QuestionRequest() {}

    public QuestionRequest(String subject, String type) {
        this.subject = subject;
        this.type = type;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}