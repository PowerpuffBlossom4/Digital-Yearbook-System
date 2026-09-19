import {
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";

import axios from "axios";

import {
  FiGrid,
  FiUsers,
  FiBookOpen,
  FiLayers,
  FiLogOut,
  FiChevronRight,
} from "react-icons/fi";

import adssuLogo from "./assets/adssu-logo.png";
import "./admin.css";

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

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

  const menuItems = [
    {
      path: "/admin",
      label: "Dashboard",
      icon: <FiGrid />,
    },
    {
      path: "/admin/users",
      label: "Students / Faculty",
      icon: <FiUsers />,
    },
    {
      path: "/admin/memories",
      label: "Memories / Messages",
      icon: <FiBookOpen />,
    },
    {
      path: "/admin/design",
      label: "Design Studio",
      icon: <FiLayers />,
    },
    {
      path: "/admin/yearbooks",
      label: "Yearbooks",
      icon: <FiBookOpen />,
    },
  ];

  return (
    <div className="dashboard">

      {/* ================================
          SIDEBAR
      ================================= */}

      <aside className="sidebar">

        {/* BRAND */}
        <div className="sidebar-brand">
          <div className="logo-icon-wrapper">
            <img
              src={adssuLogo}
              alt="Agusan del Sur State University"
              className="school-logo"
            />
          </div>

          <div className="logo-text">
            <span className="logo-title">
              ADSSU
            </span>

            <span className="logo-subtitle">
              Digital Yearbook
            </span>
          </div>
        </div>

        {/* ADMIN LABEL */}
        <div className="admin-profile">
          <div className="admin-avatar">
            A
          </div>

          <div className="admin-info">
            <strong>Administrator</strong>
            <span>Yearbook Management</span>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="sidebar-divider" />

        {/* NAVIGATION */}
        <nav className="menu">

          <div className="menu-section-title">
            MAIN MENU
          </div>

          {menuItems.map((item) => {
            const isActive =
              location.pathname === item.path;

            return (
              <div
                key={item.path}
                className={`menu-item ${
                  isActive ? "active" : ""
                }`}
                onClick={() => navigate(item.path)}
              >
                <div className="menu-icon">
                  {item.icon}
                </div>

                <span>
                  {item.label}
                </span>

                {isActive && (
                  <FiChevronRight className="menu-arrow" />
                )}
              </div>
            );
          })}
        </nav>

        {/* SIDEBAR BOTTOM */}
        <div className="sidebar-bottom">

         

          <div
            className="logout"
            onClick={handleLogout}
          >
            <FiLogOut />

            <span>
              Logout
            </span>
          </div>

        </div>
      </aside>

      {/* ================================
          MAIN CONTENT
      ================================= */}

      <main className="main-content">

        <div className="content-wrapper">
          <Outlet />
        </div>

      </main>

    </div>
  );
}

export default AdminLayout;