
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, params } from '../api';
import ChoiceGroup from '../components/ChoiceGroup';
import ObservationCalendar from '../components/ObservationCalendar';

const homework = [
  ['NOT_DONE', 'Homework not done'],
  ['PARTIALLY_DONE', 'Homework partially done'],
  ['WELL_DONE', 'Note/Textbook or Folder not brought']
  //['WELL_DONE', 'Homework well done']
];

const behaviours = [
  ['TALKING', 'Talking'],
  ['DISTRACTED', 'Distracted'],
  ['ZONED_OUT', 'Zoned out'],
  ['DISTRACTING_OTHERS', 'Distracting others']
];

const participation = [
  ['TAKING_INITIATIVE', 'Taking initiative'],
  ['ANSWERS_WHEN_PROMPTED', 'Able to answer when prompted'],
  ['RELUCTANT_TO_ANSWER', 'Reluctant to answer'],
  [
    'UNABLE_AFTER_MULTIPLE_PROMPTS',
    'Unable to answer despite multiple prompts'
  ],
  [
    'UNABLE_TO_REMEDY_AFTER_EXPLANATION',
    'Unable to remedy despite explanation'
  ]
];

const today = () => new Date().toLocaleDateString('en-CA');

const empty = d => ({
  date: d,
  homework: null,
  behaviours: [],
  participation: null,
  extraCredit: '',
  pointsOfConcern: ''
});

