package com.yourpackage.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.Map;

@Service
public class RateLimitingService {
    
    private final Map<String, UserRateLimit> userRateLimits = new ConcurrentHashMap<>();
    
    private static final int QUESTIONS_PER_HOUR = 60;
    private static final int EVALUATIONS_PER_HOUR = 10;
    private static final long WINDOW_MILLIS = TimeUnit.HOURS.toMillis(1);
    
    public boolean isQuestionRequestAllowed(String userId) {
        return checkRateLimit(userId, "questions", QUESTIONS_PER_HOUR);
    }
    
    public boolean isEvaluationRequestAllowed(String userId) {
        return checkRateLimit(userId, "evaluations", EVALUATIONS_PER_HOUR);
    }
    
    private boolean checkRateLimit(String userId, String operation, int maxRequests) {
        String key = userId + ":" + operation;
        UserRateLimit rateLimit = userRateLimits.computeIfAbsent(key, 
            k -> new UserRateLimit());
        
        long now = System.currentTimeMillis();
        
        if (now - rateLimit.windowStart > WINDOW_MILLIS) {
            rateLimit.requestCount = 0;
            rateLimit.windowStart = now;
        }
        
        if (rateLimit.requestCount >= maxRequests) {
            return false;
        }
        
        rateLimit.requestCount++;
        return true;
    }
    
    private static class UserRateLimit {
        int requestCount = 0;
        long windowStart = System.currentTimeMillis();
    }
}