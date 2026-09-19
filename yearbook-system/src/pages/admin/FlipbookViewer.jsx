import React, {
  forwardRef,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import axios from "axios";

import HTMLFlipBook from "react-pageflip";

import * as fabric from "fabric";

import {
  FiArrowLeft,
  FiDownload,
  FiBookOpen,
  FiLoader,
  FiAlertCircle,
} from "react-icons/fi";

import adssuLogo from "../../assets/adssu-logo.png";

import { downloadYearbookPDF } from "../../utils/yearbookPdf";

import "./flipbook.css";

const API_URL = "http://localhost:5000/api";

/* =========================================================
   HELPER
   ========================================================= */

const parsePages = (rawPages) => {
  if (Array.isArray(rawPages)) {
    return rawPages;
  }

  if (typeof rawPages === "string") {
    try {
      const parsed = JSON.parse(rawPages);

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch (error) {
      console.error(
        "❌ Failed to parse yearbook pages:",
        error
      );

      return [];
    }
  }

  return [];
};

/* =========================================================
   FLIPBOOK PAGE
   ========================================================= */

const FlipbookPage = forwardRef(
  ({ page, label }, ref) => {
    const canvasRef = useRef(null);

    useEffect(() => {
      let disposed = false;
      let canvas = null;

      const renderPage = async () => {
        if (!canvasRef.current) {
          return;
        }

        try {
          let pageJson = page?.json;

          /*
           * If Fabric JSON is stored as a string,
           * convert it back to an object.
           */
          if (typeof pageJson === "string") {
            try {
              pageJson = JSON.parse(pageJson);
            } catch (error) {
              console.error(
                "❌ Failed to parse page JSON:",
                error
              );

              return;
            }
          }

          /*
           * If this page has no Fabric JSON,
           * there is nothing to render.
           */
          if (!pageJson) {
            return;
          }

          /*
           * Original Design Studio page size:
           *
           * 794 x 1123
           *
           * This is A4 portrait.
           */
          const PAGE_WIDTH = 794;
          const PAGE_HEIGHT = 1123;

          /*
           * Render at 2x resolution for better
           * visual quality.
           */
          const RENDER_SCALE = 2;

          canvas = new fabric.StaticCanvas(
            canvasRef.current,
            {
              width:
                PAGE_WIDTH *
                RENDER_SCALE,

              height:
                PAGE_HEIGHT *
                RENDER_SCALE,

              backgroundColor: "#ffffff",

              enableRetinaScaling: true,
            }
          );

          /*
           * Load the saved Fabric page.
           */
          await canvas.loadFromJSON(pageJson);

          if (disposed) {
            return;
          }

          /*
           * Scale Fabric objects to the
           * high-resolution canvas.
           */
          canvas.setZoom(RENDER_SCALE);

          canvas.setDimensions({
            width:
              PAGE_WIDTH *
              RENDER_SCALE,

            height:
              PAGE_HEIGHT *
              RENDER_SCALE,
          });

          canvas.requestRenderAll();
        } catch (error) {
          console.error(
            "❌ Failed to render flipbook page:",
            error
          );
        }
      };

      renderPage();

      return () => {
        disposed = true;

        if (canvas) {
          canvas.dispose();
        }
      };
    }, [page?.json]);

    /*
     * Fallback if the page does not contain
     * Fabric JSON.
     */
    const fallbackImage =
      page?.preview ||
      page?.thumbnail ||
      "";

    return (
      <div
        ref={ref}
        className="flipbook-page"
      >
        {page?.json ? (
          <canvas
            ref={canvasRef}
            className="flipbook-page-canvas"
            aria-label={
              label ||
              "Yearbook page"
            }
          />
        ) : fallbackImage ? (
          <img
            src={fallbackImage}
            alt={
              label ||
              "Yearbook page"
            }
            draggable={false}
            className="flipbook-page-image"
          />
        ) : (
          <div className="flipbook-empty">
            This page could not be rendered.
          </div>
        )}
      </div>
    );
  }
);

FlipbookPage.displayName =
  "FlipbookPage";

/* =========================================================
   FLIPBOOK VIEWER
   ========================================================= */

function FlipbookViewer() {
  const navigate = useNavigate();

  const { id } = useParams();

  const [pages, setPages] =
    useState([]);

  const [title, setTitle] =
    useState("Yearbook");

  const [yearbook, setYearbook] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [downloading, setDownloading] =
    useState(false);

  /* =======================================================
     LOAD YEARBOOK FROM DATABASE
     ======================================================= */

  useEffect(() => {
    if (!id) {
      setError(
        "No yearbook was selected."
      );

      setLoading(false);

      return;
    }

    fetchYearbook(id);
  }, [id]);

  /* =======================================================
     FETCH YEARBOOK
     ======================================================= */

  const fetchYearbook = async (
    yearbookId
  ) => {
    try {
      setLoading(true);

      setError("");

      console.log(
        "📚 Loading yearbook:",
        yearbookId
      );

      /*
       * This endpoint should return:
       *
       * {
       *   id,
       *   title,
       *   pages,
       *   thumbnail,
       *   ...
       * }
       */
      const response =
        await axios.get(
          `${API_URL}/yearbooks/${yearbookId}`,
          {
            withCredentials: true,
          }
        );

      console.log(
        "✅ Yearbook loaded:",
        response.data
      );

      const data =
        response.data?.yearbook ||
        response.data;

      if (!data) {
        throw new Error(
          "Yearbook was not found."
        );
      }

      const parsedPages =
        parsePages(data.pages);

      console.log(
        `📖 ${parsedPages.length} pages loaded`
      );

      setYearbook(data);

      setTitle(
        data.title ||
          data.batch_name ||
          "Yearbook"
      );

      setPages(parsedPages);
    } catch (err) {
      console.error(
        "❌ Failed to load yearbook:",
        err
      );

      setPages([]);

      setError(
        err.response?.data?.message ||
          "Unable to load this yearbook."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     DOWNLOAD PDF
     ======================================================= */

  const handleDownloadPDF = async () => {
    try {
      if (!pages.length) {
        alert(
          "This yearbook does not contain any pages to export."
        );

        return;
      }

      setDownloading(true);

      console.log(
        "📄 Starting PDF generation:",
        title
      );

      console.log(
        "📦 Number of pages:",
        pages.length
      );

      /*
       * Use the exact same PDF utility
       * used by the Admin Yearbooks page.
       */
      await downloadYearbookPDF(
        pages,
        title || "Yearbook"
      );

      console.log(
        "✅ PDF downloaded successfully."
      );
    } catch (error) {
      console.error(
        "❌ Failed to generate PDF:",
        error
      );

      alert(
        error?.message ||
          "Failed to generate the PDF. Please try again."
      );
    } finally {
      setDownloading(false);
    }
  };

  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <div className="flipbook-page-wrapper">
        <div className="flipbook-container">

          <div className="flipbook-loading">
            <div className="flipbook-loading-spinner">
              <FiLoader />
            </div>

            <h2>
              Loading Yearbook...
            </h2>

            <p>
              Preparing your digital
              yearbook.
            </p>
          </div>

        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
     ======================================================= */

  if (error) {
    return (
      <div className="flipbook-page-wrapper">
        <div className="flipbook-container">

          <div className="flipbook-header">

            <div className="flipbook-header-left">

              <div className="flipbook-header-logo">
                <img
                  src={adssuLogo}
                  alt="Agusan del Sur State University Logo"
                  className="flipbook-school-logo"
                />
              </div>

              <div className="flipbook-header-text">
                <div className="logo-text">
                  <span className="logo-title">
                    ADSSU Digital Yearbook
                  </span>
                </div>
              </div>

            </div>

            <button
              type="button"
              className="flipbook-back-btn"
              onClick={() =>
                navigate(-1)
              }
            >
              <FiArrowLeft />
              Back
            </button>

          </div>

          <div className="flipbook-error">

            <div className="flipbook-error-icon">
              <FiAlertCircle />
            </div>

            <h2>
              Unable to Open Yearbook
            </h2>

            <p>
              {error}
            </p>

            <button
              type="button"
              className="flipbook-error-btn"
              onClick={() =>
                fetchYearbook(id)
              }
            >
              Try Again
            </button>

          </div>

        </div>
      </div>
    );
  }

  /* =======================================================
     NO PAGES
     ======================================================= */

  if (!pages.length) {
    return (
      <div className="flipbook-page-wrapper">
        <div className="flipbook-container">

          <div className="flipbook-header">

            <div className="flipbook-header-left">

              <div className="flipbook-header-logo">
                <img
                  src={adssuLogo}
                  alt="Agusan del Sur State University Logo"
                  className="flipbook-school-logo"
                />
              </div>

              <div className="flipbook-header-text">
                <div className="logo-text">
                  <span className="logo-title">
                    ADSSU Digital Yearbook
                  </span>
                </div>
              </div>

            </div>

            <button
              type="button"
              className="flipbook-back-btn"
              onClick={() =>
                navigate(-1)
              }
            >
              <FiArrowLeft />
              Back
            </button>

          </div>

          <div className="flipbook-error">

            <div className="flipbook-error-icon">
              <FiBookOpen />
            </div>

            <h2>
              No Yearbook Pages
            </h2>

            <p>
              This yearbook does not
              contain any published pages.
            </p>

          </div>

        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN VIEWER
     ======================================================= */

  return (
    <div className="flipbook-page-wrapper">

      <div className="flipbook-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flipbook-header">

          <div className="flipbook-header-left">

            <div className="flipbook-header-logo">
              <img
                src={adssuLogo}
                alt="Agusan del Sur State University Logo"
                className="flipbook-school-logo"
              />
            </div>

            <div className="flipbook-header-text">

              <div className="logo-text">
                <span className="logo-title">
                  ADSSU Digital Yearbook
                </span>
              </div>

              <span className="flipbook-current-title">
                {title}
              </span>

            </div>

          </div>

          <div className="flipbook-header-actions">

            {/* DOWNLOAD PDF */}

            <button
              type="button"
              className="flipbook-download-btn"
              onClick={
                handleDownloadPDF
              }
              disabled={downloading}
            >
              {downloading ? (
                <>
                  <FiLoader className="spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <FiDownload />
                  Download PDF
                </>
              )}
            </button>

            {/* BACK */}

            <button
              type="button"
              className="flipbook-back-btn"
              onClick={() =>
                navigate(-1)
              }
            >
              <FiArrowLeft />
              Back
            </button>

          </div>

        </div>

        {/* =================================================
            BOOK AREA
        ================================================= */}

        <div className="flipbook-book-surface">

          <div className="flipbook-reading-lights" />

          {/* =================================================
              INFORMATION
          ================================================= */}

          <div className="flipbook-book-info">

            <div>
              <span className="flipbook-book-label">
                <FiBookOpen />
                DIGITAL YEARBOOK
              </span>

              <h1>
                {title}
              </h1>

              {yearbook?.academic_year && (
                <p>
                  Academic Year{" "}
                  {yearbook.academic_year}
                </p>
              )}
            </div>

            <div className="flipbook-page-count">
              <strong>
                {pages.length}
              </strong>

              <span>
                {pages.length === 1
                  ? "PAGE"
                  : "PAGES"}
              </span>
            </div>

          </div>

          {/* =================================================
              INSTRUCTION
          ================================================= */}

          <div className="flipbook-instruction">

            <span className="flipbook-instruction-dot" />

            Click or drag the corner
            to turn the page

          </div>

          {/* =================================================
              BOOK
          ================================================= */}

          <div className="flipbook-open-book">

            <div className="flipbook-stage">

              <HTMLFlipBook
                width={360}
                height={509}
                size="stretch"
                minWidth={280}
                maxWidth={560}
                minHeight={396}
                maxHeight={793}
                drawShadow={true}
                flippingTime={900}
                usePortrait={true}
                startPage={0}
                showCover={true}
                mobileScrollSupport={true}
                maxShadowOpacity={0.45}
                className="yearbook-flipbook"
                useMouseEvents={true}
                swipeDistance={30}
                clickEventForward={true}
                disableFlipByClick={false}
              >

                {pages.map(
                  (page, index) => (
                    <div
                      key={
                        page?.id ||
                        `page-${index}`
                      }
                      className="page"
                    >

                      <FlipbookPage
                        page={page}
                        label={`Yearbook page ${
                          index + 1
                        }`}
                      />

                    </div>
                  )
                )}

              </HTMLFlipBook>

            </div>

          </div>

          {/* =================================================
              BOTTOM CONTROLS
          ================================================= */}

          <div className="flipbook-bottom-bar">

            <div className="flipbook-bottom-info">

              <FiBookOpen />

              <span>
                {title}
              </span>

            </div>

        

          </div>

          <div className="flipbook-bottom-accent" />

        </div>

      </div>

    </div>
  );
}

export default FlipbookViewer;