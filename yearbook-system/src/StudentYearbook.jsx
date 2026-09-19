import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  FiSearch,
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiCalendar,
  FiAlertCircle,
  FiX,
  FiMail,
  FiBook,
  FiArrowRight,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";
import "./yearbook.css";

const API_URL = "http://localhost:5000/api";

export default function StudentYearbook() {
  const navigate = useNavigate();

  /* =====================================================
     STATE
  ===================================================== */

  const [yearbooks, setYearbooks] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [students, setStudents] = useState([]);

  const [program, setProgram] = useState("All");
  const [search, setSearch] = useState("");

  const [loadingYearbooks, setLoadingYearbooks] =
    useState(true);

  const [loadingStudents, setLoadingStudents] =
    useState(false);

  const [error, setError] = useState("");


const openStudentProfile = (student) => {
  if (!student?.id) return;

  navigate(`/student/${student.id}`);
};


  /* =====================================================
     SELECTED YEARBOOK
  ===================================================== */

  const selectedYearbook =
    yearbooks[selectedIndex] || null;

  /* =====================================================
     FETCH PUBLISHED YEARBOOKS
  ===================================================== */

  useEffect(() => {
    fetchPublishedYearbooks();
  }, []);

  const fetchPublishedYearbooks = async () => {
    try {
      setLoadingYearbooks(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/yearbooks/published`,
        {
          withCredentials: true,
        }
      );

      const data = response.data;

      const fetchedYearbooks = Array.isArray(data)
        ? data
        : data?.yearbooks || [];

      /*
       * Only use published yearbooks.
       * This also protects the student page in case
       * the backend accidentally returns other statuses.
       */
      const publishedYearbooks =
        fetchedYearbooks.filter(
          (item) =>
            item?.status === "published"
        );

      setYearbooks(publishedYearbooks);
      setSelectedIndex(0);
    } catch (err) {
      console.error(
        "❌ Fetch published yearbooks error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load published yearbooks."
      );
    } finally {
      setLoadingYearbooks(false);
    }
  };

  /* =====================================================
     FETCH STUDENTS WHEN YEARBOOK CHANGES
  ===================================================== */

  useEffect(() => {
    if (!selectedYearbook?.id) {
      setStudents([]);
      return;
    }

    fetchYearbookStudents(
      selectedYearbook.id
    );
  }, [selectedYearbook?.id]);

const fetchYearbookStudents = async (yearbookId) => {
  try {
    setLoadingStudents(true);
    setStudents([]);

    console.log("📚 Loading students for yearbook:", yearbookId);

    const response = await axios.get(
      `${API_URL}/yearbooks/${yearbookId}/students`,
      {
        withCredentials: true,
      }
    );

    console.log("📚 API RESPONSE:", response.data);

    const data = response.data;

    const fetchedStudents = Array.isArray(data)
      ? data
      : Array.isArray(data?.students)
      ? data.students
      : [];

    console.log(
      "👨‍🎓 STUDENTS RETURNED:",
      fetchedStudents.length
    );

    console.table(fetchedStudents);

    const normalizedStudents = fetchedStudents.map(
      (student) => ({
        ...student,
        initials:
          student.initials ||
          getInitials(student.full_name),
      })
    );

    setStudents(normalizedStudents);
  } catch (err) {
    console.error(
      "❌ Fetch yearbook students error:",
      err
    );

    console.error(
      "❌ Server response:",
      err.response?.data
    );

    setStudents([]);
  } finally {
    setLoadingStudents(false);
  }
};

  /* =====================================================
     INITIALS HELPER
  ===================================================== */

  const getInitials = (name) => {
    if (!name) {
      return "ST";
    }

    const parts = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  };

  /* =====================================================
     IMAGE URL HELPER
  ===================================================== */

  const getStudentImage = (student) => {
    if (!student?.profile_pic) {
      return "";
    }

    return student.profile_pic;
  };

  /* =====================================================
     PROGRAM LIST
  ===================================================== */

  const programs = useMemo(() => {
    const values = students
      .map(
        (student) =>
          student.department_program
      )
      .filter(Boolean);

    return [
      ...new Set(values),
    ].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [students]);

  /* =====================================================
     FILTER STUDENTS
  ===================================================== */

const filteredStudents = useMemo(() => {
  const searchTerm = search.trim().toLowerCase();

  return students.filter((student) => {
    const matchesProgram =
      program === "All" ||
      student.department_program === program;

    const matchesSearch =
      !searchTerm ||
      student.full_name?.toLowerCase().includes(searchTerm) ||
      student.nickname?.toLowerCase().includes(searchTerm) ||
      student.motto?.toLowerCase().includes(searchTerm) ||
      student.email?.toLowerCase().includes(searchTerm);

    return matchesProgram && matchesSearch;
  });
}, [students, program, search]);

  /* =====================================================
     YEARBOOK NAVIGATION
  ===================================================== */

  const previousYearbook = () => {
    if (!yearbooks.length) {
      return;
    }

    setSelectedIndex(
      (current) =>
        current === 0
          ? yearbooks.length - 1
          : current - 1
    );

    setProgram("All");
    setSearch("");
  };

  const nextYearbook = () => {
    if (!yearbooks.length) {
      return;
    }

    setSelectedIndex(
      (current) =>
        current ===
        yearbooks.length - 1
          ? 0
          : current + 1
    );

    setProgram("All");
    setSearch("");
  };

  /* =====================================================
     SELECT YEARBOOK
  ===================================================== */

  const selectYearbook = (index) => {
    setSelectedIndex(index);
    setProgram("All");
    setSearch("");
  };

  /* =====================================================
     OPEN YEARBOOK
     
     IMPORTANT:
     The viewer uses the yearbook ID from
     /yearbooks/:id and fetches the actual
     pages from the backend.
  ===================================================== */

  const openYearbook = () => {
    if (!selectedYearbook?.id) {
      return;
    }

    navigate(
      `/yearbooks/${selectedYearbook.id}`
    );
  };

  /* =====================================================
     COVER IMAGE
  ===================================================== */

  const coverImage =
    selectedYearbook?.thumbnail ||
    "/images/grad.jpg";

  /* =====================================================
     YEARBOOK INFORMATION
  ===================================================== */

  const yearbookTitle =
    selectedYearbook?.title ||
    selectedYearbook?.batch_name ||
    "Published Yearbook";

  const batchName =
    selectedYearbook?.batch_name ||
    "";

  const academicYear =
    selectedYearbook?.academic_year ||
    "";

  const description =
    selectedYearbook?.description ||
    "Explore memories, profiles, achievements, and unforgettable moments from this published yearbook.";

const studentCount = students.length;

  /* =====================================================
     LOADING STATE
  ===================================================== */

  if (loadingYearbooks) {
    return (
      <div className="yearbook">
        <section className="yearbook__state">

          <div className="yearbook__loader" />

          <h2>
            Loading published yearbooks...
          </h2>

          <p>
            Please wait while we load the
            latest yearbooks.
          </p>

        </section>
      </div>
    );
  }

  /* =====================================================
     ERROR STATE
  ===================================================== */

  if (error) {
    return (
      <div className="yearbook">

        <section className="yearbook__state yearbook__state--error">

          <FiAlertCircle />

          <h2>
            Unable to load yearbooks
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="open-btn"
            onClick={
              fetchPublishedYearbooks
            }
          >
            Try Again
          </button>

        </section>

      </div>
    );
  }

  /* =====================================================
     NO PUBLISHED YEARBOOK
  ===================================================== */

  if (!yearbooks.length) {
    return (
      <div className="yearbook">

        <section className="yearbook__state">

          <div className="yearbook__emptyIcon">
            <FiBookOpen />
          </div>

          <h2>
            No Published Yearbooks Yet
          </h2>

          <p>
            Published yearbooks will appear
            here once the administrator
            releases them.
          </p>

        </section>

      </div>
    );
  }

  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <div className="yearbook">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="yearbook__hero">

        <span className="yearbook__badge">

          <FiBookOpen />

          <strong>
            Digital Yearbook
          </strong>

        </span>

        <h1>
          Flip through published
          <br />
          yearbooks.
        </h1>

        <p>
          Explore memories, profiles,
          achievements, and unforgettable
          moments from every graduating batch.
        </p>

      </section>

{/* =================================================
    YEARBOOK TABS
================================================= */}
<div className="yearbook__tabs">
  {yearbooks.map(
    (yearbook, index) => (
      <button
        key={yearbook.id}
        type="button"
        className={
          index === selectedIndex
            ? "active"
            : ""
        }
        onClick={() =>
          selectYearbook(index)
        }
      >
        {yearbook.academic_year ||
          yearbook.title ||
          `Yearbook ${index + 1}`}
      </button>
    )
  )}
</div>

      {/* =================================================
          FEATURED YEARBOOK
      ================================================= */}

      <section className="yearbook__featured">

        {/* ===============================================
            COVER
        =============================================== */}

        <div className="yearbook__cover">

          <div className="yearbook__coverFrame">

            <img
              src={coverImage}
              alt={yearbookTitle}
              onError={(event) => {
                /*
                 * Prevent infinite error loops.
                 */
                if (
                  event.currentTarget.src.includes(
                    "/images/grad.jpg"
                  )
                ) {
                  return;
                }

                event.currentTarget.src =
                  "/images/grad.jpg";
              }}
            />

          </div>

        </div>

        {/* ===============================================
            DIVIDER
        =============================================== */}

        <div className="yearbook__divider" />

        {/* ===============================================
            CONTENT
        =============================================== */}

        <div className="yearbook__featuredContent">

          <span className="small-label">

            <FiBookOpen />

            Flipbook

          </span>

          <h2>
            {batchName ||
              yearbookTitle}
          </h2>

          {/* ============================================
              YEARBOOK META
          ============================================ */}

          <div className="yearbook__meta">

            {academicYear && (
              <span>

                <FiCalendar />

                {academicYear}

              </span>
            )}

            <span>

              <FiUsers />

              {studentCount}{" "}

              {studentCount === 1
                ? "student"
                : "students"}

            </span>

          </div>

          {/* ============================================
              PROGRAM
          ============================================ */}

          <p className="featured-program">

            {selectedYearbook?.department_program ||
              "Graduating Class"}

          </p>

          {/* ============================================
              DESCRIPTION
          ============================================ */}

          <p className="featured-description">

            {description}

          </p>

          {/* ============================================
              CONTROLS
          ============================================ */}

          <div className="yearbook__controls">

            <button
              type="button"
              className="circle-btn"
              onClick={
                previousYearbook
              }
              aria-label="Previous yearbook"
              disabled={
                yearbooks.length <= 1
              }
            >
              <FiChevronLeft />
            </button>

            {/* ========================================
                OPEN FLIPBOOK
            ======================================== */}

            <button
              type="button"
              className="open-btn"
              onClick={
                openYearbook
              }
            >
              <FiBookOpen />

              Open Yearbook
            </button>

            <button
              type="button"
              className="circle-btn"
              onClick={
                nextYearbook
              }
              aria-label="Next yearbook"
              disabled={
                yearbooks.length <= 1
              }
            >
              <FiChevronRight />
            </button>

          </div>

        </div>

      </section>

      {/* =================================================
          STUDENT GALLERY
      ================================================= */}

      <section className="yearbook__students">

        {/* ===============================================
            HEADER
        =============================================== */}

        <div className="yearbook__header">

          <div>

            <span className="section-label">
              Student Directory
            </span>

           <h2>
  {batchName || yearbookTitle} Students Gallery
</h2>

<p>
  Graduating Class of {academicYear}. Browse all students
  from this graduating batch.
</p>

          </div>

          <div className="yearbook__studentCount">

            <strong>
              {filteredStudents.length}
            </strong>

            <span>
              {filteredStudents.length === 1
                ? "Student"
                : "Students"}
            </span>

          </div>

        </div>

        {/* ===============================================
            SEARCH + FILTER
        =============================================== */}

        <div className="yearbook__actions">

          <div className="yearbook__search">

            <FiSearch />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search by name, nickname, motto, or email..."
            />

          </div>

          <select
            className="yearbook__filter"
            value={program}
            onChange={(event) =>
              setProgram(
                event.target.value
              )
            }
          >

            <option value="All">
              All Departments
            </option>

            {programs.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}

          </select>

        </div>

        {/* ===============================================
            LOADING STUDENTS
        =============================================== */}

        {loadingStudents ? (

          <div className="yearbook__studentLoading">

            <div className="yearbook__loader" />

            <p>
              Loading students...
            </p>

          </div>

        ) : filteredStudents.length === 0 ? (

          /* =============================================
             EMPTY STUDENTS
          ============================================= */

          <div className="yearbook__noStudents">

            <FiUsers />

            <h3>
              No students found
            </h3>

            <p>
              Try changing your search
              or department filter.
            </p>

          </div>

        ) : (

          /* =============================================
             STUDENT GRID
          ============================================= */

          <div className="yearbook__grid">

            {filteredStudents.map(
              (student) => {

                const image =
                  getStudentImage(
                    student
                  );

                const initials =
                  student.initials ||
                  getInitials(
                    student.full_name
                  );

                               return (
                  <div
  className="yearbook__card"
  key={student.id}
  onClick={() => openStudentProfile(student)}
  role="button"
  tabIndex={0}
  onKeyDown={(event) => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      openStudentProfile(student);
    }
  }}
>
  {/* =====================================================
      PHOTO
  ===================================================== */}
  <div className="yearbook__image">
    {image ? (
      <img
        src={image}
        alt={student.full_name || "Student"}
        loading="lazy"
        onError={(event) => {
          event.currentTarget.style.display = "none";

          event.currentTarget.parentElement.classList.add(
            "image-error"
          );
        }}
      />
    ) : (
      <div className="yearbook__imageFallback">
        {initials}
      </div>
    )}

    {/* =================================================
        HOVER PROFILE INFORMATION
    ================================================= */}
    <div className="student-hover">
      <div className="student-hover__content">

        <span className="student-hover__label">
          STUDENT PROFILE
        </span>

        <h3>
          {student.full_name || "Student"}
        </h3>

        {student.nickname && (
          <span className="student-hover__nickname">
            “{student.nickname}”
          </span>
        )}

        <div className="student-hover__details">

          {student.department_program && (
            <div className="student-hover__detail">
              <FiBook />
              <span>
                {student.department_program}
              </span>
            </div>
          )}

          {student.email && (
            <div className="student-hover__detail">
              <FiMail />
              <span>
                {student.email}
              </span>
            </div>
          )}

          {student.batch && (
            <div className="student-hover__detail">
              <FiCalendar />
              <span>
                Batch {student.batch}
              </span>
            </div>
          )}

        </div>

        {student.motto && (
          <p className="student-hover__motto">
            “{student.motto}”
          </p>
        )}

        <div className="student-hover__button">
          View Profile
          <FiArrowRight />
        </div>

      </div>
    </div>
  </div>

  {/* =====================================================
      NORMAL CARD INFORMATION
  ===================================================== */}
<div className="yearbook__info">
  <div className="student-card__top">
    <span className="student-initials">
      {initials}
    </span>
  </div>

  <h3>
    {student.full_name || "Student"}
  </h3>

  {student.nickname && (
    <span className="student-card__nickname">
      “{student.nickname}”
    </span>
  )}

  {student.motto && (
    <p className="student-card__motto">
      {student.motto}
    </p>
  )}

  {student.department_program && (
    <span className="yearbook__program">
      {student.department_program}
    </span>
  )}

</div>
</div>
                );
              })}
            </div>
          )}
        </section>

      </div>
    );
}