import { useState, useEffect } from "react";
import html2canvas from "html2canvas";
import { Html5Qrcode } from "html5-qrcode";
import adssuLogo from "./assets/adssu-logo.png";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiDownload,
  FiEdit3,
  FiX,
  FiUser,
  FiMail,
  FiBook,
  FiHeart,
  FiMessageCircle,
  FiCamera,
  FiCheck,
  FiCalendar,
  FiImage,
  FiSend
} from "react-icons/fi";
import "./profile.css";
import useAuth from "./hooks/useAuth";

function StudentProfile() {
  const { user } = useAuth();

  const { studentId } = useParams();
  const navigate = useNavigate();

  // Profile state MUST come before anything that uses `profile`
  const [profile, setProfile] = useState(null);

  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showProfilePhoto, setShowProfilePhoto] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  const [showScanner, setShowScanner] = useState(false);
  const [scannerError, setScannerError] = useState("");

  const [showEdit, setShowEdit] = useState(false);
  const [nickname, setNickname] = useState("");
  const [motto, setMotto] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const profileId = studentId || user?.id;

  // Logged-in user's role
  const isLoggedInFaculty = user?.role === "faculty";
  const isLoggedInStudent = user?.role === "student";

  // Viewed profile's role
  const isProfileFaculty = profile?.role === "faculty";
  const isProfileStudent = profile?.role === "student";

  // Useful aliases for your edit modal
  const isFaculty = isLoggedInFaculty;
  const isStudent = isLoggedInStudent;

  const isOwnProfile =
    String(profileId) === String(user?.id);

  // QR URL
  const qrUrl = `http://localhost:3000/student/${user?.id || ""}`;
const buildCommentTree = (rows) => {
  const commentMap = {};
  const roots = [];

  rows.forEach((comment) => {
    commentMap[comment.id] = {
      ...comment,
      replies: [],
    };
  });

  rows.forEach((comment) => {
    if (comment.parent_comment_id) {
      const parent = commentMap[comment.parent_comment_id];

      if (parent) {
        parent.replies.push(commentMap[comment.id]);
      }
    } else {
      roots.push(commentMap[comment.id]);
    }
  });

  return roots;
};

const startQRScanner = async () => {
  setShowScanner(true);
  setScannerError("");

  setTimeout(async () => {
    try {
      const scanner = new Html5Qrcode("qr-reader");

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
        },
        async (decodedText) => {
          console.log("QR detected:", decodedText);

          await scanner.stop();
          scanner.clear();

          setShowScanner(false);

          // If QR contains your student profile URL
          try {
            const url = new URL(decodedText);

            if (url.pathname.startsWith("/student/")) {
              navigate(url.pathname);
              return;
            }

            alert("This QR code is not a valid student yearbook QR.");
          } catch (error) {
            console.error("Invalid QR:", error);
            alert("Invalid QR code.");
          }
        },
        (errorMessage) => {
          // Ignore continuous scan errors
        }
      );
    } catch (error) {
      console.error("QR scanner error:", error);

      setScannerError(
        "Unable to access your camera. Please allow camera permission and try again."
      );
    }
  }, 100);
};

const stopQRScanner = async () => {
  try {
    const scannerElement = document.getElementById("qr-reader");

    if (scannerElement) {
      scannerElement.innerHTML = "";
    }
  } catch (error) {
    console.error("Failed to stop scanner:", error);
  }

  setShowScanner(false);
  setScannerError("");
};

const countComments = (commentList) => {
  if (!Array.isArray(commentList)) return 0;

  return commentList.reduce((total, comment) => {
    return total + 1 + countComments(comment.replies);
  }, 0);
};




  /* =========================================================
     FETCH PROFILE
  ========================================================= */

useEffect(() => {
  if (!profileId) return;

  axios
    .get(`http://localhost:5000/api/profile/${profileId}`)
    .then((res) => {
      setProfile(res.data);
      setNickname(res.data?.nickname || "");
      setMotto(res.data?.motto || "");
    })
    .catch((err) => {
      console.error("Profile fetch error:", err);
    });
}, [profileId]);

  /* =========================================================
     FETCH POSTS
  ========================================================= */

