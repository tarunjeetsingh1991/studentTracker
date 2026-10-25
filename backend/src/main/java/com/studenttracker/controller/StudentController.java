package com.studenttracker.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.studenttracker.dto.DailyRecordRequest;
import com.studenttracker.dto.DailyRecordResponse;
import com.studenttracker.model.Student;
import com.studenttracker.service.PdfReportService;
import com.studenttracker.service.RecordService;
import com.studenttracker.service.StudentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class StudentController {

    private final StudentService students;
    private final RecordService records;
    private final PdfReportService pdfReports;

    public StudentController(StudentService students, RecordService records,
                             PdfReportService pdfReports) {
        this.students = students;
        this.records = records;
        this.pdfReports = pdfReports;
    }

    @GetMapping("/classes/{code}/students")
    public List<Student> students(@PathVariable String code) {
        return students.byClass(code);
    }

    @GetMapping("/students/{id}")
    public Student student(@PathVariable Long id) {
        return students.one(id);
    }

    @GetMapping("/students/{id}/records")
    public List<DailyRecordResponse> history(@PathVariable Long id,
            @RequestParam LocalDate from, @RequestParam LocalDate to) {
        return records.history(id, from, to);
    }

    @PostMapping("/students/{id}/records")
    public DailyRecordResponse create(@PathVariable Long id,
            @Valid @RequestBody DailyRecordRequest req) {
        return records.create(id, req);
    }

    @PutMapping("/students/{id}/records")
    public DailyRecordResponse save(@PathVariable Long id,
            @Valid @RequestBody DailyRecordRequest req) {
        return records.updateExisting(id, req);
    }

    @DeleteMapping("/students/{id}/records")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @RequestParam LocalDate date) {
        records.delete(id, date);
    }

    @GetMapping("/students/{id}/consolidate")
    public Map<String, Object> consolidate(@PathVariable Long id,
            @RequestParam LocalDate from, @RequestParam LocalDate to) {
        return records.consolidate(id, from, to);
    }

    @GetMapping(value = "/students/{id}/report/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id,
            @RequestParam LocalDate from, @RequestParam LocalDate to) {
        byte[] pdf = pdfReports.generate(id, from, to);
        String filename = "Student_" + id + "_Progress_Report.pdf";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDisposition(ContentDisposition.attachment().filename(filename).build());
        headers.setCacheControl("no-store");
        return ResponseEntity.ok().headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdf.length).body(pdf);
    }
}
