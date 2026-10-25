
import React from "react";
import { Link } from "react-router-dom";

export default function Home() {

  const classrooms = [
    { code: "6-1", students: 38 },
    { code: "6-2", students: 33 }
  ];

  return (
    <>
      {/* Homepage hero section */}
      <div className="hero p-4 p-md-5 mb-4">
        <div className="eyebrow">
          YOUR CLASSROOM, ORGANIZED
        </div>

        <h1 className="display-6 fw-bold mt-3">
          Every student's progress,
          <br />
          all in one place.
        </h1>

        <p className="lead mb-0">
          Choose a classroom to review students
          and record daily observations.
        </p>
      </div>

      {/* Classroom cards */}
      <div className="row g-4">

        {classrooms.map((classroom) => (

          <div
            className="col-md-6"
            key={classroom.code}
          >

            <Link
              to={`/class/${classroom.code}`}
              className="class-card d-block p-4"
            >

              {/* Card header */}
              <div className="class-card-header">

                <span className="eyebrow">
                  GRADE SIX
                </span>

                {/* Teacher badge and arrow */}
                <div className="class-card-header-right">

                  <div className="teacher-badge">

                    <div className="teacher-avatar">
                      G
                    </div>

                    <div className="teacher-details">

                      <span className="teacher-label">
                        TAUGHT BY
                      </span>

                      <span className="teacher-name">
                        Gurchintan Kaur
                      </span>

                    </div>

                  </div>

                  <span
                    className="class-arrow"
                    aria-hidden="true"
                  >
                    ↗
                  </span>

                </div>

              </div>

              {/* Class information */}
              <h2 className="display-5 fw-bold mt-4">
                {classroom.code}
              </h2>

              <p className="text-muted mb-0">
                {classroom.students} students · View classroom
              </p>

            </Link>

          </div>

        ))}

      </div>
    </>
  );
}
