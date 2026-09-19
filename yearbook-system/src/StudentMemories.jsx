import { useState, useEffect, useRef } from "react";
import axios from "axios";
import useAuth from "./hooks/useAuth";

import {
  FiUpload,
  FiImage,
  FiClock,
  FiCheckCircle,
  FiX,
  FiTrash2,
  FiSend,
  FiMessageCircle,
} from "react-icons/fi";

import "./memo.css";

const API_URL = "http://localhost:5000";

const MAX_FILES = 20;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_MESSAGE_LENGTH = 500;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export default function StudentMemories() {
  // =====================================================
  // STATE
  // =====================================================

  const [activeTab, setActiveTab] = useState("pending");

  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);

  const [uploads, setUploads] = useState([]);

  const [uploading, setUploading] = useState(false);
const [loadingMemories, setLoadingMemories] = useState(false);

const fileInputRef = useRef(null);

// =====================================================
// GET LOGGED-IN USER FROM AUTH
// =====================================================
const { user } = useAuth();

const userRole = String(user?.role || "").trim().toLowerCase();

const isFaculty = userRole === "faculty";
const isStudent = userRole === "student";

console.log("========== MEMORY ROLE DEBUG ==========");
console.log("USER FROM useAuth:", user);
console.log("ROLE FROM USER:", user?.role);
console.log("NORMALIZED ROLE:", userRole);
console.log("IS STUDENT:", isStudent);
console.log("IS FACULTY:", isFaculty);
console.log("========================================");  // =====================================================
  // FETCH MEMORIES
  // =====================================================

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      setLoadingMemories(true);

      const response = await axios.get(
        `${API_URL}/api/memories`,
        {
          withCredentials: true,
        }
      );

      const memories = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.memories)
        ? response.data.memories
        : [];

      setUploads(memories);
    } catch (error) {
      console.error("❌ FETCH MEMORIES ERROR:", error);

      setUploads([]);

      if (error.response?.status === 401) {
        console.warn("⚠️ User is not authenticated.");
      }
    } finally {
      setLoadingMemories(false);
    }
  };

  // =====================================================
  // CLEAN UP PREVIEW URLS
  // =====================================================

  useEffect(() => {
    return () => {
      files.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [files]);

  // =====================================================
  // FILE SELECTION
  // STUDENT ONLY
  // =====================================================

const handleFileChange = (event) => {
  const selectedFiles = Array.from(event.target.files || []);

  if (selectedFiles.length === 0) {
    return;
  }
    // ---------------------------------------------------
    // MAX FILE COUNT
    // ---------------------------------------------------

    if (files.length + selectedFiles.length > MAX_FILES) {
      alert(
        `You can upload a maximum of ${MAX_FILES} images at once.`
      );

      event.target.value = "";
      return;
    }

    // ---------------------------------------------------
    // FILE TYPE VALIDATION
    // ---------------------------------------------------

    const invalidFiles = selectedFiles.filter(
      (file) => !ALLOWED_TYPES.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      alert(
        "Only JPG, JPEG, PNG, and WEBP images are allowed."
      );

      event.target.value = "";
      return;
    }

    // ---------------------------------------------------
    // FILE SIZE VALIDATION
    // ---------------------------------------------------

    const oversizedFiles = selectedFiles.filter(
      (file) => file.size > MAX_FILE_SIZE
    );

    if (oversizedFiles.length > 0) {
      alert(
        "Each image must be smaller than 10MB."
      );

      event.target.value = "";
      return;
    }

    // ---------------------------------------------------
    // PREVENT DUPLICATES
    // ---------------------------------------------------

    const existingKeys = new Set(
      files.map(
        (item) =>
          `${item.file.name}-${item.file.size}-${item.file.lastModified}`
      )
    );

    const newFiles = selectedFiles.filter((file) => {
      const key = `${file.name}-${file.size}-${file.lastModified}`;

      return !existingKeys.has(key);
    });

    if (newFiles.length === 0) {
      event.target.value = "";
      return;
    }

    // ---------------------------------------------------
    // CREATE PREVIEW URL
    // ---------------------------------------------------

    const filesWithPreview = newFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setFiles((previousFiles) => [
      ...previousFiles,
      ...filesWithPreview,
    ]);

    // Allow selecting the same file again later
    event.target.value = "";
  };

  // =====================================================
  // REMOVE ONE FILE
  // =====================================================

  const removeFile = (indexToRemove) => {
    setFiles((previousFiles) => {
      const fileToRemove =
        previousFiles[indexToRemove];

      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(
          fileToRemove.previewUrl
        );
      }

      return previousFiles.filter(
        (_, index) => index !== indexToRemove
      );
    });
  };

  // =====================================================
  // CLEAR ALL FILES
  // =====================================================

  const clearFiles = () => {
    files.forEach((item) => {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });

    setFiles([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =====================================================
  // OPEN FILE PICKER
  // STUDENT ONLY
  // =====================================================

  const openFilePicker = () => {
    if (!isStudent || uploading) {
      return;
    }

    fileInputRef.current?.click();
  };

  // =====================================================
  // SUBMIT MEMORY / FACULTY MESSAGE
  // =====================================================

  const handleUpload = async () => {
    // ---------------------------------------------------
    // VALIDATE MESSAGE
    // ---------------------------------------------------

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      alert(
        isFaculty
          ? "Please write your faculty message."
          : "Please write a message."
      );

      return;
    }

    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      alert(
        `Your message must not exceed ${MAX_MESSAGE_LENGTH} characters.`
      );

      return;
    }

    // ---------------------------------------------------
    // STUDENT MUST HAVE IMAGE
    // FACULTY DOES NOT NEED IMAGE
    // ---------------------------------------------------

    if (isStudent && files.length === 0) {
      alert("Please select at least one image.");
      return;
    }

    if (uploading) {
      return;
    }

    // ---------------------------------------------------
    // FORM DATA
    // ---------------------------------------------------

    const formData = new FormData();

    /*
      STUDENT:
      images + message

      FACULTY:
      message ONLY
    */

    if (isStudent) {
      files.forEach((item) => {
        formData.append("images", item.file);
      });
    }

    formData.append("message", trimmedMessage);

    try {
      setUploading(true);

      console.log(
        "=========================================="
      );

      if (isFaculty) {
        console.log(
          "💬 SUBMITTING FACULTY MESSAGE"
        );
        console.log("🖼️ IMAGES: NOT ALLOWED");
      } else {
        console.log(
          "📸 UPLOADING STUDENT MEMORIES"
        );
        console.log(
          "🖼️ NUMBER OF IMAGES:",
          files.length
        );
      }

      console.log("💬 MESSAGE:", trimmedMessage);

      console.log(
        "=========================================="
      );

      const response = await axios.post(
        `${API_URL}/api/memories`,
        formData,
        {
          withCredentials: true,
        }
      );

      console.log(
        "✅ SUBMISSION SUCCESS:",
        response.data
      );

      alert(
        response.data?.message ||
          (isFaculty
            ? "Your faculty message has been submitted successfully!"
            : "Your memories have been uploaded successfully!")
      );

      // ---------------------------------------------------
      // CLEAR FORM
      // ---------------------------------------------------

      clearFiles();
      setMessage("");

      // ---------------------------------------------------
      // REFRESH
      // ---------------------------------------------------

      await fetchMemories();

      setActiveTab("pending");
    } catch (error) {
      console.error(
        "❌ MEMORY SUBMISSION ERROR:",
        error
      );

      const status = error.response?.status;

      const serverMessage =
        error.response?.data?.message;

      if (status === 401) {
        alert(
          "Your session has expired. Please log in again."
        );

        return;
      }

      if (status === 403) {
        alert(
          serverMessage ||
            "Your account is not allowed to submit memories."
        );

        return;
      }

      if (status === 413) {
        alert(
          serverMessage ||
            "One or more images are too large. Each image must be smaller than 10MB."
        );

        return;
      }

      if (status === 400) {
        alert(
          serverMessage ||
            "Please check your message and selected images."
        );

        return;
      }

      if (status >= 500) {
        alert(
          "The server could not save your submission. Please try again."
        );

        return;
      }

      alert(
        serverMessage ||
          "Failed to submit. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  // =====================================================
  // FILTER MEMORIES
  // =====================================================

  const filteredUploads = uploads.filter(
    (item) => item.status === activeTab
  );

  // =====================================================
  // COUNTS
  // =====================================================

  const pendingCount = uploads.filter(
    (item) => item.status === "pending"
  ).length;

  const approvedCount = uploads.filter(
    (item) => item.status === "approved"
  ).length;

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="memories-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="memories-header">
        <div>
          <span className="memories-label">
            ADSSU YEARBOOK
          </span>

          <h1>
            {isFaculty
              ? "Faculty Message"
              : "Memories"}
          </h1>

          <p>
            {isFaculty
              ? "Share a meaningful message with the graduating students."
              : "Capture the moments that made your student journey meaningful."}
          </p>
        </div>
      </div>

      {/* =================================================
          SUBMISSION CARD
      ================================================= */}

      <div className="upload-card-box">

        {/* HEADER */}

        <div className="upload-card-header">

          <div className="upload-icon">
            {isFaculty ? (
              <FiMessageCircle />
            ) : (
              <FiUpload />
            )}
          </div>

          <div>
            <h2>
              {isFaculty
                ? "Share Your Message"
                : "Share Your Memories"}
            </h2>

            <p>
              {isFaculty
                ? "Write a meaningful message for the yearbook."
                : "Select multiple photos and add one message to remember the moment."}
            </p>
          </div>

        </div>

        {/* =================================================
            STUDENT IMAGE UPLOAD ONLY
        ================================================= */}

        {isStudent && (
          <>
            {/* FILE UPLOAD AREA */}

            <div className="memory-upload-area">

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleFileChange}
                disabled={uploading}
                className="memory-file-input"
              />

              <div
                className="upload-drop-content"
                onClick={openFilePicker}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    openFilePicker();
                  }
                }}
              >

                <div className="large-upload-icon">
                  <FiImage />
                </div>

                <h3>
                  Choose your photos
                </h3>

                <p>
                  Select multiple images from your device
                </p>

                <span>
                  JPG, JPEG, PNG or WEBP • Max 10MB
                  each • Up to 20 images
                </span>

                <button
                  type="button"
                  className="choose-images-btn"
                  disabled={uploading}
                  onClick={(event) => {
                    event.stopPropagation();
                    openFilePicker();
                  }}
                >
                  <FiImage />
                  Choose Images
                </button>

              </div>
            </div>

            {/* =================================================
                SELECTED IMAGES
            ================================================= */}

            {files.length > 0 && (
              <div className="selected-images-section">

                <div className="selected-images-header">

                  <div>
                    <h3>
                      Selected Photos
                    </h3>

                    <span>
                      {files.length}{" "}
                      {files.length === 1
                        ? "image"
                        : "images"}{" "}
                      selected
                    </span>
                  </div>

                  <button
                    type="button"
                    className="clear-images-btn"
                    onClick={clearFiles}
                    disabled={uploading}
                  >
                    <FiTrash2 />
                    Clear All
                  </button>

                </div>

                <div className="selected-images-grid">

                  {files.map((item, index) => (
                    <div
                      className="selected-image-item"
                      key={`${item.file.name}-${item.file.size}-${item.file.lastModified}`}
                    >

                      <img
                        src={item.previewUrl}
                        alt={`Selected memory ${
                          index + 1
                        }`}
                      />

                      <div className="image-number">
                        {index + 1}
                      </div>

                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() =>
                          removeFile(index)
                        }
                        disabled={uploading}
                        aria-label={`Remove ${item.file.name}`}
                      >
                        <FiX />
                      </button>

                      <div className="image-file-name">
                        {item.file.name}
                      </div>

                    </div>
                  ))}

                </div>
              </div>
            )}
          </>
        )}

        {/* =================================================
            MESSAGE
        ================================================= */}

        <div className="memory-message-section">

          <div className="message-label-row">

            <label htmlFor="memory-message">

              <FiMessageCircle />

              {isFaculty
                ? "Faculty Message"
                : "Memory Message"}

            </label>

            <span
              className={
                message.length >
                MAX_MESSAGE_LENGTH
                  ? "character-limit exceeded"
                  : "character-limit"
              }
            >
              {message.length}/
              {MAX_MESSAGE_LENGTH}
            </span>

          </div>

          <textarea
            id="memory-message"
            className="memory-message-input"
            placeholder={
              isFaculty
                ? "Write a meaningful message for the graduating students..."
                : "Write something meaningful about these memories..."
            }
            value={message}
            maxLength={MAX_MESSAGE_LENGTH}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            disabled={uploading}
            rows={5}
          />

          <p className="message-helper">
            {isFaculty
              ? "Your message will be reviewed by the yearbook administrator before publication."
              : "This message will be attached to all selected photos."}
          </p>

        </div>

        {/* =================================================
            SUBMIT BUTTON
        ================================================= */}

        <button
          type="button"
          className={`upload-memory-btn ${
            uploading ? "uploading" : ""
          }`}
          onClick={handleUpload}
          disabled={
            uploading ||
            !message.trim() ||
            (isStudent && files.length === 0)
          }
        >

          {uploading ? (
            <>
              <span className="upload-spinner"></span>

              {isFaculty
                ? "Sending..."
                : `Uploading ${files.length} ${
                    files.length === 1
                      ? "memory"
                      : "memories"
                  }...`}
            </>
          ) : (
            <>
              <FiSend />

              {isFaculty
                ? "Send Faculty Message"
                : `Upload ${
                    files.length > 0
                      ? `${files.length} ${
                          files.length === 1
                            ? "Memory"
                            : "Memories"
                        }`
                      : "Memory"
                  }`}
            </>
          )}

        </button>

      </div>

      {/* =================================================
          MY SUBMISSIONS
      ================================================= */}

      <div className="memories-section">

        <div className="memories-section-header">

          <div>

            <h2>
              {isFaculty
                ? "My Messages"
                : "My Memories"}
            </h2>

            <p>
              {isFaculty
                ? "View the messages you submitted for the yearbook."
                : "View the memories you submitted for the yearbook."}
            </p>

          </div>

        </div>

        {/* =================================================
            TABS
        ================================================= */}

        <div className="tab-switch">

          <button
            type="button"
            className={
              activeTab === "pending"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("pending")
            }
          >
            <FiClock />

            <span>
              Pending
            </span>

            <strong>
              {pendingCount}
            </strong>
          </button>

          <button
            type="button"
            className={
              activeTab === "approved"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("approved")
            }
          >
            <FiCheckCircle />

            <span>
              Approved
            </span>

            <strong>
              {approvedCount}
            </strong>
          </button>

        </div>

        {/* =================================================
            SUBMISSIONS GRID
        ================================================= */}

        <div className="upload-grid">

          {loadingMemories ? (
            <div className="memories-loading">

              <div className="memory-loading-spinner"></div>

              <p>
                Loading your submissions...
              </p>

            </div>
          ) : filteredUploads.length === 0 ? (
            <div className="memories-empty">

              <div className="empty-memory-icon">
                {isFaculty ? (
                  <FiMessageCircle />
                ) : (
                  <FiImage />
                )}
              </div>

              <h3>
                No {activeTab}{" "}
                {isFaculty
                  ? "messages"
                  : "memories"}
              </h3>

              <p>
                {activeTab === "pending"
                  ? isFaculty
                    ? "Your submitted messages will appear here while waiting for approval."
                    : "Your submitted memories will appear here while waiting for approval."
                  : isFaculty
                  ? "Approved messages will appear here once they are reviewed."
                  : "Approved memories will appear here once they are reviewed."}
              </p>

            </div>
          ) : (
            filteredUploads.map((item) => (
              <div
                className="memory-card"
                key={item.id}
              >

                {/* =================================================
                    IMAGE
                    ONLY SHOWN IF DATABASE HAS IMAGE
                ================================================= */}

                {item.image ? (
                  <div className="memory-card-image">

                    <img
                      src={item.image}
                      alt="Student memory"
                    />

                    <span
                      className={`memory-status ${item.status}`}
                    >
                      {item.status === "approved" ? (
                        <>
                          <FiCheckCircle />
                          Approved
                        </>
                      ) : (
                        <>
                          <FiClock />
                          Pending
                        </>
                      )}
                    </span>

                  </div>
                ) : (
                  /* =================================================
                     FACULTY MESSAGE CARD
                  ================================================= */

                  <div className="memory-card-no-image">

                    <FiMessageCircle />

                    <span
                      className={`memory-status ${item.status}`}
                    >
                      {item.status === "approved" ? (
                        <>
                          <FiCheckCircle />
                          Approved
                        </>
                      ) : (
                        <>
                          <FiClock />
                          Pending
                        </>
                      )}
                    </span>

                  </div>
                )}

                {/* =================================================
                    CONTENT
                ================================================= */}

                <div className="memory-content">

                  {/* USER */}

                  <div className="memory-user">

                    {item.profile_pic ? (
                      <img
                        src={item.profile_pic}
                        alt={
                          item.full_name ||
                          "User"
                        }
                      />
                    ) : (
                      <div className="memory-avatar">
                        {(
                          item.full_name ||
                          "U"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}

                    <div>

                      <h4>
                        {item.full_name ||
                          "You"}
                      </h4>

                      <span>
                        {formatDate(
                          item.created_at
                        )}
                      </span>

                    </div>

                  </div>

                  {/* MESSAGE */}

                  {item.message && (
                    <p className="memory-message">
                      {item.message}
                    </p>
                  )}

                </div>

              </div>
            ))
          )}

        </div>

      </div>

    </div>
  );
}