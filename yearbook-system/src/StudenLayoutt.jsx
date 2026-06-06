// StudentLayout.jsx

import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  FiHome,
  FiUser,
  FiImage,
  FiBookOpen,
  FiBell,
  FiLogOut,
  FiX,
} from "react-icons/fi";

import "./student.css";
import { FaGraduationCap } from "react-icons/fa";

function StudentLayout() {

  const navigate = useNavigate();

  // MODAL STATE
  const [showNotif, setShowNotif] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:5000/auth/logout", {
        withCredentials: true,
      });

      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="student-layout">

      {/* TOP NAVBAR */}
      <header className="student-navbar">

        {/* LEFT */}
        <div className="logo">
          <FaGraduationCap className="icon" />
          <h2>YearBook</h2>
        </div>

        {/* CENTER NAV */}
        <nav className="student-navlinks">

          <NavLink to="/student" end>
            <FiHome />
            Dashboard
          </NavLink>

          <NavLink to="/student/profile">
            <FiUser />
            Profile
          </NavLink>

          <NavLink to="/student/memories">
            <FiImage />
            Memories
          </NavLink>

          <NavLink to="/student/yearbook">
            <FiBookOpen />
            Yearbook
          </NavLink>

        </nav>

        {/* RIGHT */}
        <div className="student-actions">

          {/* NOTIFICATION BUTTON */}
          <button
            className="notif-btn"
            onClick={() => setShowNotif(true)}
          >
            <FiBell />
            <span className="notif-badge">3</span>
          </button>

          {/* LOGOUT */}
          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            <FiLogOut />
            Logout
          </button>

        </div>

      </header>

      {/* NOTIFICATION MODAL */}
      {showNotif && (
        <div
          className="notif-modal-overlay"
          onClick={() => setShowNotif(false)}
        >

          <div
            className="notif-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* HEADER */}
            <div className="notif-header">

              <h3>Notifications</h3>

              <button
                className="close-btn"
                onClick={() => setShowNotif(false)}
              >
                <FiX />
              </button>

            </div>

            {/* LIST */}
            <div className="notif-list">

              <div className="notif-item">
                <div className="notif-dot"></div>

                <div>
                  <h4>
                    New Memory Posted
                  </h4>

                  <p>
                    Maria shared a new photo
                    in Class of 2026.
                  </p>

                  <span>2 mins ago</span>
                </div>
              </div>

              <div className="notif-item">
                <div className="notif-dot"></div>

                <div>
                  <h4>
                    Yearbook Published
                  </h4>

                  <p>
                    The Class of 2026
                    yearbook is now available.
                  </p>

                  <span>1 hour ago</span>
                </div>
              </div>

              <div className="notif-item">
                <div className="notif-dot"></div>

                <div>
                  <h4>
                    Event Reminder
                  </h4>

                  <p>
                    Alumni Homecoming starts
                    tomorrow at 9:00 AM.
                  </p>

                  <span>Yesterday</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* PAGE CONTENT */}
      <main className="student-content">
        <Outlet />
      </main>

    </div>
  );
}

export default StudentLayout;