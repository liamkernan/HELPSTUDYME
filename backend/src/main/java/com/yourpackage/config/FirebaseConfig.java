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
                if (firebaseCredentialsPath != null && !firebaseCredentialsPath.isEmpty()) {
                    // Use service account key from environment variable
                    GoogleCredentials credentials = GoogleCredentials.fromStream(
                        new java.io.FileInputStream(firebaseCredentialsPath));
                    options = FirebaseOptions.builder()
                            .setCredentials(credentials)
                            .build();
                } else {
                    // Try to use default credentials, but allow failure for local dev
                    try {
                        options = FirebaseOptions.builder()
                                .setCredentials(GoogleCredentials.getApplicationDefault())
                                .build();
                    } catch (IOException e) {
                        // For local development without Firebase setup, create a mock configuration
                        System.out.println("Warning: Firebase credentials not found. Running in development mode.");
                        System.out.println("To use Firebase authentication, set GOOGLE_APPLICATION_CREDENTIALS environment variable");
                        System.out.println("or FIREBASE_SERVICE_ACCOUNT_KEY to your service account key file path.");
                        
                        // Don't initialize Firebase if credentials are not available
                        return;
                    }
                }
                
                FirebaseApp.initializeApp(options);
                System.out.println("Firebase initialized successfully");
            }
        } catch (Exception e) {
            System.err.println("Firebase initialization failed: " + e.getMessage());
            System.out.println("Running without Firebase authentication. API endpoints will be accessible without auth.");
        }
    }

    @Bean
    public FirebaseAuth firebaseAuth() {
        try {
            if (!FirebaseApp.getApps().isEmpty()) {
                return FirebaseAuth.getInstance();
            } else {
                // Return null if Firebase is not initialized (development mode)
                return null;
            }
        } catch (Exception e) {
            System.err.println("Failed to get FirebaseAuth instance: " + e.getMessage());
            return null;
        }
    }
}