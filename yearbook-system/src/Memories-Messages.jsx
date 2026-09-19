import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

import {
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiMessageSquare,
  FiUsers,
  FiImage,
  FiCheck,
  FiX,
  FiShield,
} from "react-icons/fi";

import "./mm.css";

axios.defaults.withCredentials = true;

function Memories() {
  const [activeTab, setActiveTab] = useState("students");
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  /* =====================================================
     FETCH MEMORIES
  ===================================================== */

  const fetchMemories = useCallback(async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:5000/api/admin/memories",
        {
          withCredentials: true,
        }
      );

      setMemories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch memories error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  /* =====================================================
     APPROVE
  ===================================================== */

  const approveMemory = async (id) => {
    try {
      setProcessingId(id);

      await axios.put(
        `http://localhost:5000/api/memories/${id}/approve`,
        {},
        {
          withCredentials: true,
        }
      );

      await fetchMemories();
    } catch (err) {
      console.error("Approve error:", err);

      alert(
        err.response?.data?.message ||
          "Failed to approve memory."
      );
    } finally {
      setProcessingId(null);
    }
  };

  /* =====================================================
     REJECT
  ===================================================== */

  const rejectMemory = async (id) => {
    try {
      setProcessingId(id);

      await axios.put(
        `http://localhost:5000/api/memories/${id}/reject`,
        {},
        {
          withCredentials: true,
        }
      );

      await fetchMemories();
    } catch (err) {
      console.error("Reject error:", err);

      alert(
        err.response?.data?.message ||
          "Failed to reject memory."
      );
    } finally {
      setProcessingId(null);
    }
  };

  /* =====================================================
     STATISTICS
  ===================================================== */

  const stats = useMemo(() => {
    return {
      total: memories.length,

      pending: memories.filter(
        (item) => item.status === "pending"
      ).length,

      approved: memories.filter(
        (item) => item.status === "approved"
      ).length,

      rejected: memories.filter(
        (item) => item.status === "rejected"
      ).length,
    };
  }, [memories]);

  /* =====================================================
     STUDENT COUNT
  ===================================================== */

  const studentCount = useMemo(() => {
    return memories.filter((item) => {
      const type = String(
        item.type ||
          item.category ||
          item.role ||
          ""
      ).toLowerCase();

      return (
        type === "student" ||
        type === "students" ||
        !type
      );
    }).length;
  }, [memories]);

  /* =====================================================
     FACULTY COUNT
  ===================================================== */

  const facultyCount = useMemo(() => {
    return memories.filter((item) => {
      const type = String(
        item.type ||
          item.category ||
          item.role ||
          ""
      ).toLowerCase();

      return (
        type === "faculty" ||
        type === "faculty message" ||
        type === "faculty_messages"
      );
    }).length;
  }, [memories]);

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredMemories = useMemo(() => {
    return memories.filter((item) => {
      const type = String(
        item.type ||
          item.category ||
          item.role ||
          ""
      ).toLowerCase();

      if (activeTab === "students") {
        return (
          type === "student" ||
          type === "students" ||
          !type
        );
      }

      return (
        type === "faculty" ||
        type === "faculty message" ||
        type === "faculty_messages"
      );
    });
  }, [memories, activeTab]);

  /* =====================================================
     STATUS CLASS
  ===================================================== */

  const getStatusClass = (status) => {
    if (status === "approved") {
      return "adssu-mm-status-approved";
    }

    if (status === "rejected") {
      return "adssu-mm-status-rejected";
    }

    return "adssu-mm-status-pending";
  };

  /* =====================================================
     STATUS ICON
  ===================================================== */

  const getStatusIcon = (status) => {
    if (status === "approved") {
      return <FiCheckCircle />;
    }

    if (status === "rejected") {
      return <FiXCircle />;
    }

    return <FiClock />;
  };

  /* =====================================================
     GET INITIALS
  ===================================================== */

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

  /* =====================================================
     PROFILE IMAGE
  ===================================================== */

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
    <div className="adssu-mm-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="adssu-mm-header">

        <div className="adssu-mm-header-left">

          <div className="adssu-mm-header-icon">
            <FiShield />
          </div>

          <div className="adssu-mm-header-content">

            <span className="adssu-mm-eyebrow">
              CONTENT MODERATION
            </span>

            <h1>
              Memories & Messages
            </h1>

            <p>
              Review and manage submissions before
              they appear in the digital yearbook.
            </p>

          </div>

        </div>

        <div className="adssu-mm-moderation-status">
          <span className="adssu-mm-status-dot" />

          <span>
            Moderation Center
          </span>
        </div>

      </header>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <section className="adssu-mm-stats">

        <div className="adssu-mm-stat-card">

          <div className="adssu-mm-stat-icon adssu-mm-stat-total">
            <FiMessageSquare />
          </div>

          <div className="adssu-mm-stat-info">
            <span>
              Total Submissions
            </span>

            <strong>
              {stats.total}
            </strong>
          </div>

        </div>

        <div className="adssu-mm-stat-card">

          <div className="adssu-mm-stat-icon adssu-mm-stat-pending">
            <FiClock />
          </div>

          <div className="adssu-mm-stat-info">
            <span>
              Pending Review
            </span>

            <strong>
              {stats.pending}
            </strong>
          </div>

        </div>

        <div className="adssu-mm-stat-card">

          <div className="adssu-mm-stat-icon adssu-mm-stat-approved">
            <FiCheckCircle />
          </div>

          <div className="adssu-mm-stat-info">
            <span>
              Approved
            </span>

            <strong>
              {stats.approved}
            </strong>
          </div>

        </div>

        <div className="adssu-mm-stat-card">

          <div className="adssu-mm-stat-icon adssu-mm-stat-rejected">
            <FiXCircle />
          </div>

          <div className="adssu-mm-stat-info">
            <span>
              Rejected
            </span>

            <strong>
              {stats.rejected}
            </strong>
          </div>

        </div>

      </section>

      {/* =================================================
          REVIEW HEADER + TABS
      ================================================= */}

      <section className="adssu-mm-review-header">

        <div className="adssu-mm-review-title">

          <span className="adssu-mm-section-eyebrow">
            SUBMISSIONS
          </span>

          <h2>
            Review Center
          </h2>

          <p>
            Review submitted memories and faculty
            messages before publication.
          </p>

        </div>

        <div className="adssu-mm-tabs">

          <button
            type="button"
            className={`adssu-mm-tab ${
              activeTab === "students"
                ? "adssu-mm-tab-active"
                : ""
            }`}
            onClick={() => setActiveTab("students")}
          >
            <FiUsers />

            <span>
              Student Memories
            </span>

            <b>
              {studentCount}
            </b>
          </button>

          <button
            type="button"
            className={`adssu-mm-tab ${
              activeTab === "faculty"
                ? "adssu-mm-tab-active"
                : ""
            }`}
            onClick={() => setActiveTab("faculty")}
          >
            <FiMessageSquare />

            <span>
              Faculty Messages
            </span>

            <b>
              {facultyCount}
            </b>
          </button>

        </div>

      </section>

      {/* =================================================
          CONTENT
      ================================================= */}

      {loading ? (

        <div className="adssu-mm-empty">

          <div className="adssu-mm-loading-spinner" />

          <h3>
            Loading submissions...
          </h3>

          <p>
            Please wait while we retrieve the memories.
          </p>

        </div>

      ) : filteredMemories.length === 0 ? (

        <div className="adssu-mm-empty">

          <div className="adssu-mm-empty-icon">
            <FiMessageSquare />
          </div>

          <h3>
            No submissions found
          </h3>

          <p>
            There are currently no{" "}
            {activeTab === "students"
              ? "student memories"
              : "faculty messages"}{" "}
            to display.
          </p>

        </div>

      ) : (

        <div className="adssu-mm-list">

          {filteredMemories.map((item) => {

            const profileImage =
              getProfileImage(item.profile_pic);

            return (

              <article
                className="adssu-mm-card"
                key={item.id}
              >

                {/* =========================================
                    STUDENT PHOTO
                ========================================== */}

                {activeTab === "students" &&
                  item.image && (

                    <div className="adssu-mm-image-wrapper">

                      <img
                        src={item.image}
                        alt={`${item.full_name || "User"} memory`}
                        className="adssu-mm-image"
                      />

                      <div className="adssu-mm-image-label">
                        <FiImage />
                        Student Photo
                      </div>

                    </div>

                  )}

                {/* =========================================
                    CARD CONTENT
                ========================================== */}

                <div className="adssu-mm-card-content">

                  {/* TOP */}

                  <div className="adssu-mm-card-top">

                    <div className="adssu-mm-author">

                      <div className="adssu-mm-avatar">

                        {profileImage ? (

                          <img
                            src={profileImage}
                            alt={
                              item.full_name ||
                              "User"
                            }
                            onError={(e) => {
                              e.currentTarget.style.display =
                                "none";

                              const fallback =
                                e.currentTarget
                                  .parentElement
                                  .querySelector(
                                    ".adssu-mm-avatar-fallback"
                                  );

                              if (fallback) {
                                fallback.style.display =
                                  "flex";
                              }
                            }}
                          />

                        ) : null}

                        <div
                          className="adssu-mm-avatar-fallback"
                          style={{
                            display:
                              profileImage
                                ? "none"
                                : "flex",
                          }}
                        >
                          {getInitials(
                            item.full_name
                          )}
                        </div>

                      </div>

                      <div className="adssu-mm-author-info">

                        <h3>
                          {item.full_name ||
                            "Unknown User"}
                        </h3>

                        <div className="adssu-mm-author-meta">

                          <span className="adssu-mm-author-role">
                            {item.role === "faculty"
                              ? "Faculty"
                              : "Student"}
                          </span>

                          {item.department_program && (
                            <>
                              <span className="adssu-mm-meta-dot">
                                •
                              </span>

                              <span className="adssu-mm-author-department">
                                {item.department_program}
                              </span>
                            </>
                          )}

                        </div>

                      </div>

                    </div>

                    {/* STATUS */}

                    <div
                      className={`adssu-mm-status-badge ${getStatusClass(
                        item.status
                      )}`}
                    >
                      {getStatusIcon(item.status)}

                      <span>
                        {item.status || "pending"}
                      </span>
                    </div>

                  </div>

                  {/* MESSAGE */}

                  <div
                    className={`adssu-mm-message-box ${
                      activeTab === "faculty"
                        ? "adssu-mm-faculty-message"
                        : ""
                    }`}
                  >

                    <div className="adssu-mm-message-icon">
                      <FiMessageSquare />
                    </div>

                    <p>
                      “
                      {item.message ||
                        "No message provided."}
                      ”
                    </p>

                  </div>

                  {/* FOOTER */}

                  <div className="adssu-mm-card-footer">

                    <span className="adssu-mm-submission-label">
                      Submission #{item.id}
                    </span>

                    {item.status === "pending" && (

                      <div className="adssu-mm-actions">

                        <button
                          type="button"
                          className="adssu-mm-approve-btn"
                          onClick={() =>
                            approveMemory(item.id)
                          }
                          disabled={
                            processingId === item.id
                          }
                        >
                          <FiCheck />

                          {processingId === item.id
                            ? "Processing..."
                            : "Approve"}
                        </button>

                        <button
                          type="button"
                          className="adssu-mm-reject-btn"
                          onClick={() =>
                            rejectMemory(item.id)
                          }
                          disabled={
                            processingId === item.id
                          }
                        >
                          <FiX />

                          Reject
                        </button>

                      </div>

                    )}

                  </div>

                </div>

              </article>

            );
          })}

        </div>

      )}

    </div>
  );
}

export default Memories;