package com.yourpackage.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import javax.annotation.PostConstruct;
import java.io.IOException;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initializeFirebase() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                String firebaseCredentialsPath = System.getenv("FIREBASE_SERVICE_ACCOUNT_KEY");
                
                FirebaseOptions options;
                if (firebaseCredentialsPath != null) {
                    // Use service account key from environment variable
                    GoogleCredentials credentials = GoogleCredentials.fromStream(
                        new java.io.FileInputStream(firebaseCredentialsPath));
                    options = FirebaseOptions.builder()
                            .setCredentials(credentials)
                            .build();
                } else {
                    // Use default credentials (for local development)
                    options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.getApplicationDefault())
                            .build();
                }
                
                FirebaseApp.initializeApp(options);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to initialize Firebase", e);
        }
    }

    @Bean
    public FirebaseAuth firebaseAuth() {
        return FirebaseAuth.getInstance();
    }
}