package com.yourpackage.security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(FirebaseAuthenticationFilter.class);
    private final FirebaseAuth firebaseAuth;

    public FirebaseAuthenticationFilter(@Autowired(required = false) FirebaseAuth firebaseAuth) {
        this.firebaseAuth = firebaseAuth;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        
        // Skip authentication if Firebase is not configured (development mode)
        if (firebaseAuth == null) {
            logger.warn("Firebase not configured - skipping authentication (development mode only)");
            
            // Create a mock authentication for development
            FirebaseUserPrincipal principal = new FirebaseUserPrincipal("dev-user", "dev@example.com", null);
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(principal, null, new ArrayList<>());
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            filterChain.doFilter(request, response);
            return;
        }
        
        String authorizationHeader = request.getHeader("Authorization");
        
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String idToken = authorizationHeader.substring(7);
            
            try {
                FirebaseToken decodedToken = firebaseAuth.verifyIdToken(idToken);
                String uid = decodedToken.getUid();
                String email = decodedToken.getEmail();
                
                // Create authentication object
                FirebaseUserPrincipal principal = new FirebaseUserPrincipal(uid, email, decodedToken);
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(principal, null, new ArrayList<>());
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
            } catch (FirebaseAuthException e) {
                logger.error("Invalid Firebase token: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\":\"Invalid authentication token\"}");
                response.setContentType("application/json");
                return;
            }
        }
        
        filterChain.doFilter(request, response);
    }
}