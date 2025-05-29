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
                systemPrompt = "You are an expert on all classes. Create challenging and full length multiple choice questions. Only provide the question and 4 multiple choice options, and the choices should be marked with the letters A B C D accordingly. Create a multiple choice question with exactly one correct answer. Mark the correct option with *** IMMEDIATELY after the letter (e.g., A***). The other three options must be clearly incorrect. Do not create ambiguous or subjective answer choices. CRITICAL: For math questions, always double-check your calculations and ensure the *** marker is placed correctly after the letter of the correct answer. If the question involves math or physics, compute the correct answer before writing the choices; make sure to format for KaTeX. If the subject is EuroHistory, HumanGeo, Lit, or UsHistory always provide full text excerpts and in-depth questions. If the subject is CompSci only provide code-example questions in Java, no terms. No extra text or explanations. Format example:\nA) Wrong answer\nB***) Correct answer\nC) Wrong answer\nD) Wrong answer";
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