package com.studenttracker.dto;

import java.time.LocalDate;
import java.util.Set;
import com.studenttracker.model.Behaviour;
import com.studenttracker.model.Homework;
import com.studenttracker.model.Participation;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DailyRecordRequest(
    @NotNull LocalDate date,
    Homework homework,
    Set<Behaviour> behaviours,
    Participation participation,
    @Size(max = 2000) String extraCredit,
    @Size(max = 2000) String pointsOfConcern) {
}
