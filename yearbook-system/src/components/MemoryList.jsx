import { useMemo, useState } from "react";
import "./MemoryList.css";

function MemoryList({
  memories,
  onInsert,
  onClose,
  insertedMemoryIds = [],
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [program, setProgram] = useState("all");

  /*
  =====================================================
  MEMORIES ALREADY INSERTED INTO CANVAS
  =====================================================
  */

  const insertedSet = useMemo(
    () =>
      new Set(
        insertedMemoryIds.map(String)
      ),
    [insertedMemoryIds]
  );

  /*
  =====================================================
  GET UNIQUE PROGRAMS
  =====================================================
  */

  const programs = useMemo(() => {
    const values = memories
      .map((item) => item.program)
      .filter(Boolean);

    return [
      "all",
      ...new Set(values),
    ];
  }, [memories]);

  /*
  =====================================================
  SEARCH + PROGRAM FILTER
  =====================================================
  */

  const filteredMemories = useMemo(() => {
    return memories.filter((item) => {
      const searchText =
        search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        item.full_name
          ?.toLowerCase()
          .includes(searchText) ||
        item.title
          ?.toLowerCase()
          .includes(searchText) ||
        item.message
          ?.toLowerCase()
          .includes(searchText);

      const matchesProgram =
        program === "all" ||
        item.program === program;

      return (
        matchesSearch &&
        matchesProgram
      );
    });
  }, [
    memories,
    search,
    program,
  ]);

  /*
  =====================================================
  SELECT / UNSELECT ONE MEMORY
  =====================================================
  */

  const toggleMemory = (id) => {
    const normalizedId =
      String(id);

    /*
    Already inserted?
    Do absolutely nothing.
    */

    if (
      insertedSet.has(
        normalizedId
      )
    ) {
      return;
    }

    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter(
            (selectedId) =>
              selectedId !== id
          )
        : [
            ...prev,
            id,
          ]
    );
  };

  /*
  =====================================================
  SELECT ALL
  =====================================================
  */

  const toggleSelectAll = () => {
    /*
    Only memories that are NOT
    already inserted can be selected.
    */

    const selectableMemories =
      filteredMemories.filter(
        (memory) =>
          !insertedSet.has(
            String(memory.id)
          )
      );

    const selectableIds =
      selectableMemories.map(
        (memory) =>
          memory.id
      );

    if (
      !selectableIds.length
    ) {
      return;
    }

    const allSelected =
      selectableIds.every(
        (id) =>
          selectedIds.includes(id)
      );

    if (allSelected) {
      setSelectedIds(
        (prev) =>
          prev.filter(
            (id) =>
              !selectableIds.includes(
                id
              )
          )
      );
    } else {
      setSelectedIds(
        (prev) => [
          ...new Set([
            ...prev,
            ...selectableIds,
          ]),
        ]
      );
    }
  };

  /*
  =====================================================
  ADD SELECTED
  =====================================================
  */

  const handleAddSelected =
    async () => {
      const selectedMemories =
        memories.filter(
          (memory) => {
            const id =
              String(memory.id);

            return (
              selectedIds.includes(
                memory.id
              ) &&
              !insertedSet.has(id)
            );
          }
        );

      if (
        !selectedMemories.length
      ) {
        return;
      }

      await onInsert(
        selectedMemories
      );

      setSelectedIds([]);

      onClose();
    };

  /*
  =====================================================
  SELECT ALL STATE
  =====================================================
  */

  const selectableFilteredMemories =
    filteredMemories.filter(
      (memory) =>
        !insertedSet.has(
          String(memory.id)
        )
    );

  const allFilteredSelected =
    selectableFilteredMemories.length >
      0 &&
    selectableFilteredMemories.every(
      (memory) =>
        selectedIds.includes(
          memory.id
        )
    );

  /*
  =====================================================
  RENDER
  =====================================================
  */

  return (
    <div
      className="memory-modal-overlay"
      onClick={onClose}
    >
      <div
        className="memory-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="memory-modal-header">
          <div>
            <h2>
              Student Memories
            </h2>

            <p>
              Select memories to add
              to your yearbook page.
            </p>
          </div>

          <button
            className="memory-modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* FILTER BAR */}

        <div className="memory-toolbar">

          {/* SEARCH */}

          <div className="memory-search">
            <span className="memory-search-icon">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search student or message..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

            {search && (
              <button
                className="memory-clear-search"
                onClick={() =>
                  setSearch("")
                }
              >
                ×
              </button>
            )}
          </div>

          {/* PROGRAM */}

          <div className="memory-filter">
            <select
              value={program}
              onChange={(e) =>
                setProgram(
                  e.target.value
                )
              }
            >
              <option value="all">
                All Programs
              </option>

              {programs
                .filter(
                  (item) =>
                    item !== "all"
                )
                .map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
            </select>
          </div>

          {/* SELECT ALL */}

          <button
            className={`memory-select-all ${
              allFilteredSelected
                ? "selected"
                : ""
            }`}
            onClick={
              toggleSelectAll
            }
          >
            <input
              type="checkbox"
              checked={
                allFilteredSelected
              }
              readOnly
            />

            {allFilteredSelected
              ? "Deselect All"
              : "Select All"}
          </button>

        </div>

        {/* RESULT INFO */}

        <div className="memory-selection-info">

          <span>
            {
              filteredMemories.length
            }{" "}
            {filteredMemories.length ===
            1
              ? "memory"
              : "memories"}{" "}
            found
          </span>

          <strong>
            {selectedIds.length}{" "}
            selected
          </strong>

        </div>

        {/* MEMORY LIST */}

        <div className="memory-items">

          {filteredMemories.length ===
            0 && (
            <div className="memory-empty">

              <div className="memory-empty-icon">
                📷
              </div>

              <strong>
                No memories found
              </strong>

              <span>
                Try another student
                name, message, or
                program.
              </span>

            </div>
          )}

          {filteredMemories.map(
            (memory) => {

              const isInserted =
                insertedSet.has(
                  String(
                    memory.id
                  )
                );

              const isSelected =
                selectedIds.includes(
                  memory.id
                );

              return (
                <div
                  className={`memory-item ${
                    isSelected
                      ? "selected"
                      : ""
                  } ${
                    isInserted
                      ? "already-inserted"
                      : ""
                  }`}
                  key={memory.id}
                  onClick={() =>
                    !isInserted &&
                    toggleMemory(
                      memory.id
                    )
                  }
                >

                  {/* CHECKBOX */}

                  <div className="memory-checkbox">

                    <input
                      type="checkbox"
                      checked={
                        isSelected
                      }
                      disabled={
                        isInserted
                      }
                      onChange={() =>
                        toggleMemory(
                          memory.id
                        )
                      }
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    />

                  </div>

                  {/* IMAGE */}

                  <div className="memory-item-image">

                    {memory.image ? (
                      <img
                        src={
                          memory.image
                        }
                        alt={
                          memory.full_name ||
                          "Student"
                        }
                      />
                    ) : (
                      <div className="memory-no-image">

                        <span>
                          📷
                        </span>

                        <small>
                          No photo
                        </small>

                      </div>
                    )}

                  </div>

                  {/* CONTENT */}

                  <div className="memory-item-info">

                    <div className="memory-student">

                      <strong>
                        {memory.full_name ||
                          "Unknown Student"}
                      </strong>

                      {memory.program && (
                        <span className="memory-program">
                          {
                            memory.program
                          }
                        </span>
                      )}

                    </div>

                    {memory.message ? (
                      <p className="memory-message">
                        "{memory.message}"
                      </p>
                    ) : (
                      <p className="memory-message memory-no-message">
                        No message
                        provided.
                      </p>
                    )}

                    {/* ALREADY INSERTED */}

                    {isInserted && (
                      <span className="memory-already-added">
                        Already added to
                        canvas
                      </span>
                    )}

                  </div>

                  {/* SELECTED INDICATOR */}

                  <div className="memory-selected-indicator">

                    {isInserted
                      ? "✓ Added"
                      : isSelected
                      ? "✓"
                      : ""}

                  </div>

                </div>
              );
            }
          )}

        </div>

        {/* FOOTER */}

        <div className="memory-modal-footer">

          <span>
            {selectedIds.length >
            0
              ? `${selectedIds.length} memory${
                  selectedIds.length >
                  1
                    ? "ies"
                    : ""
                } selected`
              : "No memories selected"}
          </span>

          <div className="memory-footer-actions">

            <button
              className="memory-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              className="memory-add-selected-btn"
              disabled={
                selectedIds.length ===
                0
              }
              onClick={
                handleAddSelected
              }
            >
              ＋ Add Selected
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}

export default MemoryList;