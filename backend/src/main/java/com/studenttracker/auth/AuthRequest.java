package com.studenttracker.auth;

public record AuthRequest(
    String username,
    String password
) {}
