import java.util.*;

public class Tester {

    public static ArrayList<Tester> list = new ArrayList<Tester>();
    private String prompt;
    private boolean correct = true;
    private String grah = "";

    public Tester(String prompt, boolean correct){
        this.correct = correct;
        this.prompt = prompt;
        list.add(this);
    }

}