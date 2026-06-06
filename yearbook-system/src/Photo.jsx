import { useState } from "react";
import {
  FaCloudUploadAlt,
  FaImages,
 
} from "react-icons/fa";
import "./photo.css";

function Photos() {
  const [files] = useState([]);

  return (
    <div className="photo-page">
      {/* HEADER */}
      <div className="photo-hero">
        <div>
          <span className="hero-badge">Yearbook Management</span>
          <h1>Photo Upload Center</h1>
          <p>
            Upload, organize, and process student yearbook photos in one clean
            workspace.
          </p>
        </div>

        <div className="hero-stats">
          <div className="photo-stat-card">
            <FaImages className="stat-icon" />
            <div>
              <h3>{files.length}</h3>
              <span>Total Files</span>
            </div>
          </div>


        </div>
      </div>

{/* MAIN CONTENT */}
<div className="photo-layout">

  <div className="upload-panel">
    
    {/* Upload Header */}
    <div className="section-title">
      <h2>Upload Photos</h2>
      <p>Select multiple images for batch processing</p>
    </div>

    {/* DROP ZONE */}
    <label className="drop-zone">
      <input
        type="file"
        multiple
        accept="image/png, image/jpeg, image/webp"
      />

      <div className="drop-content">
        <div className="upload-icon-wrapper">
          <FaCloudUploadAlt className="upload-icon" />
        </div>

        <h3>Drag & Drop Images</h3>

        <p>
          or <span>browse files</span> from your computer
        </p>

        <div className="file-types">
          Supported: PNG • JPG • JPEG • WEBP
        </div>
      </div>
    </label>

    {/* QUEUE SECTION */}
    <div className="queue-section">
      <div className="section-title queue-title">
        <h2>Upload Queue</h2>
        <p>Preview selected files before processing</p>
      </div>

      {files.length === 0 ? (
        <div className="empty-state">
          <FaImages className="empty-icon" />
          <h3>No Photos Selected</h3>
          <p>Your uploaded images will appear here.</p>
        </div>
      ) : (
        <div className="queue-grid">
          {files.map((file, index) => (
            <div className="queue-card" key={index}>
              <div className="card-top">
                <div className="image-placeholder">
                  {file.name.charAt(0).toUpperCase()}
                </div>

                <div className="file-info">
                  <h4>{file.name}</h4>
                  <span>
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>

              <div className="status success-status">
                Ready to Upload
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

  </div>

</div>
    </div>
  );
}

export default Photos;