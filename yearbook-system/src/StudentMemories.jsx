import { useState } from "react";
import { FiUpload, FiImage, FiClock, FiCheckCircle } from "react-icons/fi";
import "./memo.css";

export default function StudentMemories() {
  const [activeTab, setActiveTab] = useState("pending");
  const [message, setMessage] = useState("");

  const uploads = [
    {
      title: "Cap toss — we made it!",
      message: "Cap toss — we made it!",
      date: "May 2026",
      status: "approved",
    },
    {
      title: "Library bestie",
      message: "Library bestie",
      date: "Mar 2026",
      status: "pending",
    },
    {
      title: "Block CS-4A forever",
      message: "Block CS-4A forever",
      date: "Feb 2026",
      status: "approved",
    },
  ];

  const filteredUploads = uploads.filter((i) => i.status === activeTab);

  return (
    <div className="memories-page">

      {/* HEADER */}
      <div className="memories-header">
        <h1>Memories</h1>
        <p>Capture the moments that made it all worth it.</p>
      </div>

      {/* UPLOAD CARD */}
      <div className="upload-card-box">
        <div className="upload-icon">
          <FiUpload />
        </div>

        <p className="upload-title">Drag & drop your photo</p>
        <small>or click to browse — JPG, PNG, JPEG</small>

        <textarea
          placeholder="Add a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {/* SEGMENTED TABS */}
      <div className="tab-switch">
        <button
          className={activeTab === "pending" ? "active" : ""}
          onClick={() => setActiveTab("pending")}
        >
          <FiClock /> Pending
        </button>

        <button
          className={activeTab === "approved" ? "active" : ""}
          onClick={() => setActiveTab("approved")}
        >
          <FiCheckCircle /> Approved
        </button>
      </div>

      {/* GRID LIST */}
      <div className="upload-grid">
        {filteredUploads.map((item, i) => (
          <div className="memory-card" key={i}>
            <div className="memory-icon">
              <FiImage />
            </div>

            <div className="memory-content">
              <h4>{item.title}</h4>
              <p>{item.message}</p>
              <span>{item.date}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}