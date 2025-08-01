package com.yourpackage.service;

import com.yourpackage.model.GuideEvaluation;
import com.yourpackage.model.HistoryEvaluation;
import io.github.sashirestela.cleverclient.client.OkHttpClientAdapter;
import io.github.sashirestela.openai.SimpleOpenAI;
import io.github.sashirestela.openai.domain.chat.ChatMessage;
import io.github.sashirestela.openai.domain.chat.ChatRequest;
import io.github.sashirestela.openai.exception.OpenAIException;
import org.springframework.stereotype.Service;
import com.yourpackage.model.FreeResponseEvaluation;
import com.fasterxml.jackson.databind.ObjectMapper;
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
        this.openAI = SimpleOpenAI.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .clientAdapter(new OkHttpClientAdapter())
                .build();
        this.objectMapper = new ObjectMapper();
    }

    private String shuffleMultipleChoiceOptions(String response) {
        try {
            // Extract question text and options
            String[] lines = response.split("\n");
            List<String> questionLines = new ArrayList<>();
            List<String> optionLines = new ArrayList<>();
            String correctAnswerContent = null;
            
            // Separate question text from options
            for (String line : lines) {
                String trimmedLine = line.trim();
                if (trimmedLine.matches("^[A-D][.)].*") || trimmedLine.matches("^[A-D]\\*\\*\\*[.)].*")) {
                    optionLines.add(trimmedLine);
                } else if (!trimmedLine.isEmpty()) {
                    questionLines.add(line);
                }
            }
            
            // If we don't have exactly 4 options, return original
            if (optionLines.size() != 4) {
                return response;
            }
            
            // Parse options and find correct answer
            List<String> cleanOptions = new ArrayList<>();
            String correctAnswerLetter = null;
            
            for (String option : optionLines) {
                // Check if this option has the correct answer marker
                if (option.contains("***")) {
                    correctAnswerLetter = option.substring(0, 1); // Get the letter (A, B, C, or D)
                    // Store the content without the *** marker and without the letter prefix
                    correctAnswerContent = option.replaceAll("\\*\\*\\*", "").replaceFirst("^[A-D][.)]?\\s*", "").trim();
                }
                
                // Clean the option (remove *** and store just the content)
                String cleanContent = option.replaceAll("\\*\\*\\*", "").replaceFirst("^[A-D][.)]?\\s*", "").trim();
                cleanOptions.add(cleanContent);
            }
            
            // If no correct answer found, return original
            if (correctAnswerLetter == null || correctAnswerContent == null) {
                return response;
            }
            
            // Shuffle the options
            Collections.shuffle(cleanOptions);
            
            // Find new position of correct answer
            int newCorrectPosition = -1;
            for (int i = 0; i < cleanOptions.size(); i++) {
                if (cleanOptions.get(i).equals(correctAnswerContent)) {
                    newCorrectPosition = i;
                    break;
                }
            }
            
            // Rebuild the question with shuffled options
            StringBuilder result = new StringBuilder();
            
            // Add question text
            for (String questionLine : questionLines) {
                result.append(questionLine).append("\n");
            }
            
            // Add shuffled options with correct answer marked
            char[] letters = {'A', 'B', 'C', 'D'};
            for (int i = 0; i < cleanOptions.size(); i++) {
                String prefix = letters[i] + (i == newCorrectPosition ? "***)" : ")");
                result.append(prefix).append(" ").append(cleanOptions.get(i)).append("\n");
            }
            
            return result.toString().trim();
            
        } catch (Exception e) {
            // If anything goes wrong, return original response
            System.err.println("Error shuffling options: " + e.getMessage());
            return response;
        }
    }

    public String generateQuestion(String prompt, String type, String subject) {
        int creditdiff;
        String model;
        try {
            String systemPrompt;

            if ("free-response".equals(type)) {
                systemPrompt = "You are an expert on all AP classes. Create challenging and detailed free response questions. Only provide the question and any necessary context. No sample answers or solutions. Make sure to mark ONLY THE BEGINNING of each section of the question (for example, A. B. C. D.) with 5 astricks (*****) after. Make sure the question is appropriate for AP-level assessment. Make sure to include texts and context for the student to read, if there are background documents include them entirely. Start your response with the context section.";
                creditdiff = 4000;
                model = "gpt-4.1";
            } else {
                systemPrompt = "You are an expert on all classes. Create challenging and full length multiple choice questions. Only provide the question and 4 multiple choice options, and the choices should be marked with the letters A B C D accordingly. Create a multiple choice question with exactly one correct answer. Mark the correct option with *** IMMEDIATELY after the letter (e.g., A***). The other three options must be clearly incorrect. Do not create ambiguous or subjective answer choices. CRITICAL: For math questions, always double-check your calculations and ensure the *** marker is placed correctly after the letter of the correct answer. If the question involves math or physics, compute the correct answer before writing the choices; make sure to format for KaTeX. If the subject is EuroHistory, HumanGeo, Lit, or UsHistory always provide full text excerpts and in-depth questions. If the subject is CompSci only provide code-example questions in Java, no terms. No extra text or explanations. Format example:\nA) Wrong answer\nB***) Correct answer\nC) Wrong answer\nD) Wrong answer\n\nIMPORTANT: Always place *** IMMEDIATELY after the letter, before the parenthesis. Example: A***) not A) ***";
                creditdiff = 2000;
                model = "gpt-4.1-mini";
            }

            String diversePrompt = memoryService.generateDiversePrompt(subject, type);
            
            var chatRequest = ChatRequest.builder()
                    .model(model)
                    .message(ChatMessage.SystemMessage.of(systemPrompt))
                    .message(ChatMessage.UserMessage.of(diversePrompt))
                    .temperature(1.2)
                    .topP(1.0)
                    .maxCompletionTokens(creditdiff)
                    .build();

            var futureChat = openAI.chatCompletions().create(chatRequest);
            var chatResponse = futureChat.join();
            String response = chatResponse.firstContent();
            
            String extractedTopic = memoryService.extractTopicFromResponse(response, subject);
            memoryService.recordTopic(subject, extractedTopic);
            
            // Shuffle options for multiple choice questions to reduce bias toward option B
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

    public String generateGuide(String prompt) {
        int creditdiff;
        String model;
        try {
            String systemPrompt;
                systemPrompt = "You are an expert tutor on the topic the student is prompting you about. Provide a concise explanation the topic the student is asking about at the quality of a master tutor. Only provide the guide; no extra dialogue";
                creditdiff = 500;
                model = "gpt-4.1";


            var chatRequest = ChatRequest.builder()
                    .model(model)
                    .message(ChatMessage.SystemMessage.of(systemPrompt))
                    .message(ChatMessage.UserMessage.of(prompt))
                    .temperature(0.5)
                    .topP(0.7)
                    .maxCompletionTokens(creditdiff)
                    .build();

            var futureChat = openAI.chatCompletions().create(chatRequest);
            var chatResponse = futureChat.join();
            GuideEvaluation guideEvaluation = new GuideEvaluation(chatResponse.firstContent());
            return chatResponse.firstContent();
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

            var chatRequest = ChatRequest.builder()
                    .model("gpt-4.1")
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