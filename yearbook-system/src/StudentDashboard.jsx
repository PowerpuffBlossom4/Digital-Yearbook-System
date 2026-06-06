import "./studentDashboard.css";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

import {
  FiImage,
  FiHeart,
  FiSend,
  FiMessageCircle
} from "react-icons/fi";

import useAuth from "./hooks/useAuth";

function StudentDashboard() {

const { user } = useAuth();
const [content, setContent] = useState("");
const [image, setImage] = useState(null);
const fileInputRef = useRef();
const [selectedPost, setSelectedPost] = useState(null);

const handlePost = async () => {

  let imageUrl = "";

  // UPLOAD IMAGE FIRST
  if (image) {

    const formData = new FormData();

    formData.append("image", image);

    const uploadRes = await axios.post(
      "http://localhost:5000/api/upload",
      formData
    );

    imageUrl = uploadRes.data.imageUrl;
  }

  // SAVE POST
  await axios.post(
    "http://localhost:5000/api/posts",
    {
      user_id: user.id,
      content,
      image: imageUrl,
    }
  );

  alert("Posted Successfully");

};

const [posts, setPosts] = useState([]);

useEffect(() => {

  axios.get("http://localhost:5000/api/posts")
    .then((res) => {
      setPosts(res.data);
    });

}, []);

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
 <div className="avatar-mo">

  {user?.profile_pic ? (

    <img
      src={user.profile_pic}
      alt="avatar"
    />

  ) : (

    <span>
      {user?.full_name?.charAt(0) || "M"}
    </span>

  )}

</div>
          <input
  type="text"
  placeholder="What's on your mind?"
  value={content}
  onChange={(e) => setContent(e.target.value)}
/>
        </div>


<input
  type="file"
  ref={fileInputRef}
  style={{ display: "none" }}
  onChange={(e) => setImage(e.target.files[0])}
/>
        <div className="post-box-actions">
         <button
  className="btn-light"
  onClick={() => fileInputRef.current.click()}
>
  <FiImage /> Add Photo
</button>

{
  image && (
    <img
      src={URL.createObjectURL(image)}
      alt=""
      className="preview-image"
    />
  )
}

          <button
  className="btn-primary"
  onClick={handlePost}
>
  <FiSend /> Post
</button>
        </div>

      </div>

      {/* FEED */}
      <div className="feed">

       

        {/* CARD */}
{
  posts.map((post) => (

    <div className="post-card" key={post.id}>

      <div className="post-card-header">
<div className="avatar small">

  {post?.profile_pic ? (

    <img
      src={post.profile_pic}
      alt="avatar"
    />

  ) : (

    <span>
      {post?.full_name?.charAt(0) || "M"}
    </span>

  )}

</div>

        <div>
          <div className="name">
            {post.full_name}
          </div>

          <div className="time">
            Just now
          </div>
        </div>

      </div>

      <div className="post-text">
        {post.content}
      </div>

{
  post.image && (
    <img
      className="post-image"
      src={post.image}
      alt=""
      onClick={() => setSelectedPost(post)}
    />
  )
}

      <div className="post-card-footer">

        <button className="like">
          <FiHeart /> 0
        </button>

        <button className="comment">
          <FiMessageCircle /> 0
        </button>

      </div>

    </div>

  ))
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

      </div>

    
  );
}

export default StudentDashboard;