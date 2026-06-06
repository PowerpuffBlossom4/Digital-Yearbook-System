import { useState } from "react";
import {
  FiSearch,
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import "./yearbook.css";

export default function StudentYearbook() {
  const [program, setProgram] = useState("All");

  const students = [
    {
      name: "Sarah Johnson",
      initials: "SJ",
      motto: "Code, Create, Connect",
      program: "Computer Science",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=900&auto=format&fit=crop",
    },
    {
      name: "Michael Chen",
      initials: "MC",
      motto: "Innovation through collaboration",
      program: "Computer Science",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=900&auto=format&fit=crop",
    },
    {
      name: "Emma Rodriguez",
      initials: "ER",
      motto: "Dream big, work hard",
      program: "Business",
      image:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=900&auto=format&fit=crop",
    },
    {
      name: "James Wilson",
      initials: "JW",
      motto: "Build the future",
      program: "Engineering",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=900&auto=format&fit=crop",
    },
  ];

  const filteredStudents =
    program === "All"
      ? students
      : students.filter(
          (student) => student.program === program
        );

  return (
    <div className="yearbook">

          {/* HERO */}
    <section className="yearbook__hero">

      <span className="yearbook__badge">
         <strong>Digital Yearbook</strong>
      </span>

      <h1>
        Flip through published
        <br />
        yearbooks.
      </h1>

      <p>
        Explore memories, profiles,
        achievements, and unforgettable
        moments from every graduates.
      </p>

    </section>

      {/* TOP TABS */}
      <div className="yearbook__tabs">
        <button className="active">
          Class of 2026
        </button>

        
      </div>

      {/* FEATURED */}
      <section className="yearbook__featured">

        {/* LEFT IMAGE */}
        <div className="yearbook__cover">

          <img
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop"
            alt="Graduates"
          />

        </div>

        {/* DIVIDER */}
        <div className="yearbook__divider"></div>

        {/* RIGHT CONTENT */}
        <div className="yearbook__featuredContent">

          <span className="small-label">
            <FiBookOpen />
            Flipbook
          </span>

          <h2>Class of 2026</h2>

          <p className="featured-program">
            142 graduates
          </p>

          <p className="featured-description">
            Flip through every page,
            profile, and shared memory
            from the Class of 2026 batch.
          </p>

          <div className="yearbook__controls">

            <button className="circle-btn">
              <FiChevronLeft />
            </button>

            <button className="open-btn">
              <FiBookOpen />
              Open Yearbook
            </button>

            <button className="circle-btn">
              <FiChevronRight />
            </button>

          </div>

        </div>

      </section>

      {/* STUDENTS */}
      <section className="yearbook__students">

        <div className="yearbook__header">

          <div>
            <h2>
              Class of 2024 Students Gallery
            </h2>

           
          </div>

        </div>

        {/* SEARCH + FILTER */}
        <div className="yearbook__actions">

          <div className="yearbook__search">
            <FiSearch />

            <input
              type="text"
              placeholder="Search by name or motto..."
            />
          </div>

          <select
            className="yearbook__filter"
            value={program}
            onChange={(e) =>
              setProgram(e.target.value)
            }
          >
            <option value="All">
              All Departments
            </option>

            <option value="Computer Science">
              Computer Science
            </option>

            <option value="Business">
              Business
            </option>

            <option value="Engineering">
              Engineering
            </option>

          </select>

        </div>

        {/* GRID */}
        <div className="yearbook__grid">

          {filteredStudents.map((student, index) => (

            <div
              className="yearbook__card"
              key={index}
            >

              <div className="yearbook__image">

                <img
                  src={student.image}
                  alt={student.name}
                />

              </div>

              <div className="yearbook__info">

                <h3>{student.name}</h3>

                <span className="student-initials">
                  {student.initials}
                </span>

                <p className="yearbook__motto">
                  "{student.motto}"
                </p>

                <span className="yearbook__program">
                  {student.program}
                </span>

              </div>

            </div>

          ))}

        </div>

      </section>

    </div>
  );
}