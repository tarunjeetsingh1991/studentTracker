package com.studenttracker.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "students", uniqueConstraints = @UniqueConstraint(columnNames = { "class_code", "roll_number" }))
public class Student {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;
  @Column(name = "class_code", nullable = false)
  public String classCode;
  @Column(name = "roll_number", nullable = false)
  public Integer rollNumber;
  @Column(nullable = false)
  public String firstName;
  @Column(nullable = false)
  public String lastName;

  public Student() {
  }

  public Student(String c, int r, String l, String f) {
    classCode = c;
    rollNumber = r;
    lastName = l;
    firstName = f;
  }
}
