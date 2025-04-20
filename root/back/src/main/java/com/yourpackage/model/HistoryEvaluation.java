package com.yourpackage.model;

import java.util.ArrayList;

public class HistoryEvaluation {

    public static ArrayList<HistoryEvaluation> total = new ArrayList<>();
    private String prompt;
    private boolean correct;
    private String questionType;

    public HistoryEvaluation(String prompt, boolean correct){
        this.prompt = prompt;
        this.correct = correct;
        total.add(this);
    }

    public String getPrompt(){
        return prompt;
    }

    public boolean getCorrect(){
        return correct;
    }

    public static ArrayList<HistoryEvaluation> getTotal(){
        return total;
    }
}
