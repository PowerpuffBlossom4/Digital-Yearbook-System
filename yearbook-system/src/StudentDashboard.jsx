import "./studentDashboard.css";

import {
  useState,
  useEffect,
  useRef,
} from "react";
import { useNavigate,
  useSearchParams,
} from "react-router-dom";
import axios from "axios";

import {
  FiImage,
  FiHeart,
  FiSend,
  FiMessageCircle,
  FiX,
  FiUsers,
  FiCamera,
  FiBookOpen,
  FiMoreHorizontal,
  FiSmile,
  FiBookmark,
  FiArrowLeft,
} from "react-icons/fi";

import useAuth from "./hooks/useAuth";

function StudentDashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);

  const fileInputRef = useRef(null);
const [announcements, setAnnouncements] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [commentsMap, setCommentsMap] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
const [replyText, setReplyText] = useState("");
  const [posts, setPosts] = useState([]);

  const [isPosting, setIsPosting] = useState(false);



  const fetchAnnouncements = async () => {
  if (!user?.id) return;

  try {
    const res = await axios.get(
      `http://localhost:5000/api/announcements/student/${user.id}`
    );

    setAnnouncements(
      Array.isArray(res.data) ? res.data : []
    );
  } catch (err) {
    console.error("Failed to load announcements:", err);
  }
};
  /* =========================================================
     TIME FORMAT
     ========================================================= */

  const formatTime = (time) => {
    if (!time) return "";

    const date = new Date(time);
    const now = new Date();

    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const navigate = useNavigate();

const openStudentProfile = (student) => {
  const studentId = student?.user_id || student?.id;

  if (!studentId) return;

  navigate(`/student/${studentId}`);
};


  // ============================================================
// BUILD NESTED COMMENT TREE
// ============================================================
const buildCommentTree = (comments) => {
  const commentMap = {};
  const roots = [];

  // ------------------------------------------------------------
  // CREATE EVERY COMMENT IN MAP
  // ------------------------------------------------------------
  comments.forEach((comment) => {
    commentMap[comment.id] = {
      ...comment,
      replies: [],
    };
  });

  // ------------------------------------------------------------
  // CONNECT REPLIES TO THEIR PARENTS
  // ------------------------------------------------------------
  comments.forEach((comment) => {
    if (
      comment.parent_comment_id
    ) {
      const parent =
        commentMap[
          comment.parent_comment_id
        ];

      if (parent) {
        parent.replies.push(
          commentMap[comment.id]
        );
      }
    } else {
      roots.push(
        commentMap[comment.id]
      );
    }
  });

  return roots;
};

// ============================================================
// COUNT ALL COMMENTS + NESTED REPLIES
// ============================================================
const countComments = (comments) => {
  if (!Array.isArray(comments)) return 0;

  return comments.reduce((total, comment) => {
    return (
      total +
      1 +
      countComments(comment.replies)
    );
  }, 0);
};

const loadComments = async (postId) => {
  try {
    const res = await axios.get(
      `http://localhost:5000/api/posts/${postId}/comments`
    );

    const rows =
      Array.isArray(res.data)
        ? res.data
        : Array.isArray(
            res.data?.comments
          )
        ? res.data.comments
        : [];

    const commentTree =
      buildCommentTree(rows);

    setCommentsMap((prev) => ({
      ...prev,
      [postId]: commentTree,
    }));
  } catch (err) {
    console.error(
      "❌ Failed to load comments:",
      err
    );
  }
};

  /* =========================================================
     GET INITIAL
     ========================================================= */

  const getInitial = (name) => {
    return name?.charAt(0)?.toUpperCase() || "S";
  };

  /* =========================================================
     FETCH POSTS
     ========================================================= */

const fetchPosts = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5000/api/posts",
      {
        params: {
          user_id: user.id,
        },
      }
    );

    const fetchedPosts = Array.isArray(res.data)
      ? res.data.map((post) => ({
          ...post,
          liked: Boolean(post.liked),
          likes: Number(post.likes || 0),
        }))
      : [];

    setPosts(fetchedPosts);

    const commentsData = {};

