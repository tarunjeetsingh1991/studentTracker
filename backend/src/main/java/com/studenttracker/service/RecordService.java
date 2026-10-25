package com.studenttracker.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.studenttracker.dto.DailyRecordRequest;
import com.studenttracker.dto.DailyRecordResponse;
import com.studenttracker.exception.ResourceNotFoundException;
import com.studenttracker.model.Behaviour;
import com.studenttracker.model.DailyRecord;
import com.studenttracker.model.Homework;
import com.studenttracker.model.Participation;
import com.studenttracker.model.Student;
import com.studenttracker.repository.DailyRecordRepository;

@Service
public class RecordService {

    private final DailyRecordRepository repo;
    private final StudentService students;

    public RecordService(DailyRecordRepository repo, StudentService students) {
        this.repo = repo;
        this.students = students;
    }

    @Transactional
    public DailyRecordResponse save(Long id, DailyRecordRequest req) {
        Student student = students.one(id);
        if (req.date().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Date cannot be in future");
        }
        DailyRecord r = repo.findByStudentIdAndDate(id, req.date())
            .orElseGet(DailyRecord::new);
        r.student = student;
        r.date = req.date();
        r.homework = req.homework();
        r.participation = req.participation();
        r.behaviours = req.behaviours() == null
            ? new HashSet<>() : new HashSet<>(req.behaviours());
        r.extraCredit = req.extraCredit() == null ? null : req.extraCredit().trim();
        r.pointsOfConcern = req.pointsOfConcern() == null
            ? null : req.pointsOfConcern().trim();
        return DailyRecordResponse.from(repo.save(r));
    }

    @Transactional
    public DailyRecordResponse create(Long id, DailyRecordRequest req) {
        students.one(id);
        if (repo.findByStudentIdAndDate(id, req.date()).isPresent()) {
            throw new IllegalArgumentException(
                "An observation already exists for this date. Use Update.");
        }
        return save(id, req);
    }

    @Transactional
    public DailyRecordResponse updateExisting(Long id, DailyRecordRequest req) {
        students.one(id);
        if (repo.findByStudentIdAndDate(id, req.date()).isEmpty()) {
            throw new ResourceNotFoundException(
                "No observation exists for this date. Use Save.");
        }
        return save(id, req);
    }

    @Transactional
    public void delete(Long id, LocalDate date) {
        students.one(id);
        DailyRecord record = repo.findByStudentIdAndDate(id, date)
            .orElseThrow(() -> new ResourceNotFoundException(
                "No observation exists for this date"));
        repo.delete(record);
    }

    @Transactional(readOnly = true)
    public List<DailyRecordResponse> history(Long id, LocalDate from, LocalDate to) {
        students.one(id);
        if (from.isAfter(to)) {
            throw new IllegalArgumentException("Start date must not exceed end date");
        }
        return repo.findByStudentIdAndDateBetweenOrderByDateAsc(id, from, to)
            .stream().map(DailyRecordResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> consolidate(Long id, LocalDate from, LocalDate to) {
        List<DailyRecordResponse> rs = history(id, from, to);
        Map<String, Long> homework = new LinkedHashMap<>();
        Map<String, Long> behaviour = new LinkedHashMap<>();
        Map<String, Long> participation = new LinkedHashMap<>();
        for (Homework h : Homework.values()) homework.put(h.name(), 0L);
        for (Behaviour b : Behaviour.values()) behaviour.put(b.name(), 0L);
        for (Participation p : Participation.values()) participation.put(p.name(), 0L);

        List<Map<String, String>> extras = new ArrayList<>();
        List<Map<String, String>> concerns = new ArrayList<>();
        for (DailyRecordResponse r : rs) {
            if (r.homework() != null) {
                homework.merge(r.homework().name(), 1L, Long::sum);
            }
            if (r.participation() != null) {
                participation.merge(r.participation().name(), 1L, Long::sum);
            }
            if (r.behaviours() != null) {
                for (Behaviour b : r.behaviours()) {
                    behaviour.merge(b.name(), 1L, Long::sum);
                }
            }
            if (r.extraCredit() != null && !r.extraCredit().isBlank()) {
                extras.add(Map.of("date", r.date().toString(), "note", r.extraCredit()));
            }
            if (r.pointsOfConcern() != null && !r.pointsOfConcern().isBlank()) {
                concerns.add(Map.of("date", r.date().toString(), "note", r.pointsOfConcern()));
            }
        }

        long homeworkRecorded = homework.values().stream().mapToLong(Long::longValue).sum();
        long participationRecorded = participation.values().stream().mapToLong(Long::longValue).sum();

        // LinkedHashMap rather than Map.of because the report now contains 10 fields.
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("from", from);
        result.put("to", to);
        result.put("recordedDays", rs.size());
        result.put("homeworkRecorded", homeworkRecorded);
        result.put("participationRecorded", participationRecorded);
        result.put("homework", homework);
        result.put("behaviours", behaviour);
        result.put("participation", participation);
        result.put("extraCredits", extras);
        result.put("pointsOfConcern", concerns);
        return result;
    }
}
