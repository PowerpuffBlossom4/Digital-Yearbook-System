import { useState, useMemo } from "react";
import "./FacultyList.css";

export default function FacultyList({
  faculty = [],
  onInsert,
  onClose,
  insertedFacultyIds = [],
}) {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [selected, setSelected] = useState([]);

  // ==========================================
  // ALREADY INSERTED FACULTY IDS
  // ==========================================
  const insertedIds = useMemo(
    () => new Set(insertedFacultyIds),
    [insertedFacultyIds]
  );

  // ==========================================
  // UNIQUE DEPARTMENTS
  // ==========================================
  const departments = useMemo(() => {
    return [
      ...new Set(
        faculty
          .map((f) => f.department_program)
          .filter(Boolean)
      ),
    ].sort();
  }, [faculty]);

  // ==========================================
  // UNIQUE POSITIONS
  // ==========================================
  const positions = useMemo(() => {
    return [
      ...new Set(
        faculty
          .map((f) => f.position)
          .filter(Boolean)
      ),
    ].sort();
  }, [faculty]);

  // ==========================================
  // FILTER FACULTY
  // ==========================================
  const filteredFaculty = useMemo(() => {
    return faculty.filter((member) => {
      const name = member.name || "";
      const memberPosition = member.position || "";
      const memberDepartment =
        member.department_program || "";

      // Search by name
      const matchSearch = name
        .toLowerCase()
        .includes(search.toLowerCase());

      // Department filter
      const matchDepartment =
        !department ||
        memberDepartment === department;

      // Position filter
      const matchPosition =
        !position ||
        memberPosition === position;

      return (
        matchSearch &&
        matchDepartment &&
        matchPosition
      );
    });
  }, [
    faculty,
    search,
    department,
    position,
  ]);

  // ==========================================
  // ONLY FACULTY THAT CAN STILL BE SELECTED
  // ==========================================
  const selectableFaculty = filteredFaculty.filter(
    (member) => !insertedIds.has(member.id)
  );

  // ==========================================
  // SELECT ALL
  // ==========================================
  const allSelected =
    selectableFaculty.length > 0 &&
    selectableFaculty.every((f) =>
      selected.includes(f.id)
    );

  const toggleSelectAll = () => {
    if (allSelected) {
      // Remove all currently filtered faculty
      setSelected((prev) =>
        prev.filter(
          (id) =>
            !selectableFaculty.some(
              (f) => f.id === id
            )
        )
      );
    } else {
      // Add all currently filtered faculty
      setSelected((prev) => [
        ...new Set([
          ...prev,
          ...selectableFaculty.map(
            (f) => f.id
          ),
        ]),
      ]);
    }
  };

  // ==========================================
  // SELECT ONE FACULTY
  // ==========================================
  const toggleFaculty = (id) => {
    // Already inserted → cannot select again
    if (insertedIds.has(id)) {
      return;
    }

    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  // ==========================================
  // INSERT SELECTED
  // ==========================================

const handleInsert = () => {
  const selectedFaculty = faculty.filter(
    (f) =>
      selected.includes(f.id) &&
      !insertedIds.has(f.id)
  );

  if (!selectedFaculty.length) return;

  onInsert(
    selectedFaculty.map((f) => ({
      id: f.id,
      name: f.name || "",
      photo: f.photo || "",
      position: f.position || "",
      department_program: f.department_program || "",
      message: f.message || "",
    }))
  );

  setSelected([]);
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
            <h2>Faculty</h2>

            <p>
              Select faculty members to add
              to your yearbook.
            </p>
          </div>

          <button
            className="modal-close-btn"
            onClick={onClose}
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
            placeholder="Search faculty..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {/* DEPARTMENT */}
          <select
            className="faculty-filter"
            value={department}
            onChange={(e) =>
              setDepartment(e.target.value)
            }
          >
            <option value="">
              All Departments
            </option>

            {departments.map((dept) => (
              <option
                key={dept}
                value={dept}
              >
                {dept}
              </option>
            ))}
          </select>

          {/* POSITION */}
          <select
            className="faculty-filter"
            value={position}
            onChange={(e) =>
              setPosition(e.target.value)
            }
          >
            <option value="">
              All Positions
            </option>

            {positions.map((pos) => (
              <option
                key={pos}
                value={pos}
              >
                {pos}
              </option>
            ))}
          </select>
        </div>

        {/* ======================================
            ACTIVE FILTER INFORMATION
        ====================================== */}
        {(department || position || search) && (
          <div className="faculty-filter-status">
            <span>
              Showing{" "}
              <strong>
                {filteredFaculty.length}
              </strong>{" "}
              faculty
            </span>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setDepartment("");
                setPosition("");
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

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
                selectableFaculty.length === 0
              }
            />

            Select All
          </label>

          <span>
            {selected.length} selected
          </span>
        </div>

        {/* ======================================
            FACULTY LIST
        ====================================== */}
        <div className="student-list">

          {filteredFaculty.map((member) => {
            const isAlreadyInserted =
              insertedIds.has(member.id);

            const isSelected =
              selected.includes(member.id);

            return (
              <div
                key={member.id}
                className={`student-row ${
                  isAlreadyInserted
                    ? "faculty-already-inserted"
                    : ""
                } ${
                  isSelected
                    ? "faculty-selected"
                    : ""
                }`}
              >
                {/* CHECKBOX */}
                <input
                  type="checkbox"
                  checked={
                    isAlreadyInserted ||
                    isSelected
                  }
                  disabled={isAlreadyInserted}
                  onChange={() =>
                    toggleFaculty(member.id)
                  }
                />

                {/* PHOTO */}
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt={member.name || "Faculty"}
                    className="student-avatar"
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";

                      e.currentTarget.nextElementSibling.style.display =
                        "flex";
                    }}
                  />
                ) : null}

                {/* PHOTO PLACEHOLDER */}
                <div
                  className="student-avatar faculty-placeholder"
                  style={{
                    display: member.photo
                      ? "none"
                      : "flex",
                  }}
                >
                  👨‍🏫
                </div>

                {/* INFORMATION */}
                <div className="student-info">
                  <strong>
                    {member.name ||
                      "Unnamed Faculty"}
                  </strong>

                  {/* POSITION */}
                  <small className="faculty-position">
                    {member.position ||
                      "Faculty"}
                  </small>

                  {/* DEPARTMENT */}
                  <small>
                    {member.department_program ||
                      "No Department"}
                  </small>
                </div>

                {/* ALREADY ADDED */}
                {isAlreadyInserted && (
                  <span className="faculty-inserted-label">
                    Already Added
                  </span>
                )}
              </div>
            );
          })}

          {/* EMPTY */}
          {filteredFaculty.length === 0 && (
            <div className="faculty-empty">
              <div className="faculty-empty-icon">
                👨‍🏫
              </div>

              <strong>
                No faculty found
              </strong>

              <span>
                Try changing your search or
                filters.
              </span>
            </div>
          )}
        </div>

        {/* ======================================
            FOOTER
        ====================================== */}
        <div className="list-modal-footer">
          <button
            className="cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="insert-btn"
            disabled={!selected.length}
            onClick={handleInsert}
          >
            Insert Selected ({selected.length})
          </button>
        </div>
      </div>
    </div>
  );
}

