package com.studenttracker.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.studenttracker.model.DailyRecord;

public interface DailyRecordRepository extends JpaRepository<DailyRecord, Long> {
  Optional<DailyRecord> findByStudentIdAndDate(Long studentId, LocalDate date);

  List<DailyRecord> findByStudentIdAndDateBetweenOrderByDateAsc(Long id, LocalDate from, LocalDate to);
}
