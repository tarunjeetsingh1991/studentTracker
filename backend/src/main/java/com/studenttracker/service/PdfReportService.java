package com.studenttracker.service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.studenttracker.model.Student;

@Service
public class PdfReportService {

    private final StudentService students;
    private final RecordService records;

    private static final java.awt.Color NAVY = new java.awt.Color(22, 42, 75);
    private static final java.awt.Color BLUE = new java.awt.Color(38, 107, 196);
    private static final java.awt.Color GREEN = new java.awt.Color(30, 128, 79);
    private static final java.awt.Color RED = new java.awt.Color(190, 53, 65);
    private static final java.awt.Color LIGHT = new java.awt.Color(241, 246, 252);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("MMM d, yyyy");

    public PdfReportService(StudentService students, RecordService records) {
        this.students = students;
        this.records = records;
    }

    @Transactional(readOnly = true)
    public byte[] generate(Long studentId, LocalDate from, LocalDate to) {
        Student student = students.one(studentId);
        Map<String, Object> summary = records.consolidate(studentId, from, to);

        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Document document = new Document(com.lowagie.text.PageSize.A4, 42, 42, 48, 48);
            PdfWriter.getInstance(document, output);
            document.open();

            Font title = new Font(Font.HELVETICA, 19, Font.BOLD, NAVY);
            Font subtitle = new Font(Font.HELVETICA, 10, Font.NORMAL, BLUE);
            Font body = new Font(Font.HELVETICA, 10, Font.NORMAL, NAVY);
            Font small = new Font(Font.HELVETICA, 9, Font.NORMAL, NAVY);
            Font heading = new Font(Font.HELVETICA, 12, Font.BOLD, NAVY);

            Paragraph brand = new Paragraph("STUDENT PROGRESS TRACKER", subtitle);
            brand.setSpacingAfter(7);
            document.add(brand);

            Paragraph headingText = new Paragraph("Student Performance Report", title);
            headingText.setSpacingAfter(16);
            document.add(headingText);

            PdfPTable details = new PdfPTable(2);
            details.setWidthPercentage(100);
            details.setSpacingAfter(16);
            detail(details, "Student", student.firstName + " " + student.lastName, body);
            detail(details, "Teacher", "Gurchintan Kaur", body);
            detail(details, "Class", student.classCode, body);
            detail(details, "Roll number", String.valueOf(student.rollNumber), body);
            detail(details, "Report period", from.format(DATE_FORMAT) + " - " + to.format(DATE_FORMAT), body);
            detail(details, "Generated", LocalDate.now().format(DATE_FORMAT), body);
            document.add(details);

            long recordedDays = number(summary, "recordedDays");
            long homeworkRecorded = number(summary, "homeworkRecorded");
            long participationRecorded = number(summary, "participationRecorded");

            PdfPTable totals = new PdfPTable(3);
            totals.setWidthPercentage(100);
            totals.setSpacingAfter(17);
            totalCell(totals, "Recorded days", recordedDays, body);
            totalCell(totals, "Homework entries", homeworkRecorded, body);
            totalCell(totals, "Participation entries", participationRecorded, body);
            document.add(totals);

            if (recordedDays == 0) {
                Paragraph none = new Paragraph("No observations recorded for the selected date range.", body);
                none.setSpacingAfter(14);
                document.add(none);
            }

            section(document, "Homework", counts(summary, "homework"), homeworkRecorded,
                Map.of("NOT_DONE", "Homework not done",
                       "PARTIALLY_DONE", "Homework partially done",
                       "WELL_DONE", "Note/Textbook or Folder not brought"), heading, small);

            section(document, "Class behaviour", counts(summary, "behaviours"), recordedDays,
                Map.of("TALKING", "Talking",
                       "DISTRACTED", "Distracted",
                       "ZONED_OUT", "Zoned out",
                       "DISTRACTING_OTHERS", "Distracting others"), heading, small);

            section(document, "Class participation", counts(summary, "participation"), participationRecorded,
                Map.of("TAKING_INITIATIVE", "Taking initiative",
                       "ANSWERS_WHEN_PROMPTED", "Able to answer when prompted",
                       "RELUCTANT_TO_ANSWER", "Reluctant to answer",
                       "UNABLE_AFTER_MULTIPLE_PROMPTS", "Unable to answer despite multiple prompts",
                       "UNABLE_TO_REMEDY_AFTER_EXPLANATION", "Unable to remedy despite explanation"), heading, small);

            addDatedNotes(document, summary, "extraCredits", "Extra credit notes",
                GREEN, small);
            addDatedNotes(document, summary, "pointsOfConcern", "Points of concern",
                RED, small);

            document.close();
            return output.toByteArray();
        } catch (DocumentException | java.io.IOException ex) {
            throw new IllegalStateException("Unable to generate student PDF report", ex);
        }
    }

    @SuppressWarnings("unchecked")
    private static void addDatedNotes(Document document, Map<String, Object> summary,
                                      String key, String title, java.awt.Color color,
                                      Font body) throws DocumentException {
        List<Map<String, String>> notes = (List<Map<String, String>>) summary.get(key);
        if (notes == null) notes = List.of();
        Font coloredHeading = new Font(Font.HELVETICA, 12, Font.BOLD, color);
        Paragraph header = new Paragraph(title + " (" + notes.size() + ")", coloredHeading);
        header.setSpacingBefore(10);
        header.setSpacingAfter(9);
        document.add(header);
        if (notes.isEmpty()) {
            document.add(new Paragraph("No " + title.toLowerCase() + " recorded in this range.", body));
            return;
        }
        for (Map<String, String> note : notes) {
            Paragraph entry = new Paragraph(note.get("date") + "  -  " + note.get("note"), body);
            entry.setSpacingAfter(7);
            document.add(entry);
        }
    }

    private static long number(Map<String, Object> summary, String key) {
        return ((Number) summary.get(key)).longValue();
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Long> counts(Map<String, Object> summary, String key) {
        return (Map<String, Long>) summary.get(key);
    }

    private static void detail(PdfPTable table, String label, String value, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(label + ":  " + value, font));
        cell.setPadding(9);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setBackgroundColor(LIGHT);
        table.addCell(cell);
    }

    private static void totalCell(PdfPTable table, String label, long value, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(label + "\n" + value, font));
        cell.setPadding(12);
        cell.setBorderColor(java.awt.Color.WHITE);
        cell.setBackgroundColor(LIGHT);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    private static void section(Document document, String title, Map<String, Long> counts,
                                long denominator, Map<String, String> labels,
                                Font heading, Font body) throws DocumentException {
        Paragraph header = new Paragraph(title, heading);
        header.setSpacingBefore(9);
        header.setSpacingAfter(8);
        document.add(header);

        PdfPTable table = new PdfPTable(new float[] { 3.5f, 1.5f });
        table.setWidthPercentage(100);
        table.setSpacingAfter(12);

        for (Map.Entry<String, Long> entry : counts.entrySet()) {
            long count = entry.getValue();
            long percent = denominator == 0 ? 0 : Math.round(count * 100.0 / denominator);
            PdfPCell label = new PdfPCell(new Phrase(labels.getOrDefault(entry.getKey(), entry.getKey()), body));
            label.setPadding(7);
            label.setBorderColor(new java.awt.Color(224, 231, 240));
            table.addCell(label);

            PdfPCell value = new PdfPCell(new Phrase(count + " of " + denominator + ", " + percent + "%", body));
            value.setPadding(7);
            value.setHorizontalAlignment(Element.ALIGN_RIGHT);
            value.setBorderColor(new java.awt.Color(224, 231, 240));
            table.addCell(value);
        }
        document.add(table);
    }
}