await Promise.all(
  fetchedPosts.map(async (post) => {
    try {
      const comments = await axios.get(
        `http://localhost:5000/api/posts/${post.id}/comments`
      );

      const rows = Array.isArray(comments.data)
        ? comments.data
        : Array.isArray(comments.data?.comments)
        ? comments.data.comments
        : [];

      commentsData[post.id] =
        buildCommentTree(rows);
    } catch (err) {
      console.error(
        `Failed to fetch comments for post ${post.id}`,
        err
      );

      commentsData[post.id] = [];
    }
  })
);

    setCommentsMap(commentsData);
  } catch (err) {
    console.error("Failed to load posts:", err);
  }
};

useEffect(() => {
  if (user?.id) {
    fetchPosts();
    fetchAnnouncements();
  }
}, [user?.id]);

  /* =========================================================
     OPEN POST / COMMENTS
     ========================================================= */

const openPost = async (post) => {
  setSelectedPost(post);
  setReplyingTo(null);
  setReplyText("");

  try {
    const res = await axios.get(
      `http://localhost:5000/api/posts/${post.id}/comments`
    );

    const rows = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.comments)
      ? res.data.comments
      : [];

    const commentTree =
      buildCommentTree(rows);

    setCommentsMap((prev) => ({
      ...prev,
      [post.id]: commentTree,
    }));
  } catch (err) {
    console.error(
      "Failed to load comments:",
      err
    );
  }
};

  /* =========================================================
     REACT TO POST
     ========================================================= */

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

    // Update feed
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
      if (!prev || prev.id !== postId) {
        return prev;
      }

      return {
        ...prev,
        liked,
        likes,
      };
    });
  } catch (err) {
    console.error("Failed to react to post:", err);
  }
};
  /* =========================================================
     COMMENT
     ========================================================= */

const handleComment = async () => {
  if (
    !selectedPost ||
    !commentText.trim() ||
    !user?.id
  ) {
    return;
  }

  try {
    const postId = selectedPost.id;
    const newComment = commentText.trim();

    await axios.post(
      `http://localhost:5000/api/posts/${postId}/comment`,
      {
        user_id: user.id,
        comment: newComment,
        parent_comment_id: null,
      }
    );

    // Clear comment input
    setCommentText("");

    // Reload comments so the comment tree stays updated
    await loadComments(postId);
  } catch (err) {
    console.error(
      "❌ Failed to comment:",
      err
    );

    const message =
      err.response?.data?.message ||
      "Failed to post comment.";

    alert(message);
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
    const postId =
      selectedPost.id;

    const newReplyText =
      replyText.trim();

    await axios.post(
      `http://localhost:5000/api/posts/${postId}/comment`,
      {
        user_id: user.id,
        comment: newReplyText,
        parent_comment_id:
          commentId,
      }
    );

    console.log(
      "✅ Reply created successfully."
    );

    setReplyText("");
    setReplyingTo(null);

    // Reload comments.
    // This also correctly handles nested replies.
    await loadComments(postId);
  } catch (err) {
    console.error(
      "❌ Failed to reply:",
      err
    );

    const message =
      err.response?.data?.message ||
      "Failed to reply.";

    alert(message);
  }
};

const cancelReply = () => {
  setReplyingTo(null);
  setReplyText("");
};

