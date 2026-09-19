import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { downloadYearbookPDF } from "../../utils/yearbookPdf";
import "./yearbooks.css";

function Yearbooks() {
  const navigate = useNavigate();

  const [drafts, setDrafts] = useState([]);
  const [published, setPublished] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);

const handleDownloadPDF = async (item) => {
  try {
    setDownloadingId(item.id);

    console.log("📄 Starting PDF generation:", item.title);
    console.log("📦 Raw pages:", item.pages);
    console.log("📦 Pages type:", typeof item.pages);

    let pages = item.pages;

    // MariaDB returns LONGTEXT as a string
    if (typeof pages === "string") {
      try {
        pages = JSON.parse(pages);
      } catch (error) {
        console.error("❌ Failed to parse pages JSON:", error);
        alert("The yearbook pages data is invalid.");
        return;
      }
    }

    if (!Array.isArray(pages) || pages.length === 0) {
      alert(
        "This yearbook does not contain any pages to export."
      );
      return;
    }

    console.log(`📚 ${pages.length} pages ready for PDF`);

    await downloadYearbookPDF(
      pages,
      item.title || "Yearbook"
    );

    console.log("✅ PDF downloaded successfully.");
  } catch (error) {
    console.error("❌ Failed to generate PDF:", error);

    alert(
      error.message ||
      "Failed to generate the PDF. Please try again."
    );
  } finally {
    setDownloadingId(null);
  }
};


const handleDelete = async (id, title) => {

  
  const confirmed = window.confirm(
    `Are you sure you want to delete "${title || "this yearbook"}"?\n\nThis action cannot be undone.`
  );

  if (!confirmed) {
    return;
  }

  try {

    const res = await axios.delete(
      `http://localhost:5000/api/yearbooks/${id}`
    );

    console.log(
      "✅ Yearbook deleted:",
      res.data
    );

    // Refresh the lists
    await fetchYearbooks();

  } catch (err) {

    console.error(
      "❌ Failed to delete yearbook:",
      err
    );

    alert(
      err.response?.data?.message ||
      "Failed to delete yearbook. Please try again."
    );
  }
};

  useEffect(() => {
    fetchYearbooks();
  }, []);

