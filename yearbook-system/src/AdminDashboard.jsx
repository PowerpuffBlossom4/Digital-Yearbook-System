import "./admin.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  FiUsers,
  FiUserCheck,
  FiImage,
  FiHeart,
  FiArrowUpRight,
  FiCheckCircle,
  FiClock,
  FiBookOpen,
  FiPlus,
  FiActivity,
} from "react-icons/fi";

axios.defaults.withCredentials = true;

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalPhotos: 0,
    totalMemories: 0,
    pendingMemories: 0,
    draftYearbooks: 0,
    publishedYearbooks: 0,
  });

  const [loading, setLoading] = useState(true);

  const [progress, setProgress] = useState({
    studentProfiles: 0,
    studentPhotos: 0,
    memories: 0,
    design: 0,
  });

  const [currentYearbook, setCurrentYearbook] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
    fetchYearbookProgress();
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/activity",
        {
          withCredentials: true,
        }
      );

      setActivities(res.data.activities || []);
    } catch (error) {
      console.error("Failed to load recent activity:", error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:5000/api/admin/stats",
        {
          withCredentials: true,
        }
      );

      setStats((prev) => ({
        ...prev,
        ...res.data,
      }));
    } catch (error) {
      console.error(
        "Failed to load dashboard statistics:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchYearbookProgress = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/yearbook-progress",
        {
          withCredentials: true,
        }
      );

      setProgress(
        res.data.progress || {
          studentProfiles: 0,
          studentPhotos: 0,
          memories: 0,
          design: 0,
        }
      );

      setCurrentYearbook(res.data.yearbook);
    } catch (error) {
      console.error(
        "Failed to load yearbook progress:",
        error
      );
    }
  };

  const formatNumber = (number) => {
    return Number(number || 0).toLocaleString();
  };

  const statCards = [
    {
      label: "Total Students",
      value: stats.totalStudents,
      description: "Registered students",
      icon: <FiUsers />,
    },
    {
      label: "Faculty Members",
      value: stats.totalFaculty,
      description: "Faculty contributors",
      icon: <FiUserCheck />,
    },
    {
      label: "Uploaded Photos",
      value: stats.totalPhotos,
      description: "Yearbook media",
      icon: <FiImage />,
    },
    {
      label: "Total Memories",
      value: stats.totalMemories,
      description: "Student memories",
      icon: <FiHeart />,
    },
  ];

  const progressItems = [
    {
      label: "Student Profiles",
      value: progress.studentProfiles,
    },
    {
      label: "Student Photos",
      value: progress.studentPhotos,
    },
    {
      label: "Memories",
      value: progress.memories,
    },
    {
      label: "Yearbook Design",
      value: progress.design,
    },
  ];

  return (
    <div className="admin-dashboard">

      {/* =========================================
          HEADER
      ========================================== */}

      <header className="admin-header">
        <div className="header-content">

          <div className="header-left">
            <span className="header-label">
              ADMINISTRATION
            </span>

            <h1>
              Welcome back, Admin
            </h1>

            <p>
              Manage and monitor your ADSSU digital
              yearbook system.
            </p>
          </div>

        </div>
      </header>

      <main className="dashboard-content">

        {/* =========================================
            STATISTICS
        ========================================== */}

        <section className="dashboard-section">

          <div className="section-heading">
            <div>
              <span className="section-eyebrow">
                OVERVIEW
              </span>

              <h2>
                System Statistics
              </h2>
            </div>
          </div>

          <div className="stats-grid">

            {statCards.map((card) => (
              <div
                className="stat-card"
                key={card.label}
              >
                <div className="stat-icon">
                  {card.icon}
                </div>

                <div className="stat-info">
                  <span>
                    {card.label}
                  </span>

                  <h3>
                    {loading
                      ? "—"
                      : formatNumber(card.value)}
                  </h3>

                  <small>
                    {card.description}
                  </small>
                </div>

                <div className="stat-card-arrow">
                  <FiArrowUpRight />
                </div>
              </div>
            ))}

          </div>
        </section>

        {/* =========================================
            PROJECT + ATTENTION
        ========================================== */}

        <section className="dashboard-two-column">

          {/* YEARBOOK PROGRESS */}

          <div className="dashboard-panel">

            <div className="panel-header">

              <div>
                <span className="panel-eyebrow">
                  CURRENT PROJECT
                </span>

                <h3>
                  Yearbook Progress
                </h3>
              </div>

              <span className="academic-badge">
                AY{" "}
                {currentYearbook?.academic_year || "2026"}
              </span>

            </div>

            <div className="yearbook-title">

              <strong>
                {currentYearbook?.title ||
                  "No Active Yearbook"}
              </strong>

              <span>
                {currentYearbook?.batch_name
                  ? `${currentYearbook.batch_name} • AY ${
                      currentYearbook.academic_year || "—"
                    }`
                  : "Digital Yearbook Project"}
              </span>

            </div>

            <div className="progress-list">

              {progressItems.map((item) => (
                <div
                  className="progress-item"
                  key={item.label}
                >
                  <div className="progress-label">

                    <span>
                      {item.label}
                    </span>

                    <strong>
                      {item.value}%
                    </strong>

                  </div>

                  <div className="progress-track">

                    <div
                      className="progress-fill"
                      style={{
                        width: `${item.value}%`,
                      }}
                    />

                  </div>
                </div>
              ))}

            </div>

            <button
              className="panel-action"
              type="button"
              onClick={() =>
                navigate("/admin/yearbooks")
              }
            >
              View Yearbooks
              <FiArrowUpRight />
            </button>

          </div>

          {/* NEEDS ATTENTION */}

          <div className="dashboard-panel attention-panel">

            <div className="panel-header">

              <div>
                <span className="panel-eyebrow">
                  ADMIN ACTIONS
                </span>

                <h3>
                  Needs Attention
                </h3>
              </div>

              <FiActivity className="panel-header-icon" />

            </div>

            <div className="attention-list">

              <div className="attention-item">

                <div className="attention-icon warning">
                  <FiClock />
                </div>

                <div className="attention-content">
                  <strong>
                    {formatNumber(
                      stats.pendingMemories
                    )}
                  </strong>

                  <span>
                    Pending Memories
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/admin/memories")
                  }
                >
                  Review
                </button>

              </div>

              <div className="attention-item">

                <div className="attention-icon draft">
                  <FiBookOpen />
                </div>

                <div className="attention-content">
                  <strong>
                    {formatNumber(
                      stats.draftYearbooks
                    )}
                  </strong>

                  <span>
                    Draft Yearbooks
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/admin/yearbooks")
                  }
                >
                  View
                </button>

              </div>

              <div className="attention-item">

                <div className="attention-icon published">
                  <FiCheckCircle />
                </div>

                <div className="attention-content">
                  <strong>
                    {formatNumber(
                      stats.publishedYearbooks
                    )}
                  </strong>

                  <span>
                    Published Yearbooks
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/admin/yearbooks")
                  }
                >
                  View
                </button>

              </div>

            </div>

          </div>

        </section>

        {/* =========================================
            QUICK ACTIONS
        ========================================== */}

        <section className="dashboard-section">

          <div className="section-heading compact-heading">

            <div>
              <span className="section-eyebrow">
                SHORTCUTS
              </span>

              <h2>
                Quick Actions
              </h2>
            </div>

          </div>

          <div className="quick-actions">

            <button
              className="quick-action"
              type="button"
              onClick={() =>
                navigate("/admin/users")
              }
            >
              <div className="quick-action-icon">
                <FiPlus />
              </div>

              <div className="quick-action-content">
                <strong>
                  Add Student
                </strong>

                <span>
                  Register a new student
                </span>
              </div>

              <FiArrowUpRight className="quick-action-arrow" />
            </button>

            <button
              className="quick-action"
              type="button"
              onClick={() =>
                navigate("/admin/users")
              }
            >
              <div className="quick-action-icon">
                <FiPlus />
              </div>

              <div className="quick-action-content">
                <strong>
                  Add Faculty
                </strong>

                <span>
                  Add faculty information
                </span>
              </div>

              <FiArrowUpRight className="quick-action-arrow" />
            </button>

            <button
              className="quick-action"
              type="button"
              onClick={() =>
                navigate("/admin/design")
              }
            >
              <div className="quick-action-icon">
                <FiBookOpen />
              </div>

              <div className="quick-action-content">
                <strong>
                  Create Yearbook
                </strong>

                <span>
                  Start a new yearbook
                </span>
              </div>

              <FiArrowUpRight className="quick-action-arrow" />
            </button>

          </div>

        </section>

        {/* =========================================
            RECENT ACTIVITY
        ========================================== */}

        <section className="dashboard-section recent-activity-section">

          <div className="section-heading compact-heading">

            <div>
              <span className="section-eyebrow">
                SYSTEM UPDATES
              </span>

              <h2>
                Recent Activity
              </h2>
            </div>

            <span className="activity-count">
              {activities.length} recent
            </span>

          </div>

          <div className="dashboard-panel recent-activity-panel">

            {activities.length === 0 ? (

              <div className="empty-activity">

                <div className="empty-activity-icon">
                  <FiActivity />
                </div>

                <strong>
                  No recent activity
                </strong>

                <span>
                  System activity will appear here.
                </span>

              </div>

            ) : (

              <div className="activity-list">

                {activities.slice(0, 5).map(
                  (activity, index) => (

                    <div
                      className="activity-item"
                      key={
                        activity.id ||
                        `${activity.created_at}-${index}`
                      }
                    >

                      <div
                        className={`activity-marker activity-${
                          activity.type || "default"
                        }`}
                      >
                        {activity.type === "memory"
                          ? <FiHeart />
                          : activity.type === "yearbook"
                          ? <FiBookOpen />
                          : activity.type === "photo"
                          ? <FiImage />
                          : <FiActivity />}
                      </div>

                      <div className="activity-content">

                        <strong>
                          {activity.title ||
                            "System Activity"}
                        </strong>

                        <span>
                          {activity.description ||
                            "An activity occurred in the system."}
                        </span>

                      </div>

                      <time>
                        {activity.created_at
                          ? new Date(
                              activity.created_at
                            ).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "—"}
                      </time>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </section>

      </main>
    </div>
  );
}

export default AdminDashboard;