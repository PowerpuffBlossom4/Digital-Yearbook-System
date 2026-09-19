import { useRef, useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import useAuth from "./hooks/useAuth";
import { io } from "socket.io-client";
import adssuLogo from "./assets/adssu-logo.png";

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

function StudentLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const socketRef = useRef(null);
  const mountedRef = useRef(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  // =========================================================
  // API URL
  // =========================================================

  const API_URL =
    process.env.REACT_APP_API_URL ||
    "http://localhost:5000";

  // =========================================================
  // NAVIGATE HOME
  // =========================================================

  const handleLogoClick = () => {
    navigate("/student");
  };

  // =========================================================
  // CALCULATE UNREAD COUNT
  // =========================================================

  const calculateUnreadCount = (items) => {
    if (!Array.isArray(items)) {
      return 0;
    }

    return items.filter(
      (item) => Number(item.is_read) === 0
    ).length;
  };

  // =========================================================
  // FETCH NOTIFICATIONS
  // =========================================================

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/notifications`,
        {
          withCredentials: true,
        }
      );

      console.log(
        "🔔 Notifications loaded:",
        res.data
      );

      if (!mountedRef.current) {
        return;
      }

      const notificationList = Array.isArray(res.data)
        ? res.data
        : [];

      // Newest first
      const sortedNotifications = [...notificationList].sort(
        (a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();

          return dateB - dateA;
        }
      );

      setNotifications(sortedNotifications);

      setUnreadCount(
        calculateUnreadCount(sortedNotifications)
      );
    } catch (err) {
      console.error(
        "❌ Failed to load notifications:",
        err
      );
    }
  };

  // =========================================================
  // FETCH UNREAD COUNT
  // =========================================================

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/notifications/unread-count`,
        {
          withCredentials: true,
        }
      );

      console.log(
        "🔴 Unread count:",
        res.data.count
      );

      if (!mountedRef.current) {
        return;
      }

      setUnreadCount(
        Number(res.data.count) || 0
      );
    } catch (err) {
      console.error(
        "❌ Failed to fetch unread count:",
        err
      );
    }
  };

  // =========================================================
  // INITIAL DATA
  // =========================================================

  useEffect(() => {
    mountedRef.current = true;

    fetchNotifications();
    fetchUnreadCount();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // =========================================================
  // REFRESH WHEN NOTIFICATION PANEL OPENS
  // =========================================================

  useEffect(() => {
    if (showNotif) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [showNotif]);

  // =========================================================
  // SOCKET.IO NOTIFICATIONS
  // =========================================================

  useEffect(() => {
    let mounted = true;
    let currentUserId = null;

    console.log(
      "🔌 Connecting notification socket..."
    );

    const socket = io(API_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    const joinUserRoom = (userId) => {
      const safeUserId = Number(userId);

      if (!safeUserId || Number.isNaN(safeUserId)) {
        return;
      }

      currentUserId = safeUserId;

      console.log(
        `📡 Joining notification room: user_${safeUserId}`
      );

      socket.emit("joinUser", safeUserId);
    };

    // =======================================================
    // SOCKET CONNECTED
    // =======================================================

    socket.on("connect", () => {
      console.log(
        "🟢 Socket connected:",
        socket.id
      );

      if (currentUserId) {
        joinUserRoom(currentUserId);
      }
    });

    // =======================================================
    // GET CURRENT USER
    // =======================================================

    const initSocket = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/me`,
          {
            withCredentials: true,
          }
        );

        if (!mounted) {
          return;
        }

        const userId = res.data.id;

        console.log(
          "👤 Current user ID:",
          userId
        );

        if (!userId) {
          console.error(
            "❌ No user ID returned from /api/me"
          );
          return;
        }

        joinUserRoom(userId);
      } catch (err) {
        console.error(
          "❌ Failed to get current user:",
          err
        );
      }
    };

    initSocket();

    // =======================================================
    // RECEIVE NEW NOTIFICATION
    // =======================================================

    socket.on(
      "notification",
      (notif) => {
        console.log(
          "🔔 NEW NOTIFICATION RECEIVED:",
          notif
        );

        if (!mounted || !notif) {
          return;
        }

        const isUnread = Number(notif.is_read) === 0;

        setNotifications((prev) => {
          // Prevent duplicate notification
          const alreadyExists = prev.some(
            (item) =>
              Number(item.id) ===
              Number(notif.id)
          );

          if (alreadyExists) {
            console.log(
              "⚠️ Duplicate notification ignored:",
              notif.id
            );

            return prev;
          }

          const updated = [
            notif,
            ...prev,
          ];

          // Keep newest first
          updated.sort((a, b) => {
            const dateA = new Date(
              a.created_at
            ).getTime();

            const dateB = new Date(
              b.created_at
            ).getTime();

            return dateB - dateA;
          });

          return updated;
        });

        if (isUnread) {
          setUnreadCount((prev) =>
            Number(prev || 0) + 1
          );
        }
      }
    );

    // =======================================================
    // SOCKET DISCONNECTED
    // =======================================================

    socket.on("disconnect", (reason) => {
      console.log(
        "🔴 Socket disconnected:",
        reason
      );
    });

    // =======================================================
    // SOCKET ERROR
    // =======================================================

    socket.on("connect_error", (error) => {
      console.error(
        "❌ Socket connection error:",
        error
      );
    });

    // =======================================================
    // CLEANUP
    // =======================================================

    return () => {
      mounted = false;

      console.log(
        "🔌 Disconnecting notification socket"
      );

      socket.off("connect");
      socket.off("notification");
      socket.off("disconnect");
      socket.off("connect_error");

      socket.disconnect();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [API_URL]);

  // =========================================================
  // MARK NOTIFICATION AS READ
  // =========================================================

  const markAsRead = async (id) => {
    try {
      // Find notification first
      const selectedNotification =
        notifications.find(
          (notification) =>
            Number(notification.id) ===
            Number(id)
        );

      // Already read
      if (
        !selectedNotification ||
        Number(selectedNotification.is_read) !== 0
      ) {
        return;
      }

      await axios.put(
        `${API_URL}/api/notifications/${id}/read`,
        {},
        {
          withCredentials: true,
        }
      );

      setNotifications((prev) => {
        const updated = prev.map(
          (notification) =>
            Number(notification.id) ===
            Number(id)
              ? {
                  ...notification,
                  is_read: 1,
                }
              : notification
        );

        // Recalculate instead of subtracting blindly
        setUnreadCount(
          calculateUnreadCount(updated)
        );

        return updated;
      });
    } catch (err) {
      console.error(
        "❌ Failed to mark notification as read:",
        err
      );
    }
  };

  // =========================================================
  // HANDLE NOTIFICATION CLICK
  // =========================================================

  const handleNotificationClick = (notif) => {
    if (!notif) {
      return;
    }

    if (Number(notif.is_read) === 0) {
      markAsRead(notif.id);
    }

    if (notif.link) {
      setShowNotif(false);

      navigate(notif.link);
    }
  };

  // =========================================================
  // GET NOTIFICATION TITLE
  // =========================================================

  const getNotificationTitle = (type) => {
    const normalizedType = String(
      type || ""
    ).toLowerCase();

    switch (normalizedType) {
      case "comment":
        return "Comment";

      case "reply":
        return "Reply";

      case "like":
        return "Like";

      default:
        return (
          String(type || "Notification")
            .charAt(0)
            .toUpperCase() +
          String(type || "Notification")
            .slice(1)
        );
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    try {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      await axios.get(
        `${API_URL}/auth/logout`,
        {
          withCredentials: true,
        }
      );

      navigate("/");
    } catch (err) {
      console.error(
        "❌ Logout failed:",
        err
      );
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="student-layout">

      {/* =====================================================
          TOP NAVBAR
          ===================================================== */}

      <header className="student-navbar">

        {/* ===================================================
            LOGO
            =================================================== */}

        <button
          type="button"
          className="student-brand"
          onClick={handleLogoClick}
          aria-label="Go to Student Dashboard"
        >
          <div className="logo-icon-wrapper">
            <img
              src={adssuLogo}
              alt="Agusan del Sur State University"
              className="school-logo"
            />
          </div>

          <div className="logo-text">
            <span className="logo-title">
              ADSSU Digital Yearbook
            </span>

<span className="logo-subtitle">
  {user?.role === "faculty"
    ? "Faculty Portal"
    : user?.role === "admin"
    ? "Admin Portal"
    : "Student Portal"}
</span>
          </div>
        </button>

        {/* ===================================================
            CENTER NAVIGATION
            =================================================== */}

        <nav className="student-navlinks">

          <NavLink
            to="/student"
            end
          >
            <FiHome />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/student/profile">
            <FiUser />
            <span>Profile</span>
          </NavLink>

          <NavLink to="/student/memories">
            <FiImage />
            <span>Memories</span>
          </NavLink>

          <NavLink to="/student/yearbook">
            <FiBookOpen />
            <span>Yearbook</span>
          </NavLink>

        </nav>

        {/* ===================================================
            RIGHT ACTIONS
            =================================================== */}

        <div className="student-actions">

          {/* Notification */}

          <button
            type="button"
            className="notif-btn"
            onClick={() => setShowNotif(true)}
            aria-label="Notifications"
          >
            <FiBell />

            {unreadCount > 0 && (
              <span className="notif-badge">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </button>

          {/* Logout */}

          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
          >
            <FiLogOut />
            <span>Logout</span>
          </button>

        </div>
      </header>

      {/* =====================================================
          NOTIFICATION MODAL
          ===================================================== */}

      {showNotif && (
        <div
          className="notif-modal-overlay"
          onClick={() =>
            setShowNotif(false)
          }
        >
          <div
            className="notif-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* =================================================
                HEADER
                ================================================= */}

            <div className="notif-header">

              <div>
                <h3>
                  Notifications
                </h3>

                <span>
                  {unreadCount > 0
                    ? `${unreadCount} unread`
                    : "You're all caught up"}
                </span>
              </div>

              <button
                type="button"
                className="close-btn"
                onClick={() =>
                  setShowNotif(false)
                }
                aria-label="Close notifications"
              >
                <FiX />
              </button>

            </div>

            {/* =================================================
                NOTIFICATION LIST
                ================================================= */}

            <div className="notif-list">

              {notifications.length === 0 ? (
                <div className="empty-notifications">

                  <div className="empty-notification-icon">
                    <FiBell />
                  </div>

                  <h4>
                    No notifications
                  </h4>

                  <p>
                    You don't have any
                    notifications yet.
                  </p>

                </div>
              ) : (
                notifications.map(
                  (notif) => {

                    const isUnread =
                      Number(
                        notif.is_read
                      ) === 0;

                    return (
                      <div
                        key={notif.id}
                        className={`notif-item ${
                          isUnread
                            ? "unread"
                            : ""
                        }`}
                        onClick={() =>
                          handleNotificationClick(
                            notif
                          )
                        }
                      >

                        {/* Unread dot */}

                        <div className="notif-dot">
                          {isUnread && (
                            <span />
                          )}
                        </div>

                        {/* Content */}

                        <div className="notif-content">

                          <div className="notif-item-top">

                            <h4>
                              {getNotificationTitle(
                                notif.type
                              )}
                            </h4>

                            {isUnread && (
                              <span className="unread-label">
                                New
                              </span>
                            )}

                          </div>

                          <p>
                            {notif.message}
                          </p>

                          <span className="notif-time">
                            {notif.created_at
                              ? new Date(
                                  notif.created_at
                                ).toLocaleString()
                              : ""}
                          </span>

                        </div>

                      </div>
                    );
                  }
                )
              )}

            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          PAGE CONTENT
          ===================================================== */}

      <main className="student-content">
        <Outlet />
      </main>

    </div>
  );
}

export default StudentLayout;