package com.yourpackage.model;

public class FreeResponseEvaluation {
    private String feedback;
    private String score;
    private String maxScore;
    private String scoreExplanation;

    public FreeResponseEvaluation() {
    }

    public FreeResponseEvaluation(String feedback, String score, String maxScore, String scoreExplanation) {
        this.feedback = feedback;
        this.score = score;
        this.maxScore = maxScore;
        this.scoreExplanation = scoreExplanation;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public String getScore() {
        return score;
    }

    public void setScore(String score) {
        this.score = score;
    }

    public String getMaxScore() {
        return maxScore;
    }

    public void setMaxScore(String maxScore) {
        this.maxScore = maxScore;
    }

    public String getScoreExplanation() {
        return scoreExplanation;
    }

    public void setScoreExplanation(String scoreExplanation) {
        this.scoreExplanation = scoreExplanation;
    }
}