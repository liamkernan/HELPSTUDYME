package com.yourpackage.controller;

import java.util.*;
import com.yourpackage.model.HistoryEvaluation;
import com.yourpackage.dto.QuestionRequest;
import com.yourpackage.security.FirebaseUserPrincipal;
import com.yourpackage.service.RateLimitingService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import com.yourpackage.service.OpenAIService;
import com.yourpackage.service.PromptMemoryService;
import com.yourpackage.model.FreeResponseEvaluation;
import com.yourpackage.model.EvaluationRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.validation.annotation.Validated;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api")
@Validated
public class QuestionController {
    private static final Logger logger = LoggerFactory.getLogger(QuestionController.class);
    
    private final OpenAIService openAIService;
    private final PromptMemoryService memoryService;
    private final RateLimitingService rateLimitingService;

    public QuestionController(OpenAIService openAIService, PromptMemoryService memoryService, 
                             RateLimitingService rateLimitingService) {
        this.openAIService = openAIService;
        this.memoryService = memoryService;
        this.rateLimitingService = rateLimitingService;
    }

    @GetMapping("/question/{subject}")
    public ResponseEntity<?> generateQuestion(
            @PathVariable @Size(min = 2, max = 100) @Pattern(regexp = "^[a-zA-Z0-9\\s\\-_.()]+$") String subject,
            @RequestParam(required = false, defaultValue = "multiple-choice") 
            @Pattern(regexp = "^(multiple-choice|free-response)$") String type,
            Authentication authentication) {
        
        FirebaseUserPrincipal user = (FirebaseUserPrincipal) authentication.getPrincipal();
        String userId = user.getUid();
        
        // Rate limiting check
        if (!rateLimitingService.isQuestionRequestAllowed(userId)) {
            logger.warn("Rate limit exceeded for user: {}", userId);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(Map.of("error", "Rate limit exceeded. Please try again later."));
        }
        
        try {
            String prompt = getPromptForSubject(subject, type);
            String question = openAIService.generateQuestion(prompt, type, subject);
            
            logger.info("Generated question for user: {} subject: {} type: {}", userId, subject, type);
            return ResponseEntity.ok(question);
            
        } catch (Exception e) {
            logger.error("Error generating question for user: {} subject: {}", userId, subject, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to generate question"));
        }
    }

    @GetMapping("/guide")
    public ResponseEntity<?> generateGuide(
            @RequestParam("subject") @Size(min = 2, max = 100) 
            @Pattern(regexp = "^[a-zA-Z0-9\\s\\-_.()]+$") String subject,
            Authentication authentication) {
        
        FirebaseUserPrincipal user = (FirebaseUserPrincipal) authentication.getPrincipal();
        String userId = user.getUid();
        
        // Use question rate limit for guides as well
        if (!rateLimitingService.isQuestionRequestAllowed(userId)) {
            logger.warn("Rate limit exceeded for guide request, user: {}", userId);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(Map.of("error", "Rate limit exceeded. Please try again later."));
        }
        
        try {
            String prompt = getPromptForGuide(subject);
            String guide = openAIService.generateGuide(prompt);
            
            logger.info("Generated guide for user: {} subject: {}", userId, subject);
            return ResponseEntity.ok(guide);
            
        } catch (Exception e) {
            logger.error("Error generating guide for user: {} subject: {}", userId, subject, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to generate guide"));
        }
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
    public ResponseEntity<?> evaluateResponse(@Valid @RequestBody EvaluationRequest request,
                                             Authentication authentication) {
        
        FirebaseUserPrincipal user = (FirebaseUserPrincipal) authentication.getPrincipal();
        String userId = user.getUid();
        
        // Rate limiting check for evaluations
        if (!rateLimitingService.isEvaluationRequestAllowed(userId)) {
            logger.warn("Evaluation rate limit exceeded for user: {}", userId);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(Map.of("error", "Evaluation rate limit exceeded. Please try again later."));
        }
        
        try {
            FreeResponseEvaluation evaluation = openAIService.evaluateFreeResponse(
                    request.getSubject(),
                    request.getQuestion(),
                    request.getResponse()
            );
            
            logger.info("Evaluated response for user: {} subject: {}", userId, request.getSubject());
            return ResponseEntity.ok(evaluation);
            
        } catch (Exception e) {
            logger.error("Error evaluating response for user: {} subject: {}", 
                        userId, request.getSubject(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to evaluate response"));
        }
    }

    @GetMapping("/memory/{subject}")
    public ResponseEntity<List<String>> getSubjectMemory(
            @PathVariable @Size(min = 2, max = 100) 
            @Pattern(regexp = "^[a-zA-Z0-9\\s\\-_.()]+$") String subject,
            Authentication authentication) {
        
        FirebaseUserPrincipal user = (FirebaseUserPrincipal) authentication.getPrincipal();
        String userId = user.getUid();
        
        try {
            List<String> recentTopics = memoryService.getRecentTopics(subject);
            logger.debug("Retrieved memory for user: {} subject: {}", userId, subject);
            return ResponseEntity.ok(recentTopics);
            
        } catch (Exception e) {
            logger.error("Error retrieving memory for user: {} subject: {}", userId, subject, e);
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/memory")
    public ResponseEntity<Map<String, List<String>>> getAllMemory() {
        Map<String, List<String>> allTopics = memoryService.getAllTopics();
        return ResponseEntity.ok(allTopics);
    }

    @DeleteMapping("/memory/{subject}")
    public ResponseEntity<Void> clearSubjectMemory(
            @PathVariable @Size(min = 2, max = 100) 
            @Pattern(regexp = "^[a-zA-Z0-9\\s\\-_.()]+$") String subject,
            Authentication authentication) {
        
        FirebaseUserPrincipal user = (FirebaseUserPrincipal) authentication.getPrincipal();
        String userId = user.getUid();
        
        try {
            memoryService.clearMemory(subject);
            logger.info("Cleared memory for user: {} subject: {}", userId, subject);
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            logger.error("Error clearing memory for user: {} subject: {}", userId, subject, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
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