import { useEffect, useState } from "react";
import axios from "axios";
import "./publish.css";
import * as fabric from "fabric";

function Publish() {
  const [drafts, setDrafts] = useState([]);
  const [published, setPublished] = useState([]);
  const [selectedYearbook, setSelectedYearbook] = useState(null);
const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchYearbooks();
  }, []);

  const fetchYearbooks = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/yearbooks"
    );

    setDrafts(
      res.data.filter(
        (y) => y.status === "draft"
      )
    );

    setPublished(
      res.data.filter(
        (y) => y.status === "published"
      )
    );
  };

  const publishYearbook = async (id) => {
    await axios.put(
      `http://localhost:5000/api/yearbooks/${id}/publish`
    );

    fetchYearbooks();
  };

const normalizePageJson = (page) => {
  if (!page) return null;

  let pageJson = page.json || page;

  if (typeof pageJson === "string") {
    try {
      pageJson = JSON.parse(pageJson);
    } catch (error) {
      console.error("Failed to parse page JSON:", error);
      return null;
    }
  }

  if (pageJson?.json) {
    pageJson = pageJson.json;
  }

  return pageJson;
};

const parsePages = (yearbook) => {
  if (!yearbook?.pages) return [];
  let pages = yearbook.pages;

  if (typeof pages === "string") {
    try {
      pages = JSON.parse(pages);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(pages)) return [];

  return pages.map((page) => {
    if (page?.json && typeof page.json === "string") {
      try {
        return { ...page, json: JSON.parse(page.json) };
      } catch {
        return page;
      }
    }
    return page;
  });
};

const PageThumbnail = ({ page }) => {
  const [img, setImg] = useState(null);

  useEffect(() => {
    const pageJson = normalizePageJson(page);
    if (!pageJson) return;

    const canvasElement = document.createElement("canvas");
    canvasElement.width = 794;
    canvasElement.height = 1123;

    const tempCanvas = new fabric.StaticCanvas(canvasElement, {
      width: 794,
      height: 1123,
      backgroundColor: "#fff",
    });

    tempCanvas.loadFromJSON(pageJson, () => {
      tempCanvas.renderAll();

      try {
        const dataURL = tempCanvas.toDataURL({
          format: "png",
          quality: 0.8,
        });

        setImg(dataURL);
      } catch (error) {
        console.error("Failed to generate page thumbnail:", error);
      }
    });
  }, [page]);

  if (!img) {
    return <div className="loading-thumb">Loading preview...</div>;
  }

  return <img src={img} alt="Yearbook page preview" className="page-thumb-img" />;
};

const renderThumbnail = (yearbook) => {
  const pages = parsePages(yearbook);
  const firstPage = pages[0];

  if (firstPage) {
    return <PageThumbnail page={firstPage} />;
  }

  if (yearbook.thumbnail) {
    return <img src={yearbook.thumbnail} alt={yearbook.title} />;
  }

  return (
    <div className="empty-thumbnail">
      📚 <span>No Preview</span>
    </div>
  );
};

return (
  <div className="publish-page">

    {/* HEADER */}
    <div className="publish-header">
      <h1>📚 Publishing Center</h1>
      <p>Manage drafts and publish yearbooks</p>
    </div>

    {/* DRAFTS */}
    <section>
      <h2 className="section-title">
        Drafts ({drafts.length})
      </h2>

      <div className="yearbook-grid">
        {drafts.map((yb) => (
          <div
            key={yb.id}
            className="yearbook-card"
            onClick={() => {
              setSelectedYearbook(yb);
              setShowModal(true);
            }}
          >
            <div className="thumbnail">
              {renderThumbnail(yb)}
            </div>

            <div className="card-body">
              <h3>{yb.title}</h3>
              <span className="draft-badge">Draft</span>

              <button
                className="publish-btn"
                onClick={(e) => {
                  e.stopPropagation(); // important
                  publishYearbook(yb.id);
                }}
              >
                Publish
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* PUBLISHED */}
    <section>
      <h2 className="section-title">
        Published ({published.length})
      </h2>

      <div className="yearbook-grid">
        {published.map((yb) => (
          <div key={yb.id} className="yearbook-card">
            <div className="thumbnail">
              {renderThumbnail(yb)}
            </div>

            <div className="card-body">
              <h3>{yb.title}</h3>
              <span className="published-badge">Published</span>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* ✅ MODAL (INSIDE RETURN) */}
    {showModal && selectedYearbook && (
      <div className="modal-overlay" onClick={() => setShowModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>

          <h2>{selectedYearbook.title}</h2>

          <div className="pages-preview-scroll">
            {parsePages(selectedYearbook).map((page, index) => (
              <div key={index} className="page-preview-box">
                <div className="page-header">
                  Page {index + 1}
                </div>

                <PageThumbnail page={page} />
              </div>
            ))}
          </div>

          <button onClick={() => setShowModal(false)}>
            Close
          </button>

        </div>
      </div>
    )}

  </div>
);
}

export default Publish;