const renderComment = (comment, level = 0) => {
  if (!comment) return null;

  return (
    <div
      className={`comment-thread ${
        level > 0 ? "nested-comment-thread" : ""
      }`}
      key={comment.id}
    >
      {/* COMMENT / REPLY */}
      <div
        className={`comment-item ${
          level > 0 ? "reply-item" : ""
        }`}
      >
        <button
  type="button"
  className="avatar tiny profile-avatar-button"
  onClick={() => openStudentProfile(comment)}
  aria-label={`View ${comment.full_name}'s profile`}
>
  {comment.profile_pic ? (
    <img
      src={comment.profile_pic}
      alt={comment.full_name}
    />
  ) : (
    <span>
      {getInitial(comment.full_name)}
    </span>
  )}
</button>

        <div className="comment-content">
          <button
  type="button"
  className="comment-author-name"
  onClick={() => openStudentProfile(comment)}
>
  {comment.full_name}
</button>

          <p>
            {comment.comment}
          </p>

          <div className="comment-actions">
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

      {/* REPLY INPUT */}
      {replyingTo === comment.id && (
        <div className="reply-input">
          <div className="avatar tiny">
            {user?.profile_pic ? (
              <img
                src={user.profile_pic}
                alt=""
              />
            ) : (
              <span>
                {getInitial(user?.full_name)}
              </span>
            )}
          </div>

          <div className="reply-input-box">
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
                  cancelReply();
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
              className="cancel-reply"
              onClick={cancelReply}
            >
              <FiX />
            </button>
          </div>
        </div>
      )}

      {/* NESTED REPLIES */}
      {Array.isArray(comment.replies) &&
        comment.replies.length > 0 && (
          <div className="comment-replies">
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
     SELECT IMAGE
     ========================================================= */

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImage(file);
    setShowCreateModal(true);
  };

  /* =========================================================
     CREATE POST
     ========================================================= */

  const handlePost = async () => {
    if (!user?.id) return;

    if (!content.trim() && !image) return;

    try {
      setIsPosting(true);

      let imageUrl = "";

      /* Upload image */

      if (image) {
        const formData = new FormData();

        formData.append("image", image);

        const uploadRes = await axios.post(
          "http://localhost:5000/api/upload",
          formData
        );

        imageUrl = uploadRes.data.imageUrl;
      }

      /* Save post */

      const postRes = await axios.post(
        "http://localhost:5000/api/posts",
        {
          user_id: user.id,
          content: content.trim(),
          image: imageUrl,
        }
      );

      const newPost = {
        id: postRes.data?.id || Date.now(),
        full_name: user.full_name,
        profile_pic: user.profile_pic,
        batch: user.batch,
        content: content.trim(),
        image: imageUrl,
        created_at: new Date().toISOString(),
        likes: 0,
        liked: false,
      };

      setPosts((prev) => [newPost, ...prev]);

      setCommentsMap((prev) => ({
        ...prev,
        [newPost.id]: [],
      }));

      /* Reset */

      setContent("");
      setImage(null);
      setShowCreateModal(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Failed to create post:", err);
    } finally {
      setIsPosting(false);
    }
  };

  /* =========================================================
     CANCEL CREATE
     ========================================================= */

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setImage(null);
    setContent("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =========================================================
     CLOSE VIEW MODAL
     ========================================================= */

const closePostModal = () => {
  setSelectedPost(null);
  setCommentText("");
  setReplyText("");
  setReplyingTo(null);

  if (searchParams.get("post")) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("post");
      return next;
    });
  }
};

  useEffect(() => {
    const postId = Number(searchParams.get("post"));

    if (!postId || !posts.length) {
      return;
    }

    const postFromList = posts.find(
      (post) => Number(post.id) === postId
    );

    if (!postFromList) {
      return;
    }

    openPost(postFromList);
  }, [posts, searchParams]);

  /* =========================================================
     TOTAL COMMENTS
     ========================================================= */

  const totalComments = Object.values(commentsMap).reduce(
    (total, comments) =>
      total + (Array.isArray(comments) ? comments.length : 0),
    0
  );

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="yearbook-dashboard">

      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="dashboard-hero">

        <div className="hero-content">

          <div className="hero-eyebrow">
            <FiBookOpen />
            <span>ADSSU DIGITAL YEARBOOK</span>
          </div>

          <h1>
            Class of{" "}
            <strong>
              {user?.batch || "----"}
            </strong>
          </h1>

          <p>
            Welcome back,{" "}
            <strong>
              {user?.full_name || "Student"}
            </strong>
            . Share your moments and memories
            with your batch.
          </p>

          <div className="hero-meta">

            <div>
              <FiUsers />
              <span>
                Batch {user?.batch || "----"}
              </span>
            </div>

            <div>
              <FiCamera />
              <span>
                Community Memories
              </span>
            </div>

          </div>

        </div>

        <div className="hero-decoration">

          <div className="hero-card hero-card-back">
            <FiImage />
          </div>

          <div className="hero-card hero-card-middle">
            <FiHeart />
          </div>

          <div className="hero-card hero-card-front">

            <div className="mini-card-top">
              MEMORY
            </div>

            <div className="mini-card-title">
              Our Year
            </div>

            <div className="mini-card-line" />

            <span>
              Class of {user?.batch || "----"}
            </span>

          </div>

        </div>

      </section>

      {announcements.length > 0 && (
  <section className="announcement-section">

    <div className="announcement-heading">
      <div>
        <span className="announcement-kicker">
          IMPORTANT UPDATES
        </span>

        <h2>Announcements</h2>

        <p>
          Stay updated with your yearbook participation.
        </p>
      </div>

      <span className="announcement-icon">
        📢
      </span>
    </div>

    <div className="announcement-list">
      {announcements.map((announcement) => (
        <article
          className={`announcement-card ${
            announcement.priority === "important"
              ? "announcement-important"
              : ""
          }`}
          key={announcement.id}
        >

          <div className="announcement-card-icon">
            📢
          </div>

          <div className="announcement-card-content">

            <div className="announcement-card-top">
              <span className="announcement-type">
                {announcement.type === "automatic"
                  ? "AUTOMATED REMINDER"
                  : "ANNOUNCEMENT"}
              </span>

              {announcement.priority === "important" && (
                <span className="announcement-priority">
                  Important
                </span>
              )}
            </div>

            <h3>{announcement.title}</h3>

            <p>{announcement.message}</p>

            <span className="announcement-date">
              {announcement.created_at
                ? new Date(
                    announcement.created_at
                  ).toLocaleDateString()
                : "Today"}
            </span>

          </div>

        </article>
      ))}
    </div>

  </section>
)}

      {/* =====================================================
          MAIN CONTENT
          ===================================================== */}

      <div className="dashboard-grid">

        <main className="community-column">

          {/* =================================================
              FEED HEADER
              ================================================= */}

          <div className="feed-heading">

            <div>
              <span className="feed-kicker">
                BATCH COMMUNITY
              </span>

              <h2>
                Memory Feed
              </h2>

              <p>
                See what your classmates are sharing.
              </p>
            </div>

            <div className="feed-count">
              {posts.length}
              <span>
                {posts.length === 1
                  ? " post"
                  : " posts"}
              </span>
            </div>

          </div>

          {/* =================================================
              CREATE POST CARD
              ================================================= */}

          <section className="facebook-composer">

            <div className="composer-top">

              <div className="avatar composer-avatar">

                {user?.profile_pic ? (
                  <img
                    src={user.profile_pic}
                    alt={user.full_name}
                  />
                ) : (
                  <span>
                    {getInitial(user?.full_name)}
                  </span>
                )}

              </div>

              <button
                type="button"
                className="composer-input"
                onClick={() =>
                  setShowCreateModal(true)
                }
              >
                <span>
                  What’s on your mind?
                </span>
              </button>

            </div>

            <div className="composer-bottom">

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >
                <FiImage />
                <span>Photo</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowCreateModal(true)
                }
              >
                <FiCamera />
                <span>Memory</span>
              </button>

              <input
                type="file"
                hidden
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageSelect}
              />

            </div>

          </section>

          {/* =================================================
              FEED
              ================================================= */}

          <div className="facebook-feed">

            {posts.length === 0 ? (

              <div className="empty-feed">

                <div className="empty-feed-icon">
                  <FiCamera />
                </div>

                <h3>
                  No memories yet
                </h3>

                <p>
                  Be the first person in your batch
                  to share a special moment.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setShowCreateModal(true)
                  }
                >
                  Create a Memory
                </button>

              </div>

            ) : (

              posts.map((post) => {

const comments = commentsMap[post.id] || [];
const commentCount = countComments(comments);

                const likeCount =
                  post.likes || 0;

                return (
                  <article
                    className="facebook-post"
                    key={post.id}
                  >

                    {/* =========================================
                        POST HEADER
                        ========================================= */}

                    <div className="facebook-post-header">

                      <div className="facebook-author">

<button
  type="button"
  className="avatar post-avatar profile-avatar-button"
  onClick={() => openStudentProfile(post)}
  aria-label={`View ${post.full_name}'s profile`}
>
  {post?.profile_pic ? (
    <img
      src={post.profile_pic}
      alt={post.full_name}
    />
  ) : (
    <span>
      {getInitial(post?.full_name)}
    </span>
  )}
</button>

                        <div className="facebook-author-info">

<button
  type="button"
  className="post-author-name"
  onClick={() => openStudentProfile(post)}
>
  {post.full_name}
</button>

                          <div className="post-meta">

                            <span>
                              Class of{" "}
                              {post.batch ||
                                user?.batch ||
                                "----"}
                            </span>

                            <span className="meta-dot">
                              ·
                            </span>

                            <span>
                              {formatTime(
                                post.created_at
                              )}
                            </span>

                          </div>

                        </div>

                      </div>

                      <button
                        type="button"
                        className="post-more"
                        aria-label="More options"
                      >
                        <FiMoreHorizontal />
                      </button>

                    </div>

                    {/* =========================================
                        POST TEXT
                        ========================================= */}

                    {post.content && (
                      <div className="facebook-post-text">
                        {post.content}
                      </div>
                    )}

                    {/* =========================================
                        POST IMAGE
                        ========================================= */}

                    {post.image && (
                      <div
                        className="facebook-post-image"
                        onClick={() =>
                          openPost(post)
                        }
                      >
                        <img
                          src={post.image}
                          alt="Shared memory"
                        />
                      </div>
                    )}

                    {/* =========================================
                        REACTION SUMMARY
                        ========================================= */}

                    {(likeCount > 0 ||
                      commentCount > 0) && (

                      <div className="post-reaction-summary">

                        <div className="reaction-left">

                          {likeCount > 0 && (
                            <>
                              <span className="reaction-circle">
                                <FiHeart />
                              </span>

                              <span>
                                {likeCount}
                              </span>
                            </>
                          )}

                        </div>

                        <div className="reaction-right">

                          {commentCount > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                openPost(post)
                              }
                            >
                              {commentCount}{" "}
                              {commentCount === 1
                                ? "comment"
                                : "comments"}
                            </button>
                          )}

                        </div>

                      </div>

                    )}

                    {/* =========================================
                        POST ACTIONS
                        ========================================= */}

                    <div className="facebook-post-actions">

<button
  type="button"
  className={
    post.liked
      ? "post-action liked"
      : "post-action"
  }
  onClick={() => handleReact(post.id)}
>
  <FiHeart
    className="heart-icon"
    fill={post.liked ? "currentColor" : "none"}
  />
  <span>
    {post.liked ? "Liked" : "Like"}
  </span>
</button>

                      <button
                        type="button"
                        className="post-action"
                        onClick={() =>
                          openPost(post)
                        }
                      >
                        <FiMessageCircle />

                        <span>
                          Comment
                        </span>
                      </button>

                     
                     

                    </div>

                    {/* =========================================
                        PEOPLE WHO LIKED
                        ========================================= */}

                    {likeCount > 0 && (
                      <div className="people-liked">

                        <div className="mini-like-icons">

                          <span>
                            <FiHeart />
                          </span>

                          {likeCount > 1 && (
                            <span>
                              <FiHeart />
                            </span>
                          )}

                        </div>

                        <span>
                          {user?.full_name || "Someone"}

                          {likeCount > 1 &&
                            ` and ${
                              likeCount - 1
                            } ${
                              likeCount - 1 === 1
                                ? "other"
                                : "others"
                            }`}
                        </span>
                      </div>
                    )}

                    {/* =========================================
                        COMMENTS PREVIEW
                        ========================================= */}

                    {commentCount > 0 && (
                      <div className="comments-preview">

                        <button
                          type="button"
                          className="view-comments"
                          onClick={() =>
                            openPost(post)
                          }
                        >
                          View all{" "}
                          {commentCount}{" "}
                          {commentCount === 1
                            ? "comment"
                            : "comments"}
                        </button>

                        {comments
                          .slice(0, 2)
                          .map(
                            (
                              comment,
                              index
                            ) => (
                              <div
                                className="preview-comment"
                                key={index}
                              >

                                <div className="avatar comment-avatar">

                                  {comment.profile_pic ? (
                                    <img
                                      src={
                                        comment.profile_pic
                                      }
                                      alt=""
                                    />
                                  ) : (
                                    <span>
                                      {getInitial(
                                        comment.full_name
                                      )}
                                    </span>
                                  )}

                                </div>

                                <div className="preview-comment-body">

                                  <strong>
                                    {
                                      comment.full_name
                                    }
                                  </strong>

                                  <p>
                                    {
                                      comment.comment
                                    }
                                  </p>

                                </div>

                              </div>
                            )
                          )}

                      </div>
                    )}

                  </article>
                );
              })

            )}

          </div>

        </main>



      </div>

