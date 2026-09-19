import { useState, useMemo } from "react";
import "./StudentList.css";

export default function StudentList({
  students = [],
  onInsert,
  onClose,
  insertedStudentIds = [],
}) {
  const [search, setSearch] = useState("");
  const [program, setProgram] = useState("");
  const [batch, setBatch] = useState("");
  const [selected, setSelected] = useState([]);

  // ==========================================
  // GET STUDENT ID
  // ==========================================
  const getStudentId = (student) =>
    student?.id ??
    student?.student_id ??
    student?.studentId;

  // ==========================================
  // GET STUDENT NAME
  // ==========================================
  const getStudentName = (student) =>
    student?.name ||
    student?.full_name ||
    student?.studentName ||
    student?.fullName ||
    "Student";

  // ==========================================
  // GET STUDENT PROGRAM
  // ==========================================
  const getStudentProgram = (student) =>
    student?.program ||
    student?.department_program ||
    student?.departmentProgram ||
    student?.program_name ||
    "";

  // ==========================================
  // GET STUDENT BATCH
  // ==========================================
  const getStudentBatch = (student) =>
    student?.year ||
    student?.batch ||
    student?.batch_name ||
    student?.academic_year ||
    "";

  // ==========================================
  // GET STUDENT PHOTO
  // ==========================================
  // Your API uses profile_pic.
  // We support several possible names just in case.
  // ==========================================
  const getStudentPhoto = (student) =>
    student?.profile_pic ||
    student?.profilePic ||
    student?.photo ||
    student?.photo_url ||
    student?.photoUrl ||
    student?.profile_photo ||
    student?.profilePhoto ||
    student?.image ||
    student?.image_url ||
    student?.imageUrl ||
    "";

  // ==========================================
  // GET STUDENT NICKNAME
  // ==========================================
  const getStudentNickname = (student) =>
    student?.nickname ||
    student?.nick_name ||
    student?.nickName ||
    "";

  // ==========================================
  // GET STUDENT MOTTO
  // ==========================================
  const getStudentMotto = (student) =>
    student?.motto ||
    student?.quote ||
    student?.tagline ||
    "";

  // ==========================================
  // ALREADY INSERTED STUDENT IDS
  // ==========================================
  const insertedIds = useMemo(
    () =>
      new Set(
        insertedStudentIds.map((id) => String(id))
      ),
    [insertedStudentIds]
  );

  // ==========================================
  // UNIQUE PROGRAMS
  // ==========================================
  const programs = useMemo(() => {
    return [
      ...new Set(
        students
          .map((student) =>
            getStudentProgram(student)
          )
          .filter(Boolean)
      ),
    ].sort();
  }, [students]);

  // ==========================================
  // UNIQUE BATCHES
  // ==========================================
  const batches = useMemo(() => {
    return [
      ...new Set(
        students
          .map((student) =>
            getStudentBatch(student)
          )
          .filter(Boolean)
      ),
    ].sort();
  }, [students]);

  // ==========================================
  // FILTER STUDENTS
  // ==========================================
  const filteredStudents = useMemo(() => {
    const searchText = search
      .toLowerCase()
      .trim();

    return students.filter((student) => {
      const name = getStudentName(student);
      const nickname = getStudentNickname(student);
      const motto = getStudentMotto(student);
      const studentProgram =
        getStudentProgram(student);
      const studentBatch =
        getStudentBatch(student);

      const matchSearch =
        !searchText ||
        name
          .toLowerCase()
          .includes(searchText) ||
        nickname
          .toLowerCase()
          .includes(searchText) ||
        motto
          .toLowerCase()
          .includes(searchText) ||
        studentProgram
          .toLowerCase()
          .includes(searchText);

      const matchProgram =
        !program ||
        studentProgram === program;

      const matchBatch =
        !batch ||
        String(studentBatch) === String(batch);

      return (
        matchSearch &&
        matchProgram &&
        matchBatch
      );
    });
  }, [
    students,
    search,
    program,
    batch,
  ]);

  // ==========================================
  // ONLY STUDENTS THAT CAN STILL BE SELECTED
  // ==========================================
  const selectableStudents =
    filteredStudents.filter((student) => {
      const id = getStudentId(student);

      if (
        id === undefined ||
        id === null
      ) {
        return false;
      }

      return !insertedIds.has(String(id));
    });

  // ==========================================
  // SELECT ALL
  // ==========================================
  const allSelected =
    selectableStudents.length > 0 &&
    selectableStudents.every((student) =>
      selected.includes(
        String(getStudentId(student))
      )
    );

  const toggleSelectAll = () => {
    const selectableIds =
      selectableStudents.map((student) =>
        String(getStudentId(student))
      );

    if (!selectableIds.length) {
      return;
    }

    if (allSelected) {
      // Remove currently filtered students
      setSelected((prev) =>
        prev.filter(
          (id) =>
            !selectableIds.includes(
              String(id)
            )
        )
      );
    } else {
      // Add currently filtered students
      setSelected((prev) => [
        ...new Set([
          ...prev.map(String),
          ...selectableIds,
        ]),
      ]);
    }
  };

  // ==========================================
  // SELECT ONE STUDENT
  // ==========================================
  const toggleStudent = (id) => {
    const normalizedId = String(id);

    // Already inserted → cannot select again
    if (insertedIds.has(normalizedId)) {
      return;
    }

    setSelected((prev) =>
      prev.includes(normalizedId)
        ? prev.filter(
            (studentId) =>
              String(studentId) !==
              normalizedId
          )
        : [...prev, normalizedId]
    );
  };

  // ==========================================
  // INSERT SELECTED STUDENTS
  // ==========================================
  const handleInsert = async () => {
    const selectedStudents =
      students.filter((student) => {
        const id = getStudentId(student);

        if (
          id === undefined ||
          id === null
        ) {
          return false;
        }

        return (
          selected.includes(String(id)) &&
          !insertedIds.has(String(id))
        );
      });

    if (!selectedStudents.length) {
      console.warn(
        "⚠️ No students selected."
      );
      return;
    }

    console.log(
      "🟢 Students being inserted:",
      selectedStudents
    );

    // Show exactly what data is being passed
    selectedStudents.forEach((student) => {
      console.log(
        "👨‍🎓 Student:",
        getStudentName(student)
      );

      console.log(
        "🖼️ Photo:",
        getStudentPhoto(student)
      );

      console.log(
        "🏷️ Nickname:",
        getStudentNickname(student)
      );

      console.log(
        "💬 Motto:",
        getStudentMotto(student)
      );
    });

    try {
      await onInsert(selectedStudents);

      console.log(
        "✅ Successfully inserted students."
      );

      setSelected([]);

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error(
        "❌ Failed to insert students:",
        error
      );
    }
  };

  return (
    <div
      className="list-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="list-modal"
        onMouseDown={(e) =>
          e.stopPropagation()
        }
      >
        {/* ======================================
            HEADER
        ====================================== */}
        <div className="list-modal-header">
          <div>
            <h2>Students</h2>

            <p>
              Select students to add to your
              yearbook.
            </p>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* ======================================
            SEARCH + FILTER
        ====================================== */}
        <div className="faculty-controls">
          {/* SEARCH */}
          <input
            className="faculty-search"
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {/* PROGRAM */}
          <select
            className="faculty-filter"
            value={program}
            onChange={(e) =>
              setProgram(e.target.value)
            }
          >
            <option value="">
              All Programs
            </option>

            {programs.map((prog) => (
              <option
                key={prog}
                value={prog}
              >
                {prog}
              </option>
            ))}
          </select>

          {/* BATCH */}
          <select
            className="faculty-filter"
            value={batch}
            onChange={(e) =>
              setBatch(e.target.value)
            }
          >
            <option value="">
              All Batches
            </option>

            {batches.map((batchItem) => (
              <option
                key={batchItem}
                value={batchItem}
              >
                Batch {batchItem}
              </option>
            ))}
          </select>
        </div>

        {/* ======================================
            SELECT ALL
        ====================================== */}
        <div className="student-select-all">
          <label>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              disabled={
                selectableStudents.length === 0
              }
            />

            Select All
          </label>

          <span>
            {selected.length} selected
          </span>
        </div>

        {/* ======================================
            STUDENT LIST
        ====================================== */}
        <div className="student-list">
          {filteredStudents.map((student) => {
            const studentId =
              getStudentId(student);

            const normalizedId =
              String(studentId);

            const isAlreadyInserted =
              insertedIds.has(normalizedId);

            const isSelected =
              selected.includes(normalizedId);

            const photo =
              getStudentPhoto(student);

            const name =
              getStudentName(student);

            const nickname =
              getStudentNickname(student);

            const motto =
              getStudentMotto(student);

            const studentProgram =
              getStudentProgram(student);

            const studentBatch =
              getStudentBatch(student);

            return (
              <div
                key={studentId}
                className={`student-row ${
                  isSelected
                    ? "selected"
                    : ""
                } ${
                  isAlreadyInserted
                    ? "faculty-already-inserted"
                    : ""
                }`}
                onClick={() => {
                  if (!isAlreadyInserted) {
                    toggleStudent(studentId);
                  }
                }}
              >
                {/* ==================================
                    CHECKBOX
                ================================== */}
                <input
                  type="checkbox"
                  checked={
                    isAlreadyInserted ||
                    isSelected
                  }
                  disabled={
                    isAlreadyInserted
                  }
                  onChange={() =>
                    toggleStudent(
                      studentId
                    )
                  }
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                />

                {/* ==================================
                    PHOTO
                ================================== */}
                {photo ? (
                  <img
                    src={photo}
                    alt={name}
                    className="student-avatar"
                    onError={(e) => {
                      console.error(
                        "❌ Failed to load student photo:",
                        photo
                      );

                      e.currentTarget.style.display =
                        "none";

                      if (
                        e.currentTarget
                          .nextElementSibling
                      ) {
                        e.currentTarget.nextElementSibling.style.display =
                          "flex";
                      }
                    }}
                  />
                ) : null}

                {/* PHOTO PLACEHOLDER */}
                <div
                  className="student-avatar faculty-placeholder"
                  style={{
                    display: photo
                      ? "none"
                      : "flex",
                  }}
                >
                  👨‍🎓
                </div>

                {/* ==================================
                    STUDENT INFORMATION
                ================================== */}
                <div className="student-info">
                  <strong>
                    {name}
                  </strong>

                  {/* NICKNAME */}
                  {nickname && (
                    <small>
                      "{nickname}"
                    </small>
                  )}

                  {/* PROGRAM */}
                  <small>
                    {studentProgram ||
                      "No Program"}
                  </small>

                  {/* BATCH */}
                  {studentBatch && (
                    <small>
                      Batch{" "}
                      {studentBatch}
                    </small>
                  )}

                  {/* MOTTO */}
                  {motto && (
                    <span className="student-motto">
                      “{motto}”
                    </span>
                  )}
                </div>

                {/* ==================================
                    ALREADY ADDED LABEL
                ================================== */}
                {isAlreadyInserted && (
                  <span className="faculty-inserted-label">
                    Already Added
                  </span>
                )}

                {/* ==================================
                    SELECTED INDICATOR
                ================================== */}
                {!isAlreadyInserted &&
                  isSelected && (
                    <span className="student-selected-indicator">
                      ✓
                    </span>
                  )}
              </div>
            );
          })}

          {/* ======================================
              EMPTY STATE
          ====================================== */}
          {filteredStudents.length === 0 && (
            <div className="faculty-empty">
              No students found.
            </div>
          )}
        </div>

        {/* ======================================
            FOOTER
        ====================================== */}
        <div className="list-modal-footer">
          <button
            type="button"
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="insert-btn"
            disabled={!selected.length}
            onClick={handleInsert}
          >
            Insert Selected (
            {selected.length})
          </button>
        </div>
      </div>
    </div>
  );
}