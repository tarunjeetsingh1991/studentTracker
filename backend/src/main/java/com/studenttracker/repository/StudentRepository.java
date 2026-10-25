package com.studenttracker.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.studenttracker.model.Student;

public interface StudentRepository extends JpaRepository<Student, Long> {
  List<Student> findByClassCodeOrderByRollNumberAsc(String classCode);

  boolean existsByClassCodeAndRollNumber(String classCode, Integer rollNumber);
}
