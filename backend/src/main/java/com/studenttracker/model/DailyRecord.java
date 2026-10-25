package com.studenttracker.model;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "daily_records", uniqueConstraints = @UniqueConstraint(columnNames = { "student_id", "record_date" }))
public class DailyRecord {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  public Long id;
  @ManyToOne(optional = false, fetch = FetchType.EAGER)
  @JoinColumn(name = "student_id", nullable = false)
  public Student student;
  @Column(name = "record_date", nullable = false)
  public LocalDate date;
  @Enumerated(EnumType.STRING)
  public Homework homework;
  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "daily_behaviours", joinColumns = @JoinColumn(name = "record_id"))
  @Column(name = "behaviour")
  @Enumerated(EnumType.STRING)
  public Set<Behaviour> behaviours = new HashSet<>();
  @Enumerated(EnumType.STRING)
  public Participation participation;
  @Column(length = 2000)
  public String extraCredit;
  @Column(name = "points_of_concern", length = 2000)
  public String pointsOfConcern;
}
