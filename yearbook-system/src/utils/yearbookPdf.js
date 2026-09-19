import { jsPDF } from "jspdf";
import { StaticCanvas } from "fabric";

/**
 * Render one Fabric.js page into a PNG image
 */
const renderFabricPage = async (pageJson) => {
  const canvasElement = document.createElement("canvas");

  canvasElement.width = 794;
  canvasElement.height = 1123;

  const canvas = new StaticCanvas(canvasElement, {
    width: 794,
    height: 1123,
    backgroundColor: "#ffffff",
  });

  try {
    if (!pageJson) {
      throw new Error("Empty page data.");
    }

    await canvas.loadFromJSON(pageJson);

    canvas.renderAll();

    return canvas.toDataURL({
      format: "png",
      multiplier: 2,
    });
  } finally {
    canvas.dispose();
  }
};

/**
 * Download complete yearbook as PDF
 */
export const downloadYearbookPDF = async (
  pages,
  title = "Yearbook"
) => {
  console.log("📚 PDF exporter received:", pages);

  if (!Array.isArray(pages) || pages.length === 0) {
    throw new Error(
      "No yearbook pages available."
    );
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageWidth = 210;
  const pageHeight = 297;

  for (let i = 0; i < pages.length; i++) {
    console.log(
      `📄 Rendering page ${i + 1}/${pages.length}`
    );

    const page = pages[i];

    let pageJson = page;

    /**
     * Your pages may be structured like:
     *
     * {
     *   id: 1,
     *   json: {...}
     * }
     *
     * or simply:
     *
     * {
     *   objects: [...]
     * }
     */
    if (page && page.json) {
      pageJson = page.json;
    }

    /**
     * Handle JSON stored as a string
     */
    if (typeof pageJson === "string") {
      try {
        pageJson = JSON.parse(pageJson);
      } catch (error) {
        console.error(
          `❌ Invalid JSON on page ${i + 1}`,
          error
        );

        continue;
      }
    }

    /**
     * Some systems may store the JSON
     * inside another property.
     */
    if (
      pageJson &&
      typeof pageJson === "object" &&
      pageJson.json
    ) {
      pageJson = pageJson.json;
    }

    if (
      !pageJson ||
      typeof pageJson !== "object"
    ) {
      console.warn(
        `⚠️ Skipping invalid page ${i + 1}`
      );

      continue;
    }

    const image =
      await renderFabricPage(pageJson);

    if (i > 0) {
      pdf.addPage();
    }

    pdf.addImage(
      image,
      "PNG",
      0,
      0,
      pageWidth,
      pageHeight,
      undefined,
      "FAST"
    );
  }

  /**
   * Clean filename
   */
  const safeTitle = String(
    title || "Yearbook"
  )
    .replace(/[^a-z0-9]/gi, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  pdf.save(
    `${safeTitle || "Yearbook"}.pdf`
  );
};