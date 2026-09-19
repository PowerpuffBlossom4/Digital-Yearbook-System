import { useEffect, useMemo, useState } from "react";
import * as fabric from "fabric";

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;

// Higher resolution source for sharper thumbnails
const PREVIEW_MULTIPLIER = 2;

const THUMB_WIDTH = 144;
const THUMB_HEIGHT = 202;

export default function PagePreview({
  page,
  active,
  onClick,
  onDelete,
}) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const fallbackLabel = useMemo(
    () => page?.title || "Page",
    [page?.title]
  );

  useEffect(() => {
    let cancelled = false;
    let tempCanvas = null;

    const generatePreview = async () => {
      if (!page) return;

      /*
      =====================================================
      1. USE SAVED PREVIEW / THUMBNAIL FIRST
      =====================================================
      */

      if (page.preview || page.thumbnail) {
        setPreviewUrl(
          page.preview || page.thumbnail
        );

        return;
      }

      /*
      =====================================================
      2. NO JSON = NO PREVIEW
      =====================================================
      */

      if (!page.json) {
        setPreviewUrl("");
        return;
      }

      try {
        /*
        =====================================================
        3. CREATE A REAL HTML CANVAS

        IMPORTANT:
        Do NOT use:

        new fabric.StaticCanvas(null)

        Fabric needs an actual canvas element.
        =====================================================
        */

        const canvasElement =
          document.createElement("canvas");

        /*
        =====================================================
        4. CREATE FABRIC STATIC CANVAS
        =====================================================
        */

        tempCanvas = new fabric.StaticCanvas(
          canvasElement,
          {
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,

            backgroundColor: "#ffffff",

            enableRetinaScaling: true,
          }
        );

        /*
        =====================================================
        5. LOAD PAGE JSON
        =====================================================
        */

        await tempCanvas.loadFromJSON(page.json);

        if (cancelled) {
          tempCanvas.dispose();
          tempCanvas = null;
          return;
        }

        /*
        =====================================================
        6. FORCE CORRECT A4 SIZE
        =====================================================
        */

        tempCanvas.setDimensions({
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
        });

        /*
        =====================================================
        7. RESET ZOOM
        =====================================================
        */

        tempCanvas.setZoom(1);

        /*
        =====================================================
        8. RENDER EVERYTHING
        =====================================================
        */

        tempCanvas.renderAll();

        /*
        =====================================================
        9. GENERATE HIGH-QUALITY PREVIEW

        794 × 1123
              ↓
        2×
              ↓
        1588 × 2246

        Then browser displays it at only:
        144 × 202
        =====================================================
        */

        const dataUrl =
          tempCanvas.toDataURL({
            format: "jpeg",

            // High quality but much smaller than PNG
            quality: 0.92,

            // 2× source resolution
            multiplier: PREVIEW_MULTIPLIER,
          });

        if (cancelled) {
          tempCanvas.dispose();
          tempCanvas = null;
          return;
        }

        /*
        =====================================================
        10. SET PREVIEW
        =====================================================
        */

        setPreviewUrl(dataUrl);

        /*
        =====================================================
        11. CLEANUP
        =====================================================
        */

        tempCanvas.dispose();
        tempCanvas = null;

      } catch (error) {
        console.error(
          "❌ Failed to generate page preview:",
          error
        );

        if (!cancelled) {
          setPreviewUrl("");
        }

        if (tempCanvas) {
          try {
            tempCanvas.dispose();
          } catch (disposeError) {
            console.warn(
              "Preview canvas cleanup failed:",
              disposeError
            );
          }

          tempCanvas = null;
        }
      }
    };

    generatePreview();

    /*
    =====================================================
    CLEANUP WHEN COMPONENT UNMOUNTS / PAGE CHANGES
    =====================================================
    */

    return () => {
      cancelled = true;

      if (tempCanvas) {
        try {
          tempCanvas.dispose();
        } catch {
          // Ignore cleanup errors
        }

        tempCanvas = null;
      }
    };
  }, [
    page?.id,
    page?.json,
    page?.preview,
    page?.thumbnail,
  ]);

  /*
  =====================================================
  DELETE PAGE
  =====================================================
  */

  const handleDelete = (e) => {
    e.stopPropagation();

    if (!onDelete) return;

    onDelete(page.id);
  };

  return (
    <div
      className={`page-preview ${
        active ? "active" : ""
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        position: "relative",
      }}
    >
      {/* =================================================
          PAGE PREVIEW CONTAINER
      ================================================= */}

      <div
        style={{
          width: THUMB_WIDTH,
          height: THUMB_HEIGHT,

          padding: 6,

          boxSizing: "border-box",

          borderRadius: 12,

          border: active
            ? "2px solid #2f9e44"
            : "1px solid #cfe8d5",

          background:
            "linear-gradient(135deg, #f5fff7 0%, #e6f8eb 100%)",

          boxShadow: active
            ? "0 8px 20px rgba(47, 158, 68, 0.18)"
            : "0 4px 12px rgba(0, 0, 0, 0.06)",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          overflow: "hidden",

          position: "relative",
        }}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={fallbackLabel}
            draggable={false}
            decoding="async"
            loading="eager"
            style={{
              width: "100%",
              height: "100%",

              objectFit: "contain",

              display: "block",

              background: "#ffffff",

              borderRadius: 8,

              // Keep browser interpolation smooth
              imageRendering: "auto",

              userSelect: "none",

              pointerEvents: "none",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              borderRadius: 8,

              background: "#f8fff9",

              color: "#4f6b58",

              fontSize: 12,

              fontWeight: 500,

              textAlign: "center",

              padding: 8,

              boxSizing: "border-box",
            }}
          >
            {page?.json
              ? "Loading preview..."
              : fallbackLabel}
          </div>
        )}

        {/* =================================================
            DELETE BUTTON
        ================================================= */}

        {isHovered && (
          <button
            type="button"
            onClick={handleDelete}
            title="Delete page"
            aria-label="Delete page"
            style={{
              position: "absolute",

              top: 10,
              right: 10,

              width: 30,
              height: 30,

              border: "none",

              borderRadius: "50%",

              background: "#dc3545",

              color: "#ffffff",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              cursor: "pointer",

              fontSize: 16,

              fontWeight: 700,

              lineHeight: 1,

              padding: 0,

              boxShadow:
                "0 4px 10px rgba(0,0,0,0.25)",

              zIndex: 10,

              transition:
                "transform 0.15s ease, background 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "#b02a37";

              e.currentTarget.style.transform =
                "scale(1.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "#dc3545";

              e.currentTarget.style.transform =
                "scale(1)";
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* =================================================
          PAGE TITLE
      ================================================= */}

      <div
        style={{
          textAlign: "center",

          fontSize: 12,

          fontWeight: 600,

          color: active
            ? "#17663a"
            : "#4f6b58",

          maxWidth: 140,

          overflow: "hidden",

          textOverflow: "ellipsis",

          whiteSpace: "nowrap",
        }}
      >
        {fallbackLabel}
      </div>
    </div>
  );
}