{/* =====================================================
    VIEW POST MODAL
    Different layout for text-only and photo posts
    ===================================================== */}
{selectedPost && (
  <div
    className={`memory-modal-overlay ${
      selectedPost.image
        ? "has-photo-post"
        : "text-only-post"
    }`}
    onClick={closePostModal}
  >
    <div
      className={`memory-modal ${
        selectedPost.image
          ? "photo-post-modal"
          : "text-post-modal"
      }`}
      onClick={(e) => e.stopPropagation()}
    >

      {/* =================================================
          MODAL TOP BAR
          ================================================= */}
      <div className="memory-modal-topbar">

        <button
          type="button"
          className="modal-back-button"
          onClick={closePostModal}
        >
          <FiArrowLeft />
        </button>

        <div className="modal-top-title">
          <span>
            {selectedPost.image
              ? "YEARBOOK MEMORY"
              : "BATCH POST"}
          </span>

          <strong>
            Class of{" "}
            {selectedPost.batch ||
              user?.batch ||
              "----"}
          </strong>
        </div>

        <button
          type="button"
          className="memory-modal-close"
          onClick={closePostModal}
        >
          <FiX />
        </button>

      </div>

      {/* =================================================
          PHOTO POST MODAL
          ================================================= */}
      {selectedPost.image ? (
        <div className="memory-modal-content photo-modal-content">

          {/* PHOTO */}
          <div className="memory-modal-image photo-modal-image">
            <img
              src={selectedPost.image}
              alt="Shared memory"
            />
          </div>

          {/* DETAILS */}
          <div className="memory-modal-details">

            {/* AUTHOR */}
            <div className="modal-author">

              <div className="avatar modal-avatar">
                {selectedPost.profile_pic ? (
                  <img
                    src={selectedPost.profile_pic}
                    alt=""
                  />
                ) : (
                  <span>
                    {getInitial(
                      selectedPost.full_name
                    )}
                  </span>
                )}
              </div>

              <div className="modal-author-info">
                <h3>
                  {selectedPost.full_name}
                </h3>

                <span>
                  Class of{" "}
                  {selectedPost.batch ||
                    user?.batch ||
                    "----"}{" "}
                  ·{" "}
                  {formatTime(
                    selectedPost.created_at
                  )}
                </span>
              </div>

            </div>

            {/* CAPTION */}
            {selectedPost.content && (
              <div className="modal-story photo-caption">
                {selectedPost.content}
              </div>
            )}

            {/* REACTIONS */}
            <div className="modal-reactions">

<button
  type="button"
  className={
    selectedPost.liked
      ? "modal-react liked"
      : "modal-react"
  }
  onClick={() =>
    handleReact(selectedPost.id)
  }
>
  <FiHeart
    className="heart-icon"
    fill={
      selectedPost.liked
        ? "currentColor"
        : "none"
    }
  />

  <span>
    {selectedPost.likes || 0}
  </span>

  <small>
    {selectedPost.liked ? "Liked" : "Likes"}
  </small>
</button>

              <div className="modal-react">
                <FiMessageCircle />

                <span>
  {countComments(
    commentsMap[selectedPost.id] || []
  )}
</span>

                <small>
                  Comments
                </small>
              </div>

            </div>

            {/* DISCUSSION */}
            <div className="discussion-heading">
              <div>
                <span>
                  Class Discussion
                </span>

                <small>
                  Continue the conversation
                </small>
              </div>

             <strong>
  {countComments(
    commentsMap[selectedPost.id] || []
  )}
</strong>
            </div>

{/* COMMENTS */}
<div className="comments-area">
  {(commentsMap[selectedPost.id] || []).length === 0 ? (
    <div className="no-comments">
      <div className="no-comments-icon">
        <FiMessageCircle />
      </div>

      <strong>No discussion yet</strong>

      <span>
        Start the conversation with your classmates.
      </span>
    </div>
  ) : (
    <div className="comments-list">
      {(commentsMap[selectedPost.id] || []).map(
        (comment) => renderComment(comment)
      )}
    </div>
  )}
</div>

            {/* COMMENT INPUT */}
            <div className="comment-input">

              <div className="avatar input-avatar">

                {user?.profile_pic ? (
                  <img
                    src={user.profile_pic}
                    alt=""
                  />
                ) : (
                  <span>
                    {getInitial(
                      user?.full_name
                    )}
                  </span>
                )}

              </div>

              <div className="comment-input-box">

                <input
                  value={commentText}
                  onChange={(e) =>
                    setCommentText(
                      e.target.value
                    )
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

                <FiSmile />

                <button
                  type="button"
                  onClick={handleComment}
                  disabled={
                    !commentText.trim()
                  }
                >
                  <FiSend />
                </button>

              </div>

            </div>

          </div>
        </div>

      ) : (

        /* =================================================
           TEXT-ONLY POST MODAL
           ================================================= */
        <div className="memory-modal-content text-modal-content">

          {/* TEXT POST HEADER */}
          <div className="text-post-header">

            <div className="modal-author">

              <div className="avatar modal-avatar">
                {selectedPost.profile_pic ? (
                  <img
                    src={selectedPost.profile_pic}
                    alt=""
                  />
                ) : (
                  <span>
                    {getInitial(
                      selectedPost.full_name
                    )}
                  </span>
                )}
              </div>

              <div className="modal-author-info">

                <h3>
                  {selectedPost.full_name}
                </h3>

                <span>
                  Class of{" "}
                  {selectedPost.batch ||
                    user?.batch ||
                    "----"}{" "}
                  ·{" "}
                  {formatTime(
                    selectedPost.created_at
                  )}
                </span>

              </div>

            </div>

          </div>

          {/* LARGE TEXT */}
          <div className="text-post-body">

            <div className="text-post-mark">
              “
            </div>

            <p>
              {selectedPost.content}
            </p>

          </div>

          {/* TEXT POST REACTIONS */}
          <div className="modal-reactions text-post-reactions">

            <button
              type="button"
              className={
                selectedPost.liked
                  ? "modal-react liked"
                  : "modal-react"
              }
              onClick={() =>
                handleReact(
                  selectedPost.id
                )
              }
            >
<FiHeart
  className="heart-icon"
  fill={
    selectedPost.liked
      ? "currentColor"
      : "none"
  }
/>

<span>
  {selectedPost.likes || 0}
</span>

<small>
  {selectedPost.liked ? "Liked" : "Likes"}
</small>
            </button>

            <div className="modal-react">

              <FiMessageCircle />

             <span>
  {countComments(
    commentsMap[selectedPost.id] || []
  )}
</span>

              <small>
                Comments
              </small>

            </div>

          </div>

          {/* DISCUSSION */}
          <div className="discussion-heading">

            <div>
              <span>
                Class Discussion
              </span>

              <small>
                Continue the conversation
              </small>
            </div>

           <strong>
  {countComments(
    commentsMap[selectedPost.id] || []
  )}
</strong>

          </div>

          {/* COMMENTS */}
<div className="comments-area">
  {(commentsMap[selectedPost.id] || []).length === 0 ? (
    <div className="no-comments">
      <div className="no-comments-icon">
        <FiMessageCircle />
      </div>

      <strong>No discussion yet</strong>

      <span>
        Start the conversation with your classmates.
      </span>
    </div>
  ) : (
    <div className="comments-list">
      {(commentsMap[selectedPost.id] || []).map(
        (comment) => renderComment(comment)
      )}
    </div>
  )}
</div>

          {/* COMMENT INPUT */}
          <div className="comment-input">

            <div className="avatar input-avatar">

              {user?.profile_pic ? (
                <img
                  src={user.profile_pic}
                  alt=""
                />
              ) : (
                <span>
                  {getInitial(
                    user?.full_name
                  )}
                </span>
              )}

            </div>

            <div className="comment-input-box">

              <input
                value={commentText}
                onChange={(e) =>
                  setCommentText(
                    e.target.value
                  )
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

              <FiSmile />

              <button
                type="button"
                onClick={handleComment}
                disabled={
                  !commentText.trim()
                }
              >
                <FiSend />
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  </div>
)}


      {/* =====================================================
          CREATE MEMORY MODAL
          ===================================================== */}

      {showCreateModal && (

        <div
          className="create-memory-overlay"
          onClick={closeCreateModal}
        >

          <div
            className="create-memory-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* ===============================================
                CREATE HEADER
                =============================================== */}

            <div className="create-memory-header">

              <div className="create-title-area">

                <span>
                  CREATE MEMORY
                </span>

                <h2>
                  Share with your batch
                </h2>

              </div>

              <button
                type="button"
                onClick={closeCreateModal}
              >
                <FiX />
              </button>

            </div>

            {/* ===============================================
                CREATE BODY
                =============================================== */}

            <div className="create-memory-body">

              <div className="create-memory-author">

                <div className="avatar create-avatar">

                  {user?.profile_pic ? (
                    <img
                      src={user.profile_pic}
                      alt=""
                    />
                  ) : (
                    <span>
                      {getInitial(
                        user?.full_name
                      )}
                    </span>
                  )}

                </div>

                <div>

                  <strong>
                    {user?.full_name ||
                      "Student"}
                  </strong>

                  <span>
                    Class of{" "}
                    {user?.batch || "----"}
                  </span>

                </div>

              </div>

              <textarea
                className="memory-caption"
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) =>
                  setContent(e.target.value)
                }
              />

              {/* =============================================
                  PHOTO PREVIEW
                  ============================================= */}

              {image ? (

                <div className="create-photo-preview">

                  <img
                    src={URL.createObjectURL(
                      image
                    )}
                    alt="Preview"
                  />

                  <button
                    type="button"
                    className="remove-preview"
                    onClick={() => {
                      setImage(null);

                      if (
                        fileInputRef.current
                      ) {
                        fileInputRef.current.value =
                          "";
                      }
                    }}
                  >
                    <FiX />
                  </button>

                  <div className="preview-photo-label">
                    <FiImage />
                    Photo attached
                  </div>

                </div>

              ) : (

                <button
                  type="button"
                  className="add-photo-area"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                >

                  <div className="add-photo-icon">
                    <FiImage />
                  </div>

                  <strong>
                    Add a photo
                  </strong>

                  <span>
                    Share a moment from your
                    school year
                  </span>

                </button>

              )}

              {/* =============================================
                  CREATE ACTIONS
                  ============================================= */}

              <div className="create-memory-footer">

                <button
                  type="button"
                  className="add-photo-button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                >
                  <FiImage />

                  {image
                    ? "Change photo"
                    : "Add photo"}
                </button>

                <button
                  type="button"
                  className="share-memory-button"
                  disabled={
                    isPosting ||
                    (!content.trim() &&
                      !image)
                  }
                  onClick={handlePost}
                >
                  <FiSend />

                  {isPosting
                    ? "Sharing..."
                    : "Share"}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default StudentDashboard;