import { useState } from "react";
import "./mm.css";

function Memories() {

  const [activeTab, setActiveTab] = useState("students");

const studentMemories = [
  {
    name: "Maria Santos",
    course: "BSCS - Class of 2025",
    status: "Pending",
    images: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9",
    ],
    message:
      "Four years of late nights, friendships, and a thousand cups of coffee. Thank you for everything.",
  },

  {
    name: "Juan Dela Cruz",
    course: "BSEE - Class of 2025",
    status: "Pending",
    images: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
    ],
    message:
      "From freshman jitters to graduation cheers — what a journey it's been.",
  },
];
const facultyMessages = [
  {
    name: "Prof. Elena Cruz",
    department: "College of Engineering",
    status: "Approved",
    message:
      "Watching students grow into professionals has always been the most rewarding part of teaching.",
  },

  {
    name: "Dr. Michael Reyes",
    department: "Department of Computer Science",
    status: "Pending",
    message:
      "The future belongs to those who never stop learning. Congratulations to the graduating class.",
  },
];

  const data =
    activeTab === "students"
      ? studentMemories
      : facultyMessages;

  return (
    <div className="memories-page">

      {/* HEADER */}
      <div className="memories-header">
        <h1>Memories & Messages</h1>

        <p>
          Review and moderate submissions before they appear in the yearbook.
        </p>
      </div>

      {/* TABS */}
      <div className="memory-tabs">

        <button
          className={
            activeTab === "students"
              ? "tab active"
              : "tab"
          }
          onClick={() => setActiveTab("students")}
        >
          Student Memories
        </button>

        <button
          className={
            activeTab === "faculty"
              ? "tab active"
              : "tab"
          }
          onClick={() => setActiveTab("faculty")}
        >
          Faculty Messages
        </button>

      </div>

      {/* LIST */}
<div className="memory-list">

  {data.map((item, index) => (

    <div className="memory-card" key={index}>

{/* STUDENT PHOTOS */}
{activeTab === "students" && (
  <div className="memory-gallery">

    {item.images.map((img, i) => (
      <img
        key={i}
        src={img}
        alt="memory"
        className="memory-thumb"
      />
    ))}

  </div>
)}

      {/* TOP */}
      <div className="memory-top">

        <div>

          <h3>{item.name}</h3>

          <span>
            {activeTab === "students"
              ? item.course
              : item.department}
          </span>

        </div>

        <div
          className={
            item.status === "Approved"
              ? "status approved"
              : "status pending"
          }
        >
          {item.status}
        </div>

      </div>

      {/* MESSAGE */}
      <p className="memory-message">
        "{item.message}"
      </p>

      {/* ACTIONS */}
      <div className="memory-actions">

        <button className="approve-btn">
          Approve
        </button>

        <button className="reject-btn">
          Reject
        </button>

      </div>

    </div>

  ))}

</div>

    </div>
  );
}

export default Memories;