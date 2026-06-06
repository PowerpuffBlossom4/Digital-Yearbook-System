import { useState, useEffect } from "react";
import axios from "axios";
import {
  FiDownload,
  FiEdit3,
  FiX,
  FiUser,
  FiMail,
  FiBook,
  FiHeart,
  FiMessageCircle
} from "react-icons/fi";

import "./profile.css";
import useAuth from "./hooks/useAuth";

function StudentProfile() {

  const [posts, setPosts] = useState([]);
const [selectedPost, setSelectedPost] = useState(null);
  const { user } = useAuth();
  const [showEdit, setShowEdit] = useState(false);
const qrUrl = `http://localhost:3000/student/${user?.id}`;

  const [profile, setProfile] = useState(null);
const [nickname, setNickname] = useState("");
const [motto, setMotto] = useState("");

useEffect(() => {
  if (!user?.id) return;

  axios
    .get(`http://localhost:5000/api/profile/${user.id}`)
    .then((res) => {
      setProfile(res.data);
      setNickname(res.data?.nickname || "");
      setMotto(res.data?.motto || "");
    });
}, [user]);

useEffect(() => {

  if (!user?.id) return;

  axios
    .get(`http://localhost:5000/api/posts/${user.id}`)
    .then((res) => {
      setPosts(res.data);
    });

}, [user]);

  return (
    <div className="profile-page">

      {/* HEADER */}
      <div className="profile-header-card">
        <h2>My Profile</h2>
        <p>Your digital yearbook identity.</p>
      </div>

      {/* MAIN CARD */}
      <div className="profile-card">

        {/* LEFT */}
        <div className="profile-info">

          {/* AVATAR */}
<div className="avatar-section">

  <div className="avatar-large">
    {user?.profile_pic ? (
      <img src={user.profile_pic} alt="avatar" />
    ) : (
      <span>{user?.full_name?.charAt(0) || "M"}</span>
    )}
  </div>



  

</div>

          <div className="profile-name">
            {user?.full_name}
          </div>

          <div className="profile-nickname">
  "{profile?.nickname || "No nickname yet"}"
</div>

          <div className="profile-bio">
  {profile?.motto || "No motto yet"}
</div>

          {/* EDIT BUTTON */}
          <button className="edit-btn" onClick={() => setShowEdit(true)}>
            <FiEdit3 /> Edit Profile
          </button>

          <div className="profile-details">
            <div><FiUser /> {user?.full_name}</div>
            <div><FiMail /> {user?.email}</div>
            <div><FiBook /> {user?.department_program}</div>
          </div>

        </div>

        {/* QR */}
        <div className="profile-qr">
          <h4>My QR Code</h4>
          <p>Scan to view my profile</p>

          <img
  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrUrl)}&color=350252&bgcolor=FFFFFF`}
  alt="QR Code"
/>

          <button className="download-btn">
            <FiDownload /> Download QR
          </button>
        </div>

      </div>

      {/* POSTS */}
<div className="instagram-posts">

  <div className="instagram-tabs">
    <span className="active-tab">POSTS</span>
  </div>

  {
    posts.length === 0 ? (

      <div className="empty-posts">
        No posts yet ✨
      </div>

    ) : (

      <div className="instagram-grid">

        {posts.map((post) => (

          <div
            className="instagram-grid-item"
            key={post.id}
          >

{
  post.image && (
    <img
      className="instagram-grid-image"
      src={post.image}
      alt=""
      onClick={() => setSelectedPost(post)}
    />
  )
}

            {/* OVERLAY */}
            <div className="instagram-overlay">

              <div className="overlay-content">

                <div>
                  ❤️ 0
                </div>

                <div>
                  💬 0
                </div>

              </div>

            </div>

          </div>

        ))}

      </div>

    )
  }

</div>

{
  selectedPost && (

    <div
      className="post-modal-overlay"
      onClick={() => setSelectedPost(null)}
    >

      <div
        className="post-modal"
        onClick={(e) => e.stopPropagation()}
      >

        {/* CLOSE */}
        <button
          className="close-modal"
          onClick={() => setSelectedPost(null)}
        >
          ✕
        </button>

        {/* LEFT IMAGE */}
        <div className="modal-image-section">

          <img
            src={selectedPost.image}
            alt=""
            className="modal-post-image"
          />

        </div>

        {/* RIGHT CONTENT */}
        <div className="modal-content-section">

          {/* USER */}
          <div className="modal-user">

            <div className="avatar small">

              {
                selectedPost?.profile_pic ? (

                  <img
                    src={selectedPost.profile_pic}
                    alt=""
                  />

                ) : (

                  <span>
                    {selectedPost?.full_name?.charAt(0)}
                  </span>

                )
              }

            </div>

            <div>

              <div className="modal-name">
                {selectedPost.full_name}
              </div>

              <div className="modal-time">
                Just now
              </div>

            </div>

          </div>

          {/* TEXT */}
          <div className="modal-post-text">
            {selectedPost.content}
          </div>

          {/* ACTIONS */}
          <div className="modal-actions">

            <button>
              <FiHeart />
            </button>

            <button>
              <FiMessageCircle />
            </button>

          </div>

        </div>

      </div>

    </div>

  )
}

{showEdit && (
  <div className="profile-edit-overlay">
    <div className="profile-edit-modal">

      <div className="profile-edit-header">
        <h3>Edit Profile</h3>
        <button onClick={() => setShowEdit(false)}>
          <FiX />
        </button>
      </div>

      <div className="profile-edit-body">

        {/* FULL NAME */}
        <input
          value={user?.full_name}
          disabled
          placeholder="Full Name"
        />

        {/* NICKNAME */}
        <input
          type="text"
          placeholder="Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />

        {/* DEPARTMENT */}
        <input
          value={user?.department_program}
          disabled
        />

        {/* BATCH */}
        <input
          value={user?.batch}
          disabled
        />

        {/* MOTTO */}
        <textarea
          placeholder="Motto / Quote"
          value={motto}
          onChange={(e) => setMotto(e.target.value)}
        />

        {/* SAVE */}
        <button
          className="profile-save-btn"
          onClick={async () => {
            await axios.post("http://localhost:5000/api/profile/save", {
              user_id: user.id,
              nickname,
              motto,
            });

            alert("Profile saved!");
            setShowEdit(false);
          }}
        >
          Save Changes
        </button>

      </div>


          </div>
        </div>
      )}

    </div>
  );
}

export default StudentProfile;