useEffect(() => {
  if (!profileId) return;

  axios
    .get(
      `http://localhost:5000/api/posts/${profileId}`,
      {
        params: {
          user_id: profileId,
        },
      }
    )
    .then(async (res) => {
      const fetchedPosts = Array.isArray(res.data)
        ? res.data
        : [];

      const postsWithComments = await Promise.all(
        fetchedPosts.map(async (post) => {
          try {
            const commentRes = await axios.get(
              `http://localhost:5000/api/posts/${post.id}/comments`
            );

            const rows = Array.isArray(commentRes.data)
              ? commentRes.data
              : Array.isArray(commentRes.data?.comments)
              ? commentRes.data.comments
              : [];

            return {
              ...post,
              commentsCount: rows.length,
            };
          } catch (err) {
            console.error(
              `Failed to load comments for post ${post.id}`,
              err
            );

            return {
              ...post,
              commentsCount: 0,
            };
          }
        })
      );

      setPosts(postsWithComments);
    })
    .catch((err) => {
      console.error("Posts fetch error:", err);
      setPosts([]);
    });
}, [profileId]);

const loadComments = async (postId) => {
  try {
    setLoadingComments(true);

    const res = await axios.get(
      `http://localhost:5000/api/posts/${postId}/comments`
    );

    const rows = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.comments)
      ? res.data.comments
      : [];

    setComments(buildCommentTree(rows));
  } catch (err) {
    console.error(
      "❌ Failed to load comments:",
      err
    );

    setComments([]);
  } finally {
    setLoadingComments(false);
  }
};


const openPostModal = (post) => {
  const latestPost = posts.find((p) => p.id === post.id) || post;

  setSelectedPost({
    ...latestPost,
    likes: Number(latestPost.likes || 0),
    commentsCount: Number(latestPost.commentsCount || 0),
  });

  setCommentText("");
  setReplyingTo(null);
  setReplyText("");

  loadComments(post.id);
};

const handleReact = async (postId) => {
  if (!user?.id) return;

  try {
    const res = await axios.post(
      `http://localhost:5000/api/posts/${postId}/react`,
      {
        user_id: user.id,
      }
    );

    const liked = Boolean(res.data.liked);
    const likes = Number(res.data.likes || 0);

    // Update post grid
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked,
              likes,
            }
          : post
      )
    );

    // Update modal
    setSelectedPost((prev) => {
      if (!prev || prev.id !== postId) return prev;

      return {
        ...prev,
        liked,
        likes,
      };
    });
  } catch (err) {
    console.error("❌ Failed to react to post:", err);
  }
};

const handleComment = async () => {
  if (!selectedPost || !commentText.trim() || !user?.id) return;

  try {
    await axios.post(
      `http://localhost:5000/api/posts/${selectedPost.id}/comment`,
      {
        user_id: user.id,
        comment: commentText.trim(),
        parent_comment_id: null,
      }
    );

    setCommentText("");

    // Reload the actual comments
    await loadComments(selectedPost.id);

    // Update post grid count
    setPosts((prev) =>
      prev.map((post) =>
        post.id === selectedPost.id
          ? {
              ...post,
              commentsCount:
                Number(post.commentsCount || 0) + 1,
            }
          : post
      )
    );
  } catch (err) {
    console.error("❌ Failed to comment:", err);

    alert(
      err.response?.data?.message ||
        "Failed to post comment."
    );
  }
};