const fetchYearbooks = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5000/api/yearbooks"
    );

    console.log("📚 Yearbooks API response:", res.data);

    const yearbooks = Array.isArray(res.data?.yearbooks)
      ? res.data.yearbooks
      : [];

    console.log("📚 All yearbooks:", yearbooks);

    const draftYearbooks = yearbooks.filter(
      (item) => String(item.status).toLowerCase() === "draft"
    );

    const publishedYearbooks = yearbooks.filter(
      (item) => String(item.status).toLowerCase() === "published"
    );

    console.log("📝 Drafts:", draftYearbooks);
    console.log("✅ Published:", publishedYearbooks);

    setDrafts(draftYearbooks);
    setPublished(publishedYearbooks);

  } catch (err) {
    console.error(
      "❌ Failed to fetch yearbooks:",
      err.response?.data || err.message
    );

    setDrafts([]);
    setPublished([]);
  }
};

  /* =====================================================
     FORMAT DATE
     ===================================================== */

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  return (
    <div className="yearbooks-page">

      {/* =================================================
          PAGE HEADER
          ================================================= */}

      <div className="page-header">

        <div className="page-title-area">
          <span className="page-eyebrow">
            YEARBOOK MANAGEMENT
          </span>

          <h2>Yearbooks</h2>

          <p>
            Create, manage, and publish official
            school yearbooks.
          </p>
        </div>

        <button
          className="create-btn"
          onClick={() =>
            navigate("/admin/design")
          }
        >
          <span className="create-icon">+</span>

          Create Blank Yearbook
        </button>

      </div>


      {/* =================================================
          DRAFT YEARBOOKS
          ================================================= */}

      <section className="yearbook-section">

        <div className="section-heading">

          <div className="section-title">

            <span className="section-line"></span>

            <div>
              <h3>Draft Yearbooks</h3>

              <p>
                Yearbooks currently being prepared
                and customized.
              </p>
            </div>

          </div>

          <span className="section-count">
            {drafts.length}
          </span>

        </div>


        {drafts.length > 0 ? (

          <div className="card-grid">

            {drafts.map((item) => (

              <div
                className="yearbook-card"
                key={item.id}
              >

                {/* DRAFT BADGE */}

                <span className="status-badge draft-badge">
                  DRAFT
                </span>


                {/* YEARBOOK COVER */}

                <div className="yearbook-thumbnail">

                  {item.thumbnail ? (

                    <img
                      src={item.thumbnail}
                      alt={
                        item.title ||
                        "Yearbook cover"
                      }
                    />

                  ) : (

                    <div className="cover-placeholder">

                      <div className="placeholder-school">
                        SCHOOL YEARBOOK
                      </div>

                      <div className="placeholder-title">
                        {item.title ||
                          "YEARBOOK"}
                      </div>

                      <div className="placeholder-line"></div>

                    </div>

                  )}

                </div>


                {/* CARD CONTENT */}

                <div className="yearbook-card-content">

                  <h4>
                    {item.title ||
                      "Untitled Yearbook"}
                  </h4>

                  <div className="metadata">

                    <span className="metadata-label">
                      Last Updated
                    </span>

                    <span className="metadata-value">
                      {formatDate(
                        item.updated ||
                        item.updated_at ||
                        item.created_at
                      )}
                    </span>

                  </div>


                  <button
                    className="card-action"
                    onClick={() =>
                      navigate(
                        "/admin/design",
                        {
                          state: {
                            yearbookId:
                              item.id,
                            pages:
                              item.pages,
                          },
                        }
                      )
                    }
                  >
                    Customize Yearbook

                    <span className="arrow">
                      →
                    </span>
                  </button>

                  <button
    className="delete-action"
    onClick={() =>
      handleDelete(
        item.id,
        item.title
      )
    }
  >
    <span>🗑</span>
    Delete Yearbook
  </button>

                </div>

              </div>

            ))}

          </div>

        ) : (

          <div className="empty-state">

            <div className="empty-icon">
              +
            </div>

            <h4>
              No Draft Yearbooks
            </h4>

            <p>
              Start creating a new yearbook
              for your graduating batch.
            </p>

            <button
              onClick={() =>
                navigate("/admin/design")
              }
            >
              Create Yearbook
            </button>

          </div>

        )}

      </section>


      {/* =================================================
          PUBLISHED YEARBOOKS
          ================================================= */}

      <section className="yearbook-section">

        <div className="section-heading">

          <div className="section-title">

            <span className="section-line"></span>

            <div>
              <h3>Published Yearbooks</h3>

              <p>
                Official yearbooks available
                for viewing.
              </p>
            </div>

          </div>

          <span className="section-count">
            {published.length}
          </span>

        </div>


        {published.length > 0 ? (

          <div className="card-grid">

            {published.map((item) => (

              <div
                className="yearbook-card"
                key={item.id}
              >

                {/* PUBLISHED BADGE */}

                <span className="status-badge published-badge">
                  PUBLISHED
                </span>


                {/* YEARBOOK COVER */}

                <div className="yearbook-thumbnail">

                  {item.thumbnail ? (

                    <img
                      src={item.thumbnail}
                      alt={
                        item.title ||
                        "Yearbook cover"
                      }
                    />

                  ) : (

                    <div className="cover-placeholder">

                      <div className="placeholder-school">
                        SCHOOL YEARBOOK
                      </div>

                      <div className="placeholder-title">
                        {item.title ||
                          "YEARBOOK"}
                      </div>

                      <div className="placeholder-line"></div>

                    </div>

                  )}

                </div>


                {/* CARD CONTENT */}

                <div className="yearbook-card-content">

                  <h4>
                    {item.title ||
                      "Untitled Yearbook"}
                  </h4>

                  <div className="metadata">

                    <span className="metadata-label">
                      Published
                    </span>

                    <span className="metadata-value">
                      {formatDate(
                        item.published ||
                        item.published_at
                      )}
                    </span>

                  </div>


<button
  className="card-action"
  onClick={() =>
    navigate(`/admin/yearbook/view/${item.id}`)
  }
>
  View Yearbook
  <span className="arrow">
    →
  </span>
</button>

            <button
  className="pdf-download-action"
  onClick={() =>
    handleDownloadPDF(item)
  }
  disabled={downloadingId === item.id}
>
  <span className="pdf-icon">
    {downloadingId === item.id
      ? "⏳"
      : "↓"}
  </span>

  {downloadingId === item.id
    ? "Generating PDF..."
    : "Download PDF"}
</button>

<button
    className="delete-action"
    onClick={() =>
      handleDelete(
        item.id,
        item.title
      )
    }
  >
    <span>🗑</span>
    Delete Yearbook
  </button>

                </div>

              </div>

            ))}

          </div>

        ) : (

          <div className="empty-state">

            <div className="empty-icon published-empty">
              ✓
            </div>

            <h4>
              No Published Yearbooks
            </h4>

            <p>
              Completed and published yearbooks
              will appear here.
            </p>

          </div>

        )}

      </section>

    </div>
  );
}

export default Yearbooks;