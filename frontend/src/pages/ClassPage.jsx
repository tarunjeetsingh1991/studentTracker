import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
export default function ClassPage() {
  const { code } = useParams();
  const [students, setStudents] = useState([]),
    [search, setSearch] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    setError("");
    api(`/classes/${code}/students`)
      .then(setStudents)
      .catch((e) => setError(e.message));
  }, [code]);
  const filtered = students.filter((s) =>
    (s.firstName + " " + s.lastName + " " + s.rollNumber)
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <>
      <Link to="/" className="backlink">
        ← All classrooms
      </Link>
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 my-4">
        <div>
          <div className="eyebrow">CLASSROOM ROSTER</div>
          <h1 className="fw-bold mb-0">Class {code}</h1>
          <span className="text-muted">{students.length} students</span>
        </div>
        <input
          aria-label="Search students"
          className="form-control search"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="panel table-responsive">
        <table className="table align-middle mb-0">
          <thead>
            <tr>
              <th>Roll #</th>
              <th>Last name</th>
              <th>First name</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td className="text-muted">{s.rollNumber}</td>
                <td>{s.lastName}</td>
                <td>
                  <Link className="student-name" to={"/student/" + s.id}>
                    {s.firstName}
                  </Link>
                </td>
                <td className="text-end">
                  <Link
                    className="btn btn-sm btn-outline-primary"
                    to={"/student/" + s.id}
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