const handleReply = async (commentId) => {
  if (
    !selectedPost ||
    !replyText.trim() ||
    !user?.id ||
    !commentId
  ) {
    return;
  }

  try {
    await axios.post(
      `http://localhost:5000/api/posts/${selectedPost.id}/comment`,
      {
        user_id: user.id,
        comment: replyText.trim(),
        parent_comment_id: commentId,
      }
    );

    setReplyText("");
    setReplyingTo(null);

    await loadComments(selectedPost.id);
  } catch (err) {
    console.error(
      "❌ Failed to reply:",
      err
    );

    alert(
      err.response?.data?.message ||
        "Failed to reply."
    );
  }
};

const renderComment = (
  comment,
  level = 0
) => {
  if (!comment) return null;

  return (
    <div
      className={`profile-comment-thread ${
        level > 0
          ? "profile-nested-comment"
          : ""
      }`}
      key={comment.id}
    >
      <div className="profile-comment">
        <div className="profile-comment-avatar">
          {comment.profile_pic ? (
            <img
              src={comment.profile_pic}
              alt=""
            />
          ) : (
            <span>
              {comment.full_name
                ?.charAt(0)
                ?.toUpperCase() || "U"}
            </span>
          )}
        </div>

        <div className="profile-comment-body">
          <strong>
            {comment.full_name}
          </strong>

          <p>{comment.comment}</p>

          <div className="profile-comment-actions">
            <button
              type="button"
              onClick={() => {
                setReplyingTo(comment.id);
                setReplyText("");
              }}
            >
              Reply
            </button>
          </div>
        </div>
      </div>

      {replyingTo === comment.id && (
        <div className="profile-reply-input">
          <input
            type="text"
            value={replyText}
            onChange={(e) =>
              setReplyText(e.target.value)
            }
            placeholder={`Reply to ${comment.full_name}...`}
            autoFocus
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey
              ) {
                e.preventDefault();
                handleReply(comment.id);
              }

              if (e.key === "Escape") {
                setReplyingTo(null);
                setReplyText("");
              }
            }}
          />

          <button
            type="button"
            onClick={() =>
              handleReply(comment.id)
            }
            disabled={!replyText.trim()}
          >
            <FiSend />
          </button>

          <button
            type="button"
            className="profile-cancel-reply"
            onClick={() => {
              setReplyingTo(null);
              setReplyText("");
            }}
          >
            <FiX />
          </button>
        </div>
      )}

      {comment.replies?.length > 0 && (
        <div className="profile-comment-replies">
          {comment.replies.map((reply) =>
            renderComment(
              reply,
              level + 1
            )
          )}
        </div>
      )}
    </div>
  );
};

  /* =========================================================
     CHANGE PROFILE PICTURE
  ========================================================= */

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB.");
      e.target.value = "";
      return;
    }

    try {
      setUploadingAvatar(true);

      const formData = new FormData();
      formData.append("image", file);

      /* Upload */
      const uploadRes = await axios.post(
        "http://localhost:5000/api/profile/upload-avatar",
        formData
      );

      const imageUrl = uploadRes.data.imageUrl;

      /* Save URL */
      await axios.put(
        `http://localhost:5000/api/profile/${user.id}/avatar`,
        {
          profile_pic: imageUrl
        }
      );

      /* Update UI */
      setProfile((prev) => ({
        ...prev,
        profile_pic: imageUrl
      }));

    } catch (err) {
      console.error("Avatar upload error:", err);

      alert(
        err.response?.data?.message ||
        "Failed to update profile picture."
      );
    } finally {
      setUploadingAvatar(false);

      /* Allow same image to be selected again */
      e.target.value = "";
    }
  };

  /* =========================================================
     SAVE PROFILE
  ========================================================= */

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    try {
      setSavingProfile(true);

      await axios.post(
        "http://localhost:5000/api/profile/save",
        {
          user_id: user.id,
          nickname,
          motto
        }
      );

      setProfile((prev) => ({
        ...prev,
        nickname,
        motto
      }));

      setShowEdit(false);

    } catch (err) {
      console.error("Profile save error:", err);

      alert(
        err.response?.data?.message ||
        "Failed to save profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  /* =========================================================
     DOWNLOAD QR
  ========================================================= */

  const handleDownloadQR = async () => {
    try {
      const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
        qrUrl
      )}&color=176B3B&bgcolor=FFFFFF`;

      const response = await fetch(qrImage);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${user?.full_name || "student"}-qr-code.png`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("QR download error:", err);

      /* Fallback */
      window.open(
        `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
          qrUrl
        )}`,
        "_blank"
      );
    }
  };

  /* =========================================================
     CLOSE MODALS WITH ESC
  ========================================================= */

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key !== "Escape") return;

      if (selectedPost) {
        setSelectedPost(null);
      } else if (showEdit && !savingProfile) {
        setShowEdit(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [selectedPost, showEdit, savingProfile]);

const handleDownloadProfile = async () => {
  const photoFrame = document.querySelector(".profile-photo-frame");

  if (!photoFrame) {
    alert("Profile photo is not available.");
    return;
  }

  try {
    const canvas = await html2canvas(photoFrame, {
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: false,
      scale: 3,
      logging: false,
    });

    const image = canvas.toDataURL("image/png");

    const link = document.createElement("a");

    const studentName =
      profile?.full_name
        ?.replace(/[^a-z0-9]/gi, "_")
        .toLowerCase() || "student";

    link.href = image;
    link.download = `${studentName}-adssu-profile.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("❌ Failed to save profile photo:", error);
    alert("Unable to save the profile photo. Please try again.");
  }
};

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="profile-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <header className="profile-header-card">

        <div className="profile-header-content">

          <div>
<span className="profile-header-label">
  {isProfileFaculty ? "FACULTY PROFILE" : "STUDENT PROFILE"}
</span>

<h1>
  {isOwnProfile
    ? "My Profile"
    : `${profile?.full_name || "Student"}'s Profile`}
</h1>

<p>
  {isOwnProfile
    ? "Your digital yearbook identity and memories."
    : "Digital yearbook profile and memories."}
</p>
          </div>

          <div className="header-decoration">
            <FiBook />
          </div>

        </div>

      </header>


      {/* =====================================================
          PROFILE INFORMATION
      ===================================================== */}

      <section className="profile-card">

        {/* LEFT / MAIN */}
        <div className="profile-info">

          {/* AVATAR */}
<div className="avatar-section">
  {profile?.profile_pic ? (
    <button
      type="button"
      className="avatar-photo-button"
      onClick={() => setShowProfilePhoto(true)}
      aria-label="View profile picture"
    >
      <img
        src={profile.profile_pic}
        alt={profile?.full_name || "Profile"}
        className="avatar-large-image"
      />
    </button>
  ) : (
    <div className="avatar-large">
      <span>
        {profile?.full_name?.charAt(0) || "S"}
      </span>
    </div>
  )}
</div>


          {/* NAME */}
          <div className="profile-name">
            {profile?.full_name || "Student"}
          </div>


{/* NICKNAME / POSITION */}
{isProfileFaculty ? (
  <>
    <div className="profile-nickname">
      {profile?.position || "Position not available"}
    </div>


  </>
) : (
  <>
    <div className="profile-nickname">
      {profile?.nickname
        ? `"${profile.nickname}"`
        : "No nickname yet"}
    </div>

    <div className="profile-bio">
      {profile?.motto ||
        "Add a personal motto or quote to your yearbook profile."}
    </div>
  </>
)}

{/* EDIT BUTTON — STUDENT ONLY */}
{isOwnProfile &&
  (isLoggedInStudent || isLoggedInFaculty) && (
    <button
      className="edit-btn"
      onClick={() => setShowEdit(true)}
    >
      <FiEdit3 />
      Edit Profile
    </button>
)}
{/* DETAILS */}
<div className="profile-details">

  {/* FULL NAME */}
  <div className="profile-detail-item">
    <FiUser />
    <div>
      <span className="detail-label">Full Name</span>
      <strong>
        {profile?.full_name || "Not available"}
      </strong>
    </div>
  </div>

  {/* EMAIL */}
  <div className="profile-detail-item">
    <FiMail />
    <div>
      <span className="detail-label">Email</span>
      <strong>
        {profile?.email || "Not available"}
      </strong>
    </div>
  </div>

  {/* FACULTY DETAILS */}
  {isProfileFaculty ? (
    <>
      <div className="profile-detail-item">
        <FiBook />
        <div>
          <span className="detail-label">Department</span>
          <strong>
            {profile?.department_program || "Not available"}
          </strong>
        </div>
      </div>

      <div className="profile-detail-item">
        <FiUser />
        <div>
          <span className="detail-label">Position</span>
          <strong>
            {profile?.position || "Not available"}
          </strong>
        </div>
      </div>
    </>
  ) : (
    <>
      {/* STUDENT DETAILS */}
      <div className="profile-detail-item">
        <FiBook />
        <div>
          <span className="detail-label">Program</span>
          <strong>
            {profile?.department_program || "Not available"}
          </strong>
        </div>
      </div>

      <div className="profile-detail-item">
        <FiCalendar />
        <div>
          <span className="detail-label">Batch</span>
          <strong>
            {profile?.batch || "Not available"}
          </strong>
        </div>
      </div>
    </>
  )}

</div>

        

        </div>


        {/* QR CARD */}
        <aside className="profile-qr">

          <div className="qr-icon">
            <FiImage />
          </div>

          <h3>My Yearbook QR</h3>

          <p>
            Scan this code to view your public
            yearbook profile.
          </p>

          <div className="qr-wrapper">

            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                qrUrl
              )}&color=176B3B&bgcolor=FFFFFF`}
              alt="Student QR Code"
            />

          </div>

         <button
  className="download-btn"
  onClick={handleDownloadQR}
>
  <FiDownload />
  Download QR
</button>

<button
  className="scan-qr-btn"
  onClick={startQRScanner}
>
  <FiCamera />
  Scan QR
</button>

        </aside>

      </section>


      {/* =====================================================
          MEMORIES / POSTS
      ===================================================== */}

      <section className="profile-posts">

        <div className="posts-header">

          <div>
            <span className="posts-label">
              YEARBOOK MEMORIES
            </span>

            <h2>
  {isOwnProfile
    ? "My Posts"
    : `${profile?.full_name || "Student"}'s Posts`}
</h2>

<p>
  {isOwnProfile
    ? "Moments and memories you've shared."
    : "Moments and memories shared by this student."}
</p>
          </div>

          <div className="post-count">
            {posts.length}
            <span>
              {posts.length === 1 ? " Post" : " Posts"}
            </span>
          </div>

        </div>


        {/* POSTS */}
        {posts.length === 0 ? (

          <div className="empty-posts">

            <div className="empty-post-icon">
              <FiImage />
            </div>

            <h3>No memories yet</h3>

            <p>
              Your posts and memories will appear here.
            </p>

          </div>

        ) : (

          <div className="profile-post-grid">

            {posts.map((post) => (

              <article
                key={post.id}
                className={
                  post.image
                    ? "profile-post-item image-post"
                    : "profile-post-item text-post"
                }
                onClick={() => openPostModal(post)}
              >

                {post.image ? (

                  <>
                    <img
                      src={post.image}
                      alt=""
                      className="profile-post-image"
                    />

                    <div className="post-hover">

                      <div>
                       <FiHeart />
<span>{post.likes || 0}</span>
                      </div>

                      <div>
                        <FiMessageCircle />
<span>{post.commentsCount || 0}</span>
                      </div>

                    </div>
                  </>

                ) : (

                  <div className="text-post-content">

                    <span className="text-post-label">
                      MEMORY
                    </span>

                    <p>
                      {post.content
                        ? post.content.slice(0, 180)
                        : "No content"}
                    </p>

                    <span className="read-more">
                      View memory →
                    </span>

                  </div>

                )}

              </article>

            ))}

          </div>

        )}

      </section>


      {/* =====================================================
          POST MODAL
      ===================================================== */}

      {selectedPost && (

        <div
          className="post-modal-overlay"
          onClick={() => setSelectedPost(null)}
        >

          <div
            className={`post-modal ${
              selectedPost.image
                ? "with-image"
                : "text-only"
            }`}
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="close-modal"
              onClick={() => setSelectedPost(null)}
            >
              <FiX />
            </button>


            {/* IMAGE */}
            {selectedPost.image && (

              <div className="modal-image-section">

                <img
                  src={selectedPost.image}
                  alt=""
                  className="modal-post-image"
                />

              </div>

            )}


            {/* CONTENT */}
            <div
              className={
                selectedPost.image
                  ? "modal-content-section"
                  : "modal-content-section full"
              }
            >

              {/* USER */}
              <div className="modal-user">

                <div className="modal-avatar">

                  {profile?.profile_pic ? (
                    <img
                      src={profile.profile_pic}
                      alt=""
                    />
                  ) : (
                    <span>
                      {profile?.full_name?.charAt(0) || "S"}
                    </span>
                  )}

                </div>

                <div>

                  <div className="modal-name">
                    {profile?.full_name}
                  </div>

                  <div className="modal-time">
                    Yearbook Memory
                  </div>

                </div>

              </div>


              {/* TEXT */}
              <div className="modal-post-text">

                {selectedPost.content ? (
                  <p>
                    {selectedPost.content}
                  </p>
                ) : (
                  <span className="empty-text">
                    No caption for this memory.
                  </span>
                )}

              </div>


              {/* ACTIONS */}
<div className="modal-actions">
  <button
    type="button"
    className={`like-btn ${
      selectedPost.liked ? "liked" : ""
    }`}
    onClick={() => handleReact(selectedPost.id)}
  >
    <FiHeart
      fill={selectedPost.liked ? "currentColor" : "none"}
    />

    <span>
      {Number(selectedPost.likes || 0)}
    </span>

    <small>Like</small>
  </button>

  <button
    type="button"
    onClick={() => {
      document
        .querySelector(".profile-comments-section")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
    }}
  >
    <FiMessageCircle />

    <span>
      {countComments(comments)}
    </span>

    <small>Comments</small>
  </button>
</div>

<div className="profile-comments-section">
  <div className="profile-comments-header">
   <h4>
  Comments
  <span>
    {countComments(comments)}
  </span>
</h4>
  </div>

  {loadingComments ? (
    <div className="profile-comments-loading">
      Loading comments...
    </div>
  ) : comments.length === 0 ? (
    <div className="profile-no-comments">
      <FiMessageCircle />

      <p>
        No comments yet.
      </p>

      <span>
        Be the first to comment on this memory.
      </span>
    </div>
  ) : (
    <div className="profile-comments-list">
      {comments.map((comment) =>
        renderComment(comment)
      )}
    </div>
  )}

  {/* ADD COMMENT */}
  <div className="profile-add-comment">
<div className="profile-comment-avatar">
  {user?.profile_pic ? (
    <img
      src={user.profile_pic}
      alt={user?.full_name || "You"}
    />
  ) : (
    <span>
      {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
    </span>
  )}
</div>

    <div className="profile-comment-input">
      <input
        type="text"
        value={commentText}
        onChange={(e) =>
          setCommentText(e.target.value)
        }
        placeholder="Write a comment..."
        onKeyDown={(e) => {
          if (
            e.key === "Enter" &&
            !e.shiftKey
          ) {
            e.preventDefault();
            handleComment();
          }
        }}
      />

      <button
        type="button"
        onClick={handleComment}
        disabled={!commentText.trim()}
      >
        <FiSend />
      </button>
    </div>
  </div>
</div>

            </div>

          </div>

        </div>

      )}

{/* =====================================================
    PROFILE PHOTO VIEWER
===================================================== */}
{showProfilePhoto && profile?.profile_pic && (
  <div
    className="profile-photo-viewer"
    onClick={() => setShowProfilePhoto(false)}
  >
    <div
      className="profile-photo-viewer-content"
      onClick={(e) => e.stopPropagation()}
    >

<div className="profile-photo-actions">

  

</div>

<button
    type="button"
    className="profile-photo-save-btn"
    onClick={handleDownloadProfile}
  >
    <FiDownload />
    <span>Save Photo</span>
  </button>

      <button
        type="button"
        className="profile-photo-viewer-close"
        onClick={() => setShowProfilePhoto(false)}
        aria-label="Close photo"
      >
        <FiX />
      </button>

      

<div className="profile-photo-frame">

  <img
    src={profile.profile_pic}
    alt={profile?.full_name || "Student profile"}
    className="profile-viewer-image"
  />

  {/* UNIVERSITY BRANDING */}
  <div className="profile-photo-university">

    <div className="logo-icon-wrapper">
      <img
        src={adssuLogo}
        alt="Agusan del Sur State University"
        className="school-logo"
      />
    </div>

    <div className="university-brand-text">
      <strong>
        Agusan del Sur State University
      </strong>

      <span>
        DIGITAL YEARBOOK
      </span>
    </div>

  </div>

</div>
    </div>
    
  </div>
  
)}

{showScanner && (
  <div className="qr-scanner-overlay">
    <div className="qr-scanner-modal">

      <div className="qr-scanner-header">
        <div>
          <span>YEARBOOK SCANNER</span>
          <h3>Scan Student QR</h3>
          <p>
            Point your camera at a student's
            yearbook QR code.
          </p>
        </div>

        <button
          type="button"
          className="qr-scanner-close"
          onClick={stopQRScanner}
        >
          <FiX />
        </button>
      </div>

      <div className="qr-camera-container">

        <div
          id="qr-reader"
          className="qr-reader"
        ></div>

      </div>

      {scannerError && (
        <div className="qr-scanner-error">
          {scannerError}
        </div>
      )}

      <button
        type="button"
        className="qr-cancel-btn"
        onClick={stopQRScanner}
      >
        Cancel
      </button>

    </div>
  </div>
)}


      {/* =====================================================
          EDIT PROFILE MODAL
      ===================================================== */}

      {showEdit &&
  isOwnProfile &&
  (isLoggedInStudent || isLoggedInFaculty) && (

        <div
          className="profile-edit-overlay"
          onClick={() =>
            !savingProfile && setShowEdit(false)
          }
        >

          <div
            className="profile-edit-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* HEADER */}
            <div className="profile-edit-header">

              <div>

                <span className="edit-modal-eyebrow">
                  PERSONAL INFORMATION
                </span>

                <h3>
                  Edit Profile
                </h3>

                <p>
                  Update your yearbook profile information.
                </p>

              </div>

              <button
                className="edit-close-btn"
                onClick={() => setShowEdit(false)}
                disabled={savingProfile}
              >
                <FiX />
              </button>

            </div>


            {/* BODY */}
            <div className="profile-edit-body">


              {/* =================================================
                  PROFILE PHOTO
              ================================================= */}

              <section className="edit-photo-section">

                <div className="edit-photo-wrapper">

                  <div className="edit-avatar">

                    {profile?.profile_pic ? (

                      <img
                        src={profile.profile_pic}
                        alt="Profile"
                      />

                    ) : (

                      <span>
                        {profile?.full_name?.charAt(0) || "S"}
                      </span>

                    )}

                    {uploadingAvatar && (

                      <div className="avatar-loading">

                        <div className="spinner"></div>

                      </div>

                    )}

                  </div>


                  <label
                    className={`change-photo-btn ${
                      uploadingAvatar ? "disabled" : ""
                    }`}
                  >

                    <FiCamera />

                    <span>
                      {uploadingAvatar
                        ? "Uploading..."
                        : "Change Photo"}
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={uploadingAvatar}
                      onChange={handleAvatarChange}
                    />

                  </label>

                </div>


                <div className="edit-photo-info">

                  <h4>
                    Profile Picture
                  </h4>

                  <p>
                    Use a clear photo for your
                    yearbook profile.
                  </p>

                  <span>
                    JPG, PNG or WEBP 
                  </span>

                </div>

              </section>


              <div className="edit-section-divider"></div>


              {/* =================================================
                  BASIC INFORMATION
              ================================================= */}

              <section className="edit-section">

                <div className="edit-section-heading">

                  <div className="section-icon">
                    <FiUser />
                  </div>

                  <div>

<h4>
  Basic Information
</h4>

<p>
  {isFaculty
    ? "Your registered faculty information"
    : "Your registered student information"}
</p>

                  </div>

                </div>


                <div className="edit-info-grid">

                  {/* FULL NAME */}
                  <div className="edit-field">

                    <label>
                      Full Name
                    </label>

                    <div className="field-display">

                      <FiUser />

                      <span>
                        {user?.full_name ||
                          "Not available"}
                      </span>

                      <small>
                        Verified
                      </small>

                    </div>

                  </div>


                  {/* EMAIL */}
                  <div className="edit-field">

                    <label>
                      Email Address
                    </label>

                    <div className="field-display">

                      <FiMail />

                      <span>
                        {user?.email ||
                          "Not available"}
                      </span>

                      <small>
                        Verified
                      </small>

                    </div>

                  </div>


                  {/* PROGRAM */}
                  <div className="edit-field">

                    <label>
                      Department / Program
                    </label>

                    <div className="field-display">

                      <FiBook />

                      <span>
                        {user?.department_program ||
                          "Not available"}
                      </span>

                    </div>

                  </div>


                  {/* BATCH */}
                  <div className="edit-field">

                    <label>
                      Batch
                    </label>

                    <div className="field-display">

                      <FiCalendar />

                      <span>
                        {user?.batch ||
                          "Not available"}
                      </span>

                    </div>

                  </div>

                </div>

              </section>


              <div className="edit-section-divider"></div>


{/* =================================================
    PERSONAL DETAILS — STUDENT ONLY
================================================= */}

{isStudent && (
  <>
    <div className="edit-section-divider"></div>

    <section className="edit-section">

      <div className="edit-section-heading">

        <div className="section-icon">
          <FiEdit3 />
        </div>

        <div>
          <h4>
            Personal Details
          </h4>

          <p>
            Customize how you appear in the yearbook
          </p>
        </div>

      </div>

      {/* NICKNAME */}
      <div className="edit-field">

        <label>
          Nickname
        </label>

        <input
          type="text"
          placeholder="Enter your nickname"
          value={nickname}
          maxLength={40}
          onChange={(e) =>
            setNickname(e.target.value)
          }
        />

        <span className="field-hint">
          This will appear below your name.
        </span>

      </div>


      {/* MOTTO */}
      <div className="edit-field">

        <label>
          Motto / Quote
        </label>

        <textarea
          placeholder="Write a short motto, quote, or message..."
          value={motto}
          maxLength={200}
          rows={4}
          onChange={(e) =>
            setMotto(e.target.value)
          }
        />

        <div className="textarea-footer">

          <span>
            Your personal yearbook quote
          </span>

          <span>
            {motto.length}/200
          </span>

        </div>

      </div>

    </section>
  </>
)}

            </div>


            {/* FOOTER */}
            <div className="profile-edit-footer">

              <button
                className="cancel-profile-btn"
                onClick={() => setShowEdit(false)}
                disabled={savingProfile}
              >
                Cancel
              </button>


              <button
                className="profile-save-btn"
                onClick={handleSaveProfile}
                disabled={
                  savingProfile ||
                  uploadingAvatar
                }
              >

                {savingProfile ? (

                  <>
                    <div className="button-spinner"></div>
                    Saving...
                  </>

                ) : (

                  <>
                    <FiCheck />
                    Save Changes
                  </>

                )}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default StudentProfile;