// Consolidated performance display
// Example: 2 of 4, 50%
function SummaryGroup({ title, data, options, denominator }) {
  return (
    <div className="mb-4">
      <h3 className="h6 fw-bold mb-3">{title}</h3>

      {options.map(([key, label]) => {
        const count = data?.[key] || 0;

        const percentage =
          denominator > 0
            ? Math.round((count / denominator) * 100)
            : 0;

        return (
          <div key={key} className="mb-2">
            <div className="d-flex justify-content-between small gap-3">
              <span>{label}</span>

              <strong>
                {count} of {denominator}, {percentage}%
              </strong>
            </div>

            <div className="progress" style={{ height: 7 }}>
              <div
                className="progress-bar"
                style={{
                  width: `${percentage}%`
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function StudentPage() {
  const { id } = useParams();

  const [student, setStudent] = useState(null);
  const [date, setDate] = useState(today());
  const [form, setForm] = useState(empty(today()));
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [exists, setExists] = useState(false);

  // Refresh calendar after Save, Update, Delete
  const [calendarRefresh, setCalendarRefresh] = useState(0);

  const [mode, setMode] = useState('all');
  const [from, setFrom] = useState(today());
  const [to, setTo] = useState(today());

  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  // Load student information
  useEffect(() => {
    api(`/students/${id}`)
      .then(setStudent)
      .catch(e => setError(e.message));
  }, [id]);

  // Load existing observation for selected date
  useEffect(() => {
    setStatus('');
    setReport(null);
    setForm(empty(date));
    setExists(false);

    let active = true;

    api(`/students/${id}/records?${params(date, date)}`)
      .then(rs => {
        if (active && rs.length) {
          setExists(true);

          setForm({
            ...rs[0],
            behaviours: rs[0].behaviours || [],
            extraCredit: rs[0].extraCredit || '',
            pointsOfConcern: rs[0].pointsOfConcern || ''
          });
        }
      })
      .catch(e => {
        if (active) setError(e.message);
      });

    return () => {
      active = false;
    };
  }, [id, date]);

  const update = (key, value) => {
    setForm(previous => ({
      ...previous,
      [key]: value
    }));
  };

  // CREATE: Save a new daily record
  async function save(e) {
    e.preventDefault();

    if (exists) return;

    setBusy(true);
    setStatus('');
    setError('');

    try {
      await api(`/students/${id}/records`, {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          date
        })
      });

      setExists(true);
      setReport(null);

      // Refresh calendar dots
      setCalendarRefresh(previous => previous + 1);

      setStatus('Daily record saved successfully.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  // UPDATE: Modify an existing daily record
  async function updateRecord() {
    if (!exists) return;

    setBusy(true);
    setStatus('');
    setError('');

    try {
      await api(`/students/${id}/records`, {
        method: 'PUT',
        body: JSON.stringify({
          ...form,
          date
        })
      });

      setReport(null);

      // Refresh calendar dots
      setCalendarRefresh(previous => previous + 1);

      setStatus('Daily record updated successfully.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  // DELETE: Remove selected date's observation
  async function deleteRecord() {
    if (
      !exists ||
      !window.confirm(
        `Delete the observation for ${date}? This cannot be undone.`
      )
    ) {
      return;
    }

    setBusy(true);
    setStatus('');
    setError('');

    try {
      await api(
        `/students/${id}/records?${new URLSearchParams({ date })}`,
        { method: 'DELETE' }
      );

      setForm(empty(date));
      setExists(false);
      setReport(null);

      // Refresh calendar dots
      setCalendarRefresh(previous => previous + 1);

      setStatus('Daily record deleted.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  // Download a PDF using the same selected date range as consolidation.
  async function downloadReport() {
    setBusy(true);
    setError('');
    try {
      const start = mode === 'all' ? '1900-01-01' : from;
      const end = mode === 'all' ? today() : to;
      if (!start || !end || start > end) {
        throw new Error('Start date must not be after end date');
      }
      const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
      const response = await fetch(
        `${base}/students/${id}/report/pdf?${params(start, end)}`,
        { credentials: 'include', headers: { Accept: 'application/pdf' } }
      );
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || payload?.error || `PDF download failed (${response.status})`);
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `Student_${id}_Progress_Report.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  // Consolidate performance when button is clicked
  async function consolidate() {
    setBusy(true);
    setReport(null);
    setError('');

    try {
      const start = mode === 'all' ? '1900-01-01' : from;
      const end = mode === 'all' ? today() : to;

      if (start > end) {
        throw Error('Start date must not be after end date');
      }

      setReport(
        await api(
          `/students/${id}/consolidate?${params(start, end)}`
        )
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Link
        className="backlink"
        to={student ? `/class/${student.classCode}` : '/'}
      >
        ← Back to class
      </Link>

      <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 my-4">
        <div>
          <div className="eyebrow">
            CLASS {student?.classCode || '—'} · ROLL #
            {student?.rollNumber || '—'}
          </div>

          <h1 className="fw-bold mb-0">
            {student
              ? `${student.firstName} ${student.lastName}`
              : 'Student profile'}
          </h1>

          <p className="text-muted mb-0">
            Daily progress and observations
          </p>
        </div>
      </div>

      {error && (
        <div role="alert" className="alert alert-danger">
          {error}
        </div>
      )}

      <form onSubmit={save}>
        {/* Calendar date selection */}
        <div className="panel p-4 mb-3">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <h2 className="h5 fw-bold mb-1">
                Daily observation
              </h2>

              <div className="text-muted small">
                Choose a date to add or edit that day's record.
              </div>

              <p className="small text-muted mt-3">
                <span
                  className="record-dot d-inline-block me-2"
                  style={{ verticalAlign: 'middle' }}
                />
                Green dots indicate dates with saved observations.
              </p>
            </div>

            <ObservationCalendar
              studentId={id}
              selectedDate={date}
              onDateChange={setDate}
              refreshKey={calendarRefresh}
            />
          </div>

          <div className="mt-3 small">
            <strong>Selected date:</strong> {date}
            {' · '}
            {exists
              ? 'Record exists — use Update or Delete.'
              : 'No saved record — use Save.'}
          </div>
        </div>

        {/* Homework */}
        <ChoiceGroup
          title="Homework"
          subtitle="Select one option (or leave unselected)."
          options={homework}
          value={form.homework}
          onChange={value => update('homework', value)}
        />

        {/* Class behaviour */}
        <ChoiceGroup
          title="Class behaviour"
          subtitle="Select all that apply."
          options={behaviours}
          multiple
          value={form.behaviours}
          onChange={value => update('behaviours', value)}
        />

        {/* Class participation */}
        <ChoiceGroup
          title="Class participation"
          subtitle="Select one option (or leave unselected)."
          options={participation}
          value={form.participation}
          onChange={value => update('participation', value)}
        />

        {/* Extra credits and points of concern */}
        <div className="row g-3 mb-3">
          <div className="col-12 col-md-6">
            <section className="panel note-panel note-panel-positive p-4 h-100">
              <h2 className="h5 fw-bold note-heading-positive">Extra credits</h2>
              <p className="text-muted small">
                Record a positive achievement or additional credit for this date.
              </p>
              <textarea
                maxLength={2000}
                className="form-control note-input-positive"
                rows={4}
                placeholder="e.g. Helped classmates complete their activity..."
                value={form.extraCredit}
                onChange={e => update('extraCredit', e.target.value)}
              />
            </section>
          </div>
          <div className="col-12 col-md-6">
            <section className="panel note-panel note-panel-concern p-4 h-100">
              <h2 className="h5 fw-bold note-heading-concern">Points of concern</h2>
              <p className="text-muted small">
                Record areas where the student may need additional support.
              </p>
              <textarea
                maxLength={2000}
                className="form-control note-input-concern"
                rows={4}
                placeholder="e.g. Needs support staying focused during activities..."
                value={form.pointsOfConcern}
                onChange={e => update('pointsOfConcern', e.target.value)}
              />
            </section>
          </div>
        </div>

        {/* Save, Update and Delete */}
        <div className="d-flex align-items-center flex-wrap gap-3 mb-5">

          <button
            type="submit"
            disabled={busy || exists}
            className={`btn px-4 py-2 ${
              exists
                ? 'btn-secondary save-disabled'
                : 'btn-primary'
            }`}
            title={
              exists
                ? 'Record already exists. Use Update or Delete.'
                : 'Save a new daily observation'
            }
          >
            {exists ? 'Already saved' : 'Save daily record'}
          </button>


          <button
            type="button"
            disabled={busy || !exists}
            className="btn btn-outline-primary px-4 py-2"
            onClick={updateRecord}
          >
            Update
          </button>

          <button
            type="button"
            disabled={busy || !exists}
            className="btn btn-outline-danger px-4 py-2"
            onClick={deleteRecord}
          >
            Delete
          </button>

          {status && (
            <span role="status" className="text-success fw-semibold">
              ✓ {status}
            </span>
          )}
        </div>
      </form>

      {/* Consolidated performance */}
      <section className="panel p-4 p-md-5">
        <div className="eyebrow">INSIGHTS</div>

        <h2 className="h3 fw-bold mt-2">
          Consolidated performance
        </h2>

        <p className="text-muted">
          Generate a summary from saved observations.
          Reports are calculated only when you click Consolidate.
        </p>

        {/* Date range selection */}
        <div className="d-flex flex-wrap gap-3 mb-3">
          <label className="choice">
            <input
              type="radio"
              name="range"
              checked={mode === 'all'}
              onChange={() => {
                setMode('all');
                setReport(null);
              }}
            />
            All recorded dates
          </label>

          <label className="choice">
            <input
              type="radio"
              name="range"
              checked={mode === 'custom'}
              onChange={() => {
                setMode('custom');
                setReport(null);
              }}
            />
            Custom date range
          </label>
        </div>

        {mode === 'custom' && (
          <div className="d-flex flex-wrap gap-3 mb-3">
            <label className="small">
              From
              <input
                type="date"
                className="form-control mt-1"
                max={today()}
                value={from}
                onChange={e => {
                  setFrom(e.target.value);
                  setReport(null);
                }}
              />
            </label>

            <label className="small">
              To
              <input
                type="date"
                className="form-control mt-1"
                max={today()}
                value={to}
                onChange={e => {
                  setTo(e.target.value);
                  setReport(null);
                }}
              />
            </label>
          </div>
        )}

        <div className="d-flex flex-wrap gap-3">
          <button
            type="button"
            className="btn btn-dark px-4"
            disabled={busy}
            onClick={consolidate}
          >
            Consolidate →
          </button>
          <button
            type="button"
            className="btn btn-primary px-4"
            disabled={busy || !student}
            onClick={downloadReport}
          >
            Download PDF Report ↓
          </button>
        </div>

        {report && (
          <div className="mt-4 pt-4 border-top">
            {/* Summary cards */}
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="stat">
                  <div className="text-muted small">
                    Recorded days
                  </div>

                  <div className="fs-2 fw-bold">
                    {report.recordedDays}
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="stat">
                  <div className="text-muted small">
                    Homework entries
                  </div>

                  <div className="fs-2 fw-bold">
                    {report.homeworkRecorded}
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="stat">
                  <div className="text-muted small">
                    Participation entries
                  </div>

                  <div className="fs-2 fw-bold">
                    {report.participationRecorded}
                  </div>
                </div>
              </div>
            </div>

            <p className="small text-muted">
              Range: {report.from} to {report.to}.
              Percentages use the number of recorded entries
              for that section; behaviour percentages use
              recorded days.
            </p>

            {/* Homework summary */}
            <SummaryGroup
              title="Homework"
              data={report.homework}
              options={homework}
              denominator={report.homeworkRecorded}
            />

            {/* Behaviour summary */}
            <SummaryGroup
              title="Class behaviour"
              data={report.behaviours}
              options={behaviours}
              denominator={report.recordedDays}
            />

            {/* Participation summary */}
            <SummaryGroup
              title="Class participation"
              data={report.participation}
              options={participation}
              denominator={report.participationRecorded}
            />

            {/* Extra credit notes */}
            <h3 className="h6 fw-bold note-heading-positive">
              Extra credit notes ({report.extraCredits.length})
            </h3>

            {report.extraCredits.length ? (
              report.extraCredits.map((item, index) => (
                <div
                  className="border-bottom py-2"
                  key={index}
                >
                  <span className="text-muted small me-3">
                    {item.date}
                  </span>
                  {item.note}
                </div>
              ))
            ) : (
              <p className="text-muted small">
                No extra credits recorded in this range.
              </p>
            )}

            {/* Points of concern notes */}
            <h3 className="h6 fw-bold note-heading-concern mt-4">
              Points of concern ({report.pointsOfConcern?.length || 0})
            </h3>
            {report.pointsOfConcern?.length ? (
              report.pointsOfConcern.map((item, index) => (
                <div className="border-bottom py-2" key={index}>
                  <span className="text-muted small me-3">{item.date}</span>
                  {item.note}
                </div>
              ))
            ) : (
              <p className="text-muted small">
                No points of concern recorded in this range.
              </p>
            )}
          </div>
        )}
      </section>
    </>
  );
}
