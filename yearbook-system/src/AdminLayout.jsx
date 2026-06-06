import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiGrid,
  FiUsers,
  FiImage,
  FiBookOpen,
  FiLayers,
  FiUpload,
  FiLogOut,
  FiLayout,
} from "react-icons/fi";

import { FaGraduationCap } from "react-icons/fa";
import "./admin.css";

function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div className="dashboard">

      {/* SIDEBAR (ONLY ONCE) */}
      <aside className="sidebar">

        <div>

          <div className="logo">
            <div className="logo-top">
              <FaGraduationCap className="logo-icon" />
              <h2>YearBook</h2>
            </div>
          </div>

          <div className="sidebar-divider"></div>

          <nav className="menu">

            <div className="menu-item" onClick={() => navigate("/admin")}>
              <FiGrid />
              <span>Dashboard</span>
            </div>

            <div className="menu-item" onClick={() => navigate("/admin/users")}>
              <FiUsers />
              <span>Students/Faculty</span>
            </div>

            <div className="menu-item" onClick={() => navigate("/admin/photo")}>
              <FiImage />
              <span>Photos</span>
            </div>

            <div
  className="menu-item"
  onClick={() => navigate("/admin/memories")}
>
              <FiBookOpen />
              <span>Memories/Messages</span>
            </div>

            <div
  className="menu-item"
  onClick={() => navigate("/admin/design")}
>
              <FiLayers />
              <span>Design Studio</span>
            </div>

            <div className="menu-item">
              <FiLayout />
              <span>Themes Templates</span>
            </div>

            <div className="menu-item">
              <FiUpload />
              <span>Publish</span>
            </div>

          </nav>

        </div>

<div
  className="logout"
  onClick={async () => {
    try {

      await axios.get(
        "http://localhost:5000/auth/logout",
        {
          withCredentials: true,
        }
      );

      navigate("/");

    } catch (err) {
      console.log(err);
    }
  }}
>
  <FiLogOut />
  <span>Logout</span>
</div>

      </aside>

      {/* MAIN CONTENT CHANGES HERE */}
      <main className="main-content">
        <Outlet />
      </main>

    </div>
  );
}

export default AdminLayout;