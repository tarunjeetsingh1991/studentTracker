package com.studenttracker.exception;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<?> missing(ResourceNotFoundException e) {
    return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
  }

  @ExceptionHandler({ IllegalArgumentException.class, MethodArgumentTypeMismatchException.class,
      HttpMessageNotReadableException.class, MethodArgumentNotValidException.class })
  public ResponseEntity<?> bad(Exception e) {
    return ResponseEntity.badRequest().body(Map.of("error", "Invalid input: " + e.getMessage()));
  }
}
