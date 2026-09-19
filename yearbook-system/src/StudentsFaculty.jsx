import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  FiUsers,
  FiUserCheck,
  FiSearch,
  FiFilter,
  FiMail,
  FiChevronDown,
} from "react-icons/fi";

import "./studentsFaculty.css";

axios.defaults.withCredentials = true;

function StudentsFaculty() {
  const [people, setPeople] = useState([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:5000/api/admin/users",
        {
          withCredentials: true,
        }
      );

      console.log("Users:", res.data);

      setPeople(res.data);
    } catch (err) {
      console.error(
        "Failed to fetch users:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return people.filter((person) => {
      const searchValue = search.toLowerCase().trim();

      const matchSearch =
        person.full_name
          ?.toLowerCase()
          .includes(searchValue) ||
        person.email
          ?.toLowerCase()
          .includes(searchValue) ||
        person.department_program
          ?.toLowerCase()
          .includes(searchValue);

      const matchRole =
        filterRole === "All"
          ? true
          : person.role?.toLowerCase() ===
            filterRole.toLowerCase();

      return matchSearch && matchRole;
    });
  }, [people, search, filterRole]);

  const studentCount = people.filter(
    (person) =>
      person.role?.toLowerCase() === "student"
  ).length;

  const facultyCount = people.filter(
    (person) =>
      person.role?.toLowerCase() === "faculty"
  ).length;

  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const getProfileImage = (profilePic) => {
    if (!profilePic) return null;

    if (
      profilePic.startsWith("http://") ||
      profilePic.startsWith("https://")
    ) {
      return profilePic;
    }

    return `http://localhost:5000${
      profilePic.startsWith("/")
        ? profilePic
        : `/${profilePic}`
    }`;
  };

  return (
    <div className="sf-container">

      {/* =========================================
          PAGE HEADER
      ========================================== */}

      <header className="sf-header">

        <div className="sf-header-left">

          <div className="sf-header-icon">
            <FiUsers />
          </div>

          <div>
            <span className="sf-eyebrow">
              USER MANAGEMENT
            </span>

            <h1>
              Students & Faculty
            </h1>

            <p>
              Manage everyone featured in the
              ADSSU digital yearbook.
            </p>
          </div>

        </div>

        <div className="sf-header-count">

          <strong>
            {people.length}
          </strong>

          <span>
            Total Users
          </span>

        </div>

      </header>

      {/* =========================================
          SUMMARY
      ========================================== */}

      <section className="sf-summary">

        <div className="sf-summary-card">

          <div className="sf-summary-icon students">
            <FiUsers />
          </div>

          <div>
            <span>
              Students
            </span>

            <strong>
              {studentCount.toLocaleString()}
            </strong>
          </div>

        </div>

        <div className="sf-summary-card">

          <div className="sf-summary-icon faculty">
            <FiUserCheck />
          </div>

          <div>
            <span>
              Faculty
            </span>

            <strong>
              {facultyCount.toLocaleString()}
            </strong>
          </div>

        </div>

        <div className="sf-summary-card">

          <div className="sf-summary-icon total">
            <FiUsers />
          </div>

          <div>
            <span>
              All Users
            </span>

            <strong>
              {people.length.toLocaleString()}
            </strong>
          </div>

        </div>

      </section>

      {/* =========================================
          SEARCH + FILTER
      ========================================== */}

      <section className="sf-toolbar">

        <div className="sf-search">

          <FiSearch />

          <input
            type="text"
            placeholder="Search name, email, or program..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              type="button"
              className="sf-clear"
              onClick={() => setSearch("")}
            >
              ×
            </button>
          )}

        </div>

        <div className="sf-filter">

          <FiFilter />

          <select
            value={filterRole}
            onChange={(e) =>
              setFilterRole(e.target.value)
            }
          >
            <option value="All">
              All Roles
            </option>

            <option value="Student">
              Students
            </option>

            <option value="Faculty">
              Faculty
            </option>
          </select>

          <FiChevronDown
            className="sf-filter-arrow"
          />

        </div>

        <div className="sf-result-count">

          <strong>
            {filtered.length}
          </strong>

          <span>
            {filtered.length === 1
              ? "user"
              : "users"}{" "}
            found
          </span>

        </div>

      </section>

      {/* =========================================
          USER TABLE
      ========================================== */}

      <section className="sf-table-card">

        <div className="sf-table-header">

          <div>
            <span className="sf-table-eyebrow">
              DIRECTORY
            </span>

            <h2>
              User Directory
            </h2>
          </div>

          <span className="sf-table-total">
            {filtered.length} records
          </span>

        </div>

        <div className="sf-table-wrapper">

          <table className="sf-table">

            <thead>
              <tr>
                <th>
                  NAME
                </th>

                <th>
                  EMAIL
                </th>

                <th>
                  DEPARTMENT / PROGRAM
                </th>

                <th>
                  ROLE
                </th>
              </tr>
            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan="4"
                    className="sf-loading"
                  >
                    <div className="loading-spinner" />
                    <span>
                      Loading users...
                    </span>
                  </td>
                </tr>

              ) : filtered.length > 0 ? (

                filtered.map((person) => {

                  const imageUrl =
                    getProfileImage(
                      person.profile_pic
                    );

                  const role =
                    person.role?.toLowerCase();

                  return (
                    <tr key={person.id}>

                      {/* NAME */}

                      <td className="name-cell">

                        <div className="sf-user">

                          <div className="sf-avatar">

                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={
                                  person.full_name ||
                                  "User"
                                }
                                onError={(e) => {
                                  e.currentTarget.style.display =
                                    "none";

                                  const fallback =
                                    e.currentTarget
                                      .parentElement
                                      .querySelector(
                                        ".sf-avatar-fallback"
                                      );

                                  if (fallback) {
                                    fallback.style.display =
                                      "flex";
                                  }
                                }}
                              />
                            ) : null}

                            <div
                              className="sf-avatar-fallback"
                              style={{
                                display: imageUrl
                                  ? "none"
                                  : "flex",
                              }}
                            >
                              {getInitials(
                                person.full_name
                              )}
                            </div>

                          </div>

                          <div className="sf-name">

                            <strong>
                              {person.full_name ||
                                "Unnamed User"}
                            </strong>

                            <span>
                              {role === "faculty"
                                ? "Faculty Member"
                                : "Student"}
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* EMAIL */}

                      <td>

                        <div className="sf-email">

                          <FiMail />

                          <span>
                            {person.email ||
                              "—"}
                          </span>

                        </div>

                      </td>

                      {/* DEPARTMENT */}

                      <td>

                        <span className="sf-department">
                          {person.department_program ||
                            "Not specified"}
                        </span>

                      </td>

                      {/* ROLE */}

                      <td>

                        <span
                          className={`sf-role ${
                            role || "unknown"
                          }`}
                        >

                          <span className="sf-role-dot" />

                          {person.role
                            ? person.role
                                .charAt(0)
                                .toUpperCase() +
                              person.role.slice(1)
                            : "Unknown"}

                        </span>

                      </td>

                    </tr>
                  );
                })

              ) : (

                <tr>

                  <td
                    colSpan="4"
                    className="sf-empty"
                  >

                    <div className="sf-empty-icon">
                      <FiUsers />
                    </div>

                    <strong>
                      No users found
                    </strong>

                    <span>
                      Try changing your search
                      or filter.
                    </span>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}

export default StudentsFaculty;