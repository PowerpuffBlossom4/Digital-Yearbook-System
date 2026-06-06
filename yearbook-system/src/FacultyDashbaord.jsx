import "./studentDashboard.css";
import { FiImage, FiHeart, FiSend, FiMessageCircle } from "react-icons/fi";
import useAuth from "./hooks/useAuth";

function StudentDashboard() {

const { user } = useAuth();

  return (
    <div className="dashboard-this">

      {/* HEADER */}
      <div className="dashboard-header">
        <h1>Class of {user?.batch || "----"}</h1>

         <h2>
          Welcome, {user?.full_name || "Student"} 👋
        </h2>

        <p>Share what's on your mind with your batch.</p>
      </div>

      {/* POST BOX */}
      <div className="post-box">

        <div className="post-box-top">
          <div className="avatar-mo">M</div>

          <input
            type="text"
            placeholder="What's on your mind, Maria?"
          />
        </div>

        <div className="post-box-actions">
          <button className="btn-light">
            <FiImage /> Add photo
          </button>

          <button className="btn-primary">
            <FiSend /> Post
          </button>
        </div>

      </div>

      {/* FEED */}
      <div className="feed">

       

        {/* CARD */}
        <div className="post-card">

  <div className="post-card-header">
    <div className="avatar small">J</div>

    <div>
      <div className="name">Juan Dela Cruz</div>
      <div className="time">2h ago</div>
    </div>
  </div>

  <div className="post-text">
    Last day of finals! Onward to the next chapter 🎓
  </div>

  <img
    className="post-image"
    src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1"
    alt=""
  />

  <div className="post-card-footer">
    <button className="like">
      <FiHeart /> 18
    </button>

<button className="comment">
    <FiMessageCircle /> 5
  </button>

  </div>

</div>

      </div>

    </div>
  );
}

export default StudentDashboard;