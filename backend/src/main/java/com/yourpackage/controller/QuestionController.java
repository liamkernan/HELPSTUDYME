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

    public QuestionController(OpenAIService openAIService) {
        this.openAIService = openAIService;
    }

    @GetMapping("/question/{subject}")
    public String generateQuestion(@PathVariable String subject, @RequestParam(required = false, defaultValue = "multiple-choice") String type) {
        String prompt = getPromptForSubject(subject, type);
        return openAIService.generateQuestion(prompt, type);
    }

    @GetMapping("/guide")
    public String generateGuide(@RequestParam("subject") String subject) {
        String prompt = getPromptForGuide(subject);
        return openAIService.generateGuide(prompt);
    }

    @GetMapping("/question-history")
    public List<HistoryEvaluation> getQuestionHistory() {
        return HistoryEvaluation.getTotal();
    }

    @PostMapping("/submit-evaluation")
    public ResponseEntity<HistoryEvaluation> submitEvaluation(
            @RequestParam("prompt") String prompt,
            @RequestParam("correct") boolean correct
    ) {
        HistoryEvaluation evaluation = new HistoryEvaluation(prompt, correct);
        return ResponseEntity.ok(evaluation);
    }

    @PostMapping("/evaluate")
    public ResponseEntity<FreeResponseEvaluation> evaluateResponse(@RequestBody EvaluationRequest request) {
        FreeResponseEvaluation evaluation = openAIService.evaluateFreeResponse(
                request.getSubject(),
                request.getQuestion(),
                request.getResponse()
        );
        return ResponseEntity.ok(evaluation);
    }

    private String getPromptForSubject(String subject, String type) {
        String basePrompt;

        if ("free-response".equals(type)) {
            basePrompt = "Create a challenging AP-level free response question for ";
        } else {
            basePrompt = "Create a challenging AP-level multiple choice question for ";
        }

        return basePrompt + subject + ".";
    }

    private String getPromptForGuide(String subject) {
        String base = "Create a study guide for " + subject + ".";

        return base;
    }
}