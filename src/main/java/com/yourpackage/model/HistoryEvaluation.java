package com.yourpackage.model;

import java.util.*;

public class HistoryEvaluation {

    public static ArrayList<HistoryEvaluation> list = new ArrayList<HistoryEvaluation>();
    private String prompt;
    private boolean correct = true;


    public HistoryEvaluation(String prompt, boolean correct){
        this.prompt = prompt;
        this.correct = correct;
        list.add(this);
    }

    public String getPrompt(){
        return prompt;
    }

    public boolean getCorrect(){
        return correct;
    }

}