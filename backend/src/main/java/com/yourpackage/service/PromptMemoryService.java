package com.yourpackage.service;

import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PromptMemoryService {
    private final Map<String, List<String>> subjectTopics;
    private final Map<String, Integer> topicUsageCount;
    private final int maxRecentTopics;

    public PromptMemoryService() {
        this.subjectTopics = new ConcurrentHashMap<>();
        this.topicUsageCount = new ConcurrentHashMap<>();
        this.maxRecentTopics = 5;
    }

    public void recordTopic(String subject, String topic) {
        subjectTopics.computeIfAbsent(subject, k -> new ArrayList<>()).add(topic);
        topicUsageCount.merge(subject + ":" + topic, 1, Integer::sum);
        
        List<String> topics = subjectTopics.get(subject);
        if (topics.size() > maxRecentTopics) {
            topics.remove(0);
        }
    }

    public List<String> getRecentTopics(String subject) {
        return subjectTopics.getOrDefault(subject, new ArrayList<>());
    }

    public String generateDiversePrompt(String subject, String type) {
        List<String> recentTopics = getRecentTopics(subject);
        String basePrompt = getBasePrompt(subject, type);
        
        if (!recentTopics.isEmpty()) {
            String avoidanceClause = " Avoid focusing on: " + String.join(", ", recentTopics) + ".";
            basePrompt += avoidanceClause;
        }
        
        basePrompt += " Focus on a different aspect or topic than previously covered.";
        return basePrompt;
    }

    public String extractTopicFromResponse(String response, String subject) {
        String topic = "";
        String lowerResponse = response.toLowerCase();
        
        switch (subject.toLowerCase()) {
            case "english":
            case "literature":
            case "lit":
                topic = extractLiteratureTopic(lowerResponse);
                break;
            case "history":
            case "ushistory":
            case "eurohistory":
                topic = extractHistoryTopic(lowerResponse);
                break;
            case "science":
            case "biology":
            case "chemistry":
            case "physics":
                topic = extractScienceTopic(lowerResponse);
                break;
            case "math":
            case "calculus":
            case "statistics":
                topic = extractMathTopic(lowerResponse);
                break;
            default:
                topic = extractGenericTopic(lowerResponse);
        }
        
        return topic.isEmpty() ? "general" : topic;
    }

    private String extractLiteratureTopic(String response) {
        String[] literatureKeywords = {
            "macbeth", "hamlet", "othello", "king lear", "romeo and juliet",
            "great gatsby", "to kill a mockingbird", "1984", "brave new world",
            "pride and prejudice", "jane eyre", "wuthering heights",
            "lord of the flies", "of mice and men", "the crucible",
            "death of a salesman", "a streetcar named desire"
        };
        
        for (String keyword : literatureKeywords) {
            if (response.contains(keyword)) {
                return keyword;
            }
        }
        
        if (response.contains("shakespeare")) return "shakespeare";
        if (response.contains("poetry") || response.contains("poem")) return "poetry";
        if (response.contains("novel")) return "novel";
        if (response.contains("drama") || response.contains("play")) return "drama";
        
        return "";
    }

    private String extractHistoryTopic(String response) {
        String[] historyKeywords = {
            "world war", "civil war", "revolutionary war", "cold war",
            "great depression", "new deal", "industrial revolution",
            "renaissance", "enlightenment", "reformation", "crusades",
            "ancient rome", "ancient greece", "medieval", "colonial"
        };
        
        for (String keyword : historyKeywords) {
            if (response.contains(keyword)) {
                return keyword;
            }
        }
        
        if (response.contains("president") || response.contains("presidency")) return "presidency";
        if (response.contains("constitution")) return "constitution";
        if (response.contains("economy") || response.contains("economic")) return "economics";
        
        return "";
    }

    private String extractScienceTopic(String response) {
        String[] scienceKeywords = {
            "photosynthesis", "mitosis", "meiosis", "dna", "rna",
            "evolution", "genetics", "ecosystem", "cell",
            "atomic structure", "periodic table", "chemical bonding",
            "thermodynamics", "kinetics", "equilibrium",
            "mechanics", "waves", "electricity", "magnetism"
        };
        
        for (String keyword : scienceKeywords) {
            if (response.contains(keyword)) {
                return keyword;
            }
        }
        
        return "";
    }

    private String extractMathTopic(String response) {
        String[] mathKeywords = {
            "derivative", "integral", "limit", "function",
            "probability", "statistics", "hypothesis",
            "algebra", "geometry", "trigonometry",
            "polynomial", "logarithm", "exponential"
        };
        
        for (String keyword : mathKeywords) {
            if (response.contains(keyword)) {
                return keyword;
            }
        }
        
        return "";
    }

    private String extractGenericTopic(String response) {
        String[] words = response.split("\\s+");
        Map<String, Integer> wordCount = new HashMap<>();
        
        for (String word : words) {
            word = word.replaceAll("[^a-zA-Z]", "").toLowerCase();
            if (word.length() > 4) {
                wordCount.merge(word, 1, Integer::sum);
            }
        }
        
        return wordCount.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("");
    }

    private String getBasePrompt(String subject, String type) {
        String basePrompt;
        if ("free-response".equals(type)) {
            basePrompt = "Create a challenging AP-level free response question for " + subject;
        } else {
            basePrompt = "Create a challenging AP-level multiple choice question for " + subject;
        }
        return basePrompt + ".";
    }

    public void clearMemory(String subject) {
        subjectTopics.remove(subject);
        topicUsageCount.entrySet().removeIf(entry -> entry.getKey().startsWith(subject + ":"));
    }

    public Map<String, List<String>> getAllTopics() {
        return new HashMap<>(subjectTopics);
    }
}