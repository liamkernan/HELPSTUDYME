package com.yourpackage.service;

import com.yourpackage.model.GuideEvaluation;
import com.yourpackage.model.HistoryEvaluation;
import io.github.sashirestela.cleverclient.client.OkHttpClientAdapter;
import io.github.sashirestela.openai.SimpleOpenAI;
import io.github.sashirestela.openai.domain.chat.ChatMessage;
import io.github.sashirestela.openai.domain.chat.ChatRequest;
import io.github.sashirestela.openai.domain.response.ResponseRequest;
import io.github.sashirestela.openai.domain.response.Reasoning;
import io.github.sashirestela.openai.domain.response.Input;
import io.github.sashirestela.openai.exception.OpenAIException;
import org.springframework.stereotype.Service;
import com.yourpackage.model.FreeResponseEvaluation;
import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.OkHttpClient;
import java.time.Duration;
import java.util.*;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

@Service
public class OpenAIService {
    private final SimpleOpenAI openAI;
    private final ObjectMapper objectMapper;
    private final PromptMemoryService memoryService;

    public OpenAIService(PromptMemoryService memoryService) {
        this.memoryService = memoryService;

        OkHttpClient httpClient = new OkHttpClient.Builder()
                .connectTimeout(Duration.ofSeconds(20))
                .readTimeout(Duration.ofSeconds(120))  // 2 minutes for GPT-5 reasoning
                .writeTimeout(Duration.ofSeconds(30))
                .build();

        this.openAI = SimpleOpenAI.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .clientAdapter(new OkHttpClientAdapter(httpClient))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    private String shuffleMultipleChoiceOptions(String response) {
        try {
            String[] lines = response.split("\n");
            List<String> questionLines = new ArrayList<>();
            List<String> optionLines = new ArrayList<>();
            String correctAnswerContent = null;
            
            for (String line : lines) {
                String trimmedLine = line.trim();
                if (trimmedLine.matches("^[A-D][.)].*") || trimmedLine.matches("^[A-D]\\*\\*\\*[.)].*")) {
                    optionLines.add(trimmedLine);
                } else if (!trimmedLine.isEmpty()) {
                    questionLines.add(line);
                }
            }
            
            if (optionLines.size() != 4) {
                return response;
            }
            
            // Parse options and find correct answer
            List<String> cleanOptions = new ArrayList<>();
            String correctAnswerLetter = null;
            
            for (String option : optionLines) {
                if (option.contains("***")) {
                    correctAnswerLetter = option.substring(0, 1); // Get the letter (A, B, C, or D)
                   correctAnswerContent = option.replaceAll("\\*\\*\\*", "").replaceFirst("^[A-D][.)]?\\s*", "").trim();
                }
                
                String cleanContent = option.replaceAll("\\*\\*\\*", "").replaceFirst("^[A-D][.)]?\\s*", "").trim();
                cleanOptions.add(cleanContent);
            }
            
            if (correctAnswerLetter == null || correctAnswerContent == null) {
                return response;
            }
            
            Collections.shuffle(cleanOptions);
            
            int newCorrectPosition = -1;
            for (int i = 0; i < cleanOptions.size(); i++) {
                if (cleanOptions.get(i).equals(correctAnswerContent)) {
                    newCorrectPosition = i;
                    break;
                }
            }
            
            StringBuilder result = new StringBuilder();
            
            for (String questionLine : questionLines) {
                result.append(questionLine).append("\n");
            }
            
            char[] letters = {'A', 'B', 'C', 'D'};
            for (int i = 0; i < cleanOptions.size(); i++) {
                String prefix = letters[i] + (i == newCorrectPosition ? "***)" : ")");
                result.append(prefix).append(" ").append(cleanOptions.get(i)).append("\n");
            }
            
            return result.toString().trim();
            
        } catch (Exception e) {
            System.err.println("Error shuffling options: " + e.getMessage());
            return response;
        }
    }

    public String generateQuestion(String prompt, String type, String subject) {
        int creditdiff;
        String model;
        try {
            String systemPrompt;
            String diversePrompt = memoryService.generateDiversePrompt(subject, type);

            if ("free-response".equals(type)) {
                systemPrompt = "You are an expert on all AP classes. Create challenging and detailed free response questions. Only provide the question and any necessary context. No sample answers or solutions. Make sure to mark ONLY THE BEGINNING of each section of the question (for example, A. B. C. D.) with 5 astricks (*****) after. Make sure the question is appropriate for AP-level assessment. Make sure to include texts and context for the student to read, if there are background documents include them entirely. Start your response with the context section.";
                creditdiff = 30000;
                model = "gpt-4o-mini";
            } else {
                // Enhanced system prompt for math accuracy
                boolean isMathSubject = subject.toLowerCase().contains("math") ||
                                      subject.toLowerCase().contains("calc") ||
                                      subject.toLowerCase().contains("statistics") ||
                                      subject.toLowerCase().contains("physics") ||
                                      subject.toLowerCase().contains("chemistry");

                if (isMathSubject) {
                    return generateMathQuestionWithVerification(diversePrompt, subject);
                }

                systemPrompt = "You are an expert on all classes. Create challenging and full length multiple choice questions. Only provide the question and 4 multiple choice options, and the choices should be marked with the letters A B C D accordingly. Create a multiple choice question with exactly one correct answer. Mark the correct option with *** IMMEDIATELY after the letter (e.g., A***). The other three options must be clearly incorrect. Do not create ambiguous or subjective answer choices. CRITICAL: For math questions, always double-check your calculations and ensure the *** marker is placed correctly after the letter of the correct answer. If the question involves math or physics, compute the correct answer before writing the choices. For mathematical expressions, use LaTeX formatting with \\[...\\] for display math and \\(...\\) for inline math (matching the frontend MathRenderer component). If the subject is EuroHistory, HumanGeo, Lit, or UsHistory always provide full text excerpts and in-depth questions. If the subject is CompSci only provide code-example questions in Java, no terms. No extra text or explanations. Format example:\nA) Wrong answer\nB***) Correct answer\nC) Wrong answer\nD) Wrong answer\n\nIMPORTANT: Always place *** IMMEDIATELY after the letter, before the parenthesis. Example: A***) not A) ***";
                creditdiff = 2000;
                model = "gpt-4o-mini";
            }

            // Use Chat Completions API with gpt-4o-mini for better formatting
            var chatRequest = ChatRequest.builder()
                    .model(model)
                    .message(ChatMessage.SystemMessage.of(systemPrompt))
                    .message(ChatMessage.UserMessage.of(diversePrompt))
                    .temperature(1.0)
                    .maxCompletionTokens(creditdiff)
                    .build();

            var futureChat = openAI.chatCompletions().create(chatRequest);
            var chatResponse = futureChat.join();

            // Debug logging
            System.out.println("Chat response: " + chatResponse);

            String response = chatResponse.firstContent();
            System.out.println("Extracted response length: " + (response != null ? response.length() : "null"));
            System.out.println("Response preview: " + (response != null ? response.substring(0, Math.min(200, response.length())) : "null"));

            if (response == null || response.trim().isEmpty()) {
                System.err.println("ERROR: Empty response. Full response object: " + chatResponse);
                return "Error: Received empty response from AI model";
            }

            String extractedTopic = memoryService.extractTopicFromResponse(response, subject);
            memoryService.recordTopic(subject, extractedTopic);

            if (!"free-response".equals(type)) {
                response = shuffleMultipleChoiceOptions(response);
            }

            HistoryEvaluation historyEvaluation = new HistoryEvaluation(response, false);
            return response;
        } catch (OpenAIException e) {
            e.printStackTrace();
            return "Error generating question: " + e.getMessage();
        }
    }

    private String generateMathQuestionWithVerification(String diversePrompt, String subject) {
        try {
            // Step 1: Generate a problem and solve it step by step
            String solutionPrompt = "You are a mathematics expert. Create an AP-level " + subject + " problem based on this topic: " + diversePrompt + 
                    "\n\nFirst, create a challenging problem. Then solve it step-by-step showing all work. " +
                    "Use LaTeX formatting with \\[...\\] for display math and \\(...\\) for inline math. " +
                    "At the end, clearly state: 'FINAL ANSWER: [your answer]'\n\n" +
                    "Make sure your calculations are correct and show your work clearly.";
            
            // Use gpt-4o-mini for better math accuracy and formatting
            var solutionRequest = ChatRequest.builder()
                    .model("gpt-4o-mini")
                    .message(ChatMessage.SystemMessage.of("You are a precise mathematics expert."))
                    .message(ChatMessage.UserMessage.of(solutionPrompt))
                    .temperature(0.7)
                    .maxCompletionTokens(1500)
                    .build();

            var solutionResponse = openAI.chatCompletions().create(solutionRequest).join();
            String solutionText = solutionResponse.firstContent();
            
            // Extract the final answer
            Pattern answerPattern = Pattern.compile("FINAL ANSWER:\\s*(.+?)(?:\\n|$)", Pattern.CASE_INSENSITIVE);
            Matcher answerMatcher = answerPattern.matcher(solutionText);
            String correctAnswer = "";
            if (answerMatcher.find()) {
                correctAnswer = answerMatcher.group(1).trim();
            }
            
            if (correctAnswer.isEmpty()) {
                // Fallback to original method if answer extraction fails
                return generateQuestionFallback(diversePrompt, subject);
            }
            
            String questionPrompt = "Based on this solved problem:\n\n" + solutionText +
                    "\n\nCreate a clean multiple choice question with exactly 4 options (A, B, C, D). " +
                    "The correct answer is: " + correctAnswer + 
                    "\n\nMark the correct option with *** IMMEDIATELY after the letter (e.g., A***). " +
                    "Create 3 realistic wrong answers based on common student errors. " +
                    "Use LaTeX formatting with \\[...\\] for display math and \\(...\\) for inline math. " +
                    "Only provide the question and the 4 options, no explanations.\n\n" +
                    "Format:\n[Question text]\nA) Option 1\nB***) Correct option\nC) Option 3\nD) Option 4";
            
            // Use gpt-4o-mini for better formatting
            var questionRequest = ChatRequest.builder()
                    .model("gpt-4o-mini")
                    .message(ChatMessage.SystemMessage.of("You are creating multiple choice questions with pre-verified answers."))
                    .message(ChatMessage.UserMessage.of(questionPrompt))
                    .temperature(0.8)
                    .maxCompletionTokens(1000)
                    .build();

            var questionResponse = openAI.chatCompletions().create(questionRequest).join();
            String response = questionResponse.firstContent();
            
            // Record topic and return
            String extractedTopic = memoryService.extractTopicFromResponse(response, subject);
            memoryService.recordTopic(subject, extractedTopic);
            
            return shuffleMultipleChoiceOptions(response);
            
        } catch (Exception e) {
            System.err.println("Error in math question generation: " + e.getMessage());
            return generateQuestionFallback(diversePrompt, subject);
        }
    }
    
    private String generateQuestionFallback(String diversePrompt, String subject) {
        // Fallback to improved single-step generation
        String systemPrompt = "You are a precise mathematics expert. Create an AP-level multiple choice question. " +
                "CRITICAL: Solve the problem completely before creating options. Double-check your math. " +
                "Mark the correct option with *** IMMEDIATELY after the letter (e.g., A***). " +
                "Use LaTeX formatting with \\[...\\] for display math and \\(...\\) for inline math. " +
                "Format: Question followed by A) B) C) D) options.";
        
        // Use gpt-4o-mini for better formatting
        var chatRequest = ChatRequest.builder()
                .model("gpt-4o-mini")
                .message(ChatMessage.SystemMessage.of(systemPrompt))
                .message(ChatMessage.UserMessage.of(diversePrompt))
                .temperature(0.8)
                .maxCompletionTokens(2000)
                .build();

        var chatResponse = openAI.chatCompletions().create(chatRequest).join();
        return chatResponse.firstContent();
    }

    public String generateGuide(String prompt) {
        int creditdiff;
        String model;
        try {
            String systemPrompt;
                systemPrompt = "You are an expert tutor on the topic the student is prompting you about. Provide a concise explanation the topic the student is asking about at the quality of a master tutor. Only provide the guide; no extra dialogue";
                creditdiff = 700;
                model = "gpt-4o-mini";


            var chatRequest = ChatRequest.builder()
                    .model(model)
                    .message(ChatMessage.SystemMessage.of(systemPrompt))
                    .message(ChatMessage.UserMessage.of(prompt))
                    .temperature(0.7)
                    .maxCompletionTokens(creditdiff)
                    .build();

            var futureChat = openAI.chatCompletions().create(chatRequest);
            var chatResponse = futureChat.join();
            String responseText = chatResponse.firstContent();
            GuideEvaluation guideEvaluation = new GuideEvaluation(responseText);
            return responseText;
        } catch (OpenAIException e) {
            e.printStackTrace();
            return "Error generating question: " + e.getMessage();
        }
    }

    public FreeResponseEvaluation evaluateFreeResponse(String subject, String question, String response) {
        try {
            String systemPrompt = "You are an AP exam scorer with expertise in " + subject + ". " +
                    "You will evaluate a student's free response answer against AP scoring guidelines. " +
                    "Score on a scale of 0-9 points. Provide detailed feedback on strengths and weaknesses. " + "Return your evaluation as valid JSON without any markdown or LaTeX formatting. Please ensure that all backslashes are correctly escaped as needed." +
                    "Return with these fields: " +
                    "\"feedback\" (detailed feedback, should be 6-7 sentences), " +
                    "\"score\" (numeric score), " +
                    "\"maxScore\" (always 9), " +
                    "\"scoreExplanation\" (brief explanation of score breakdown). " +
                    "Be fair but rigorous in your assessment.";

            String userPrompt = "Question: " + question + "\n\nStudent response: " + response;

            // Use gpt-4o-mini for evaluation
            var chatRequest = ChatRequest.builder()
                    .model("gpt-4o-mini")
                    .message(ChatMessage.SystemMessage.of(systemPrompt))
                    .message(ChatMessage.UserMessage.of(userPrompt))
                    .temperature(0.5)
                    .maxCompletionTokens(2500)
                    .build();

            var futureChat = openAI.chatCompletions().create(chatRequest);
            var chatResponse = futureChat.join();
            String jsonResponse = chatResponse.firstContent();
            return objectMapper.readValue(jsonResponse, FreeResponseEvaluation.class);

        } catch (Exception e) {
            e.printStackTrace();
            return new FreeResponseEvaluation(
                    "Error evaluating response: " + e.getMessage(),
                    "0",
                    "9",
                    "An error occurred during evaluation."
            );
        }
    }
}