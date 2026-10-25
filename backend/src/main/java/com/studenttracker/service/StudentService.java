package com.studenttracker.service;

import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.studenttracker.exception.ResourceNotFoundException;
import com.studenttracker.model.Student;
import com.studenttracker.repository.StudentRepository;

@Service
public class StudentService {
  private final StudentRepository repo;

  public StudentService(StudentRepository repo) {
    this.repo = repo;
  }

  public List<Student> byClass(String code) {
    if (!Set.of("6-1", "6-2").contains(code))
      throw new IllegalArgumentException("Unknown class");
    return repo.findByClassCodeOrderByRollNumberAsc(code);
  }

  public Student one(Long id) {
    return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Student not found: " + id));
  }
}
