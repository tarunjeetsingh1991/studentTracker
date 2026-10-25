package com.studenttracker.dto;

import java.time.LocalDate;
import java.util.Set;
import com.studenttracker.model.Behaviour;
import com.studenttracker.model.DailyRecord;
import com.studenttracker.model.Homework;
import com.studenttracker.model.Participation;

public record DailyRecordResponse(
    Long id,
    LocalDate date,
    Homework homework,
    Set<Behaviour> behaviours,
    Participation participation,
    String extraCredit,
    String pointsOfConcern) {

  public static DailyRecordResponse from(DailyRecord r) {
    return new DailyRecordResponse(r.id, r.date, r.homework,
        r.behaviours, r.participation, r.extraCredit, r.pointsOfConcern);
  }
}
