
import React, { forwardRef, useEffect, useRef } from "react";
import * as fabric from "fabric";

const FlipbookPage = forwardRef(({ page }, ref) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Keep the REAL rendering resolution high.
    // The CSS will scale this down to fit the flipbook.
    const canvas = new fabric.StaticCanvas(canvasRef.current, {
      width: 794,
      height: 1123,
      backgroundColor: "#ffffff",
      enableRetinaScaling: true,
    });

    const loadPage = async () => {
      try {
        if (page?.json) {
          let json = page.json;

          // Handle JSON stored as a string
          if (typeof json === "string") {
            json = JSON.parse(json);
          }

          await canvas.loadFromJSON(json);
        }

        canvas.renderAll();
      } catch (error) {
        console.error("Failed to render flipbook page:", error);
      }
    };

    loadPage();

    return () => {
      canvas.dispose();
    };
  }, [page]);

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
        background: "#ffffff",
        overflow: "hidden",

        // Important: preserve the original page proportions.
        aspectRatio: "794 / 1123",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        boxSizing: "border-box",
      }}
    >
      <canvas
        ref={canvasRef}
        width={794}
        height={1123}
        style={{
          width: "100%",
          height: "auto",
          maxWidth: "100%",
          maxHeight: "100%",
          display: "block",
          objectFit: "contain",
          objectPosition: "center",
          background: "#ffffff",
        }}
      />
    </div>
  );
});

FlipbookPage.displayName = "FlipbookPage";

export default FlipbookPage;

