// Update QuestionController.java
package com.yourpackage.controller;

import java.util.*;
import com.yourpackage.model.HistoryEvaluation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.yourpackage.service.OpenAIService;
import com.yourpackage.model.FreeResponseEvaluation;
import com.yourpackage.model.EvaluationRequest;

@RestController
@RequestMapping("/api")
public class QuestionController {
    private final OpenAIService openAIService;

    // Inject OpenAIService through constructor
    public QuestionController(OpenAIService openAIService) {
        this.openAIService = openAIService;
    }

    // Dynamic endpoint that handles all subjects and question types
    @GetMapping("/question/{subject}")
    public String generateQuestion(@PathVariable String subject, @RequestParam(required = false, defaultValue = "multiple-choice") String type) {
        String prompt = getPromptForSubject(subject, type);
        return openAIService.generateQuestion(prompt, type);
    }

    @GetMapping("/question-history")
    public List<HistoryEvaluation> getQuestionHistory() {
        return HistoryEvaluation.list;
    }

    // Endpoint to evaluate free response answers
    @PostMapping("/evaluate")
    public ResponseEntity<FreeResponseEvaluation> evaluateResponse(@RequestBody EvaluationRequest request) {
        FreeResponseEvaluation evaluation = openAIService.evaluateFreeResponse(
                request.getSubject(),
                request.getQuestion(),
                request.getResponse()
        );
        return ResponseEntity.ok(evaluation);
    }

    // Helper method to determine the appropriate prompt based on the subject and question type
    private String getPromptForSubject(String subject, String type) {
        String basePrompt;

        if ("free-response".equals(type)) {
            basePrompt = "Create a challenging AP-level free response question for ";
        } else {
            basePrompt = "Create a challenging AP-level multiple choice question for ";
        }

        return basePrompt + subject + ".";
    }
}