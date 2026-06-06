
import "./admin.css";
import { useEffect, useState } from "react";
import axios from "axios";


function AdminDashboard() {
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
  });

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/admin/stats")
      .then((res) => {
        setStats(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div>
      {/* HEADER */}
      <div className="header">
        <div>
          <h1>Welcome Back Admin</h1>
          <p>Manage your digital yearbook system.</p>
        </div>
      </div>

      {/* STATS */}
      <section className="stats-grid">
        <div className="stat-card">
          <h4>Total Students</h4>
          <h2>{stats.totalStudents}</h2>
        </div>

        <div className="stat-card">
          <h4>Faculty Members</h4>
          <h2>{stats.totalFaculty}</h2>
        </div>

        <div className="stat-card">
          <h4>Uploaded Photos</h4>
          <h2>5,420</h2>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="quick-actions">
        <h3 className="section-title">Quick Actions</h3>

        <div className="quick-grid">
          <div className="quick-card">
            <h3>Upload Photos</h3>
            <p>Manage media uploads quickly.</p>
          </div>

          <div className="quick-card">
            <h3>Review Memories</h3>
            <p>Approve student submissions.</p>
          </div>

          <div className="quick-card">
            <h3>Open Design Studio</h3>
            <p>Edit yearbook layouts and themes.</p>
          </div>
        </div>
      </section>

      {/* RECENT ACTIVITY */}
      <section className="activity-wrapper">
        <div className="activity-panel">
          <h3>Recent Activity</h3>

          <div className="activity-item">
            Maria Santos submitted a memory
          </div>

          <div className="activity-item">
            Prof. Cruz uploaded 12 photos
          </div>

          <div className="activity-item">
            Admin created a new theme
          </div>
        </div>
      </section>
    </div>
  );
  
}

export default AdminDashboard;