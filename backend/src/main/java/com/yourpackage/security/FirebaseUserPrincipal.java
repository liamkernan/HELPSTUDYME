package com.yourpackage.security;

import com.google.firebase.auth.FirebaseToken;

import java.security.Principal;

public class FirebaseUserPrincipal implements Principal {
    private final String uid;
    private final String email;
    private final FirebaseToken token;

    public FirebaseUserPrincipal(String uid, String email, FirebaseToken token) {
        this.uid = uid;
        this.email = email;
        this.token = token; // Can be null in development mode
    }

    @Override
    public String getName() {
        return uid;
    }

    public String getUid() {
        return uid;
    }

    public String getEmail() {
        return email;
    }

    public FirebaseToken getToken() {
        return token;
    }
}