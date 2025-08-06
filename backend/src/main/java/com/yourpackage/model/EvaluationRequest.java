package com.yourpackage.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class EvaluationRequest {
    
    @NotBlank(message = "Subject is required")
    @Size(min = 2, max = 100, message = "Subject must be between 2 and 100 characters")
    private String subject;
    
    @NotBlank(message = "Question is required")
    @Size(min = 10, max = 5000, message = "Question must be between 10 and 5000 characters")
    private String question;
    
    @NotBlank(message = "Response is required")
    @Size(min = 10, max = 10000, message = "Response must be between 10 and 10000 characters")
    private String response;

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }
}
