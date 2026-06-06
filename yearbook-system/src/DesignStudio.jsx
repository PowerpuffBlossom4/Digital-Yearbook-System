import { useState, useEffect, useRef } from "react";
import {
  FiType,
  FiImage,
  FiSquare,
  FiGrid,
  FiPlus,
} from "react-icons/fi";

import * as fabric from "fabric";
import "./designstudio.css";

function DesignStudio() {

  // FABRIC CANVAS REFERENCE
  const canvasRef = useRef(null);

  // SELECTED OBJECT
  const [selectedObject, setSelectedObject] =
    useState(null);

  // PAGES
  const [pages, setPages] = useState([
    { id: 1, title: "Cover" },
  ]);

  const [activePage, setActivePage] =
    useState(1);

  // INITIALIZE FABRIC CANVAS
  useEffect(() => {

    const canvas = new fabric.Canvas(
      "editor-canvas",
      {
        width: 794,
        height: 1123,
        backgroundColor: "#ffffff",
      }
    );

    canvasRef.current = canvas;

    // SELECTION EVENTS
    canvas.on("selection:created", (e) => {
      setSelectedObject(e.selected[0]);
    });

    canvas.on("selection:updated", (e) => {
      setSelectedObject(e.selected[0]);
    });

    canvas.on("selection:cleared", () => {
      setSelectedObject(null);
    });

    // DEFAULT TEXT
    const text = new fabric.Textbox(
      "Class of 2025",
      {
        left: 200,
        top: 100,
        width: 300,
        fontSize: 40,
        fill: "#000000",
      }
    );

    canvas.add(text);



    return () => {
      canvas.dispose();
    };

  }, []);

  // KEYBOARD DELETE SUPPORT
  useEffect(() => {

    const handleKeyDown = (e) => {

      if (e.key === "Delete") {

        const activeObject =
          canvasRef.current?.getActiveObject();

        if (activeObject) {

          canvasRef.current.remove(
            activeObject
          );

          canvasRef.current.renderAll();
        }
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };

  }, []);

  // ADD TEXT
  const addText = () => {

    const text = new fabric.Textbox(
      "New Text",
      {
        left: 100,
        top: 100,
        width: 200,
        fontSize: 28,
        fill: "#000000",
      }
    );

    canvasRef.current.add(text);

    canvasRef.current.setActiveObject(text);

    canvasRef.current.renderAll();
  };

  // ADD RECTANGLE
  const addShape = () => {

    const rect = new fabric.Rect({
      left: 150,
      top: 150,
      fill: "green",
      width: 120,
      height: 120,
    });

    canvasRef.current.add(rect);

    canvasRef.current.setActiveObject(rect);

    canvasRef.current.renderAll();
  };

  // ADD CIRCLE
  const addCircle = () => {

    const circle =
      new fabric.Circle({
        radius: 50,
        fill: "blue",
        left: 200,
        top: 200,
      });

    canvasRef.current.add(circle);

    canvasRef.current.setActiveObject(circle);

    canvasRef.current.renderAll();
  };

  // ADD TRIANGLE
  const addTriangle = () => {

    const triangle =
      new fabric.Triangle({
        width: 100,
        height: 100,
        fill: "orange",
        left: 250,
        top: 250,
      });

    canvasRef.current.add(triangle);

    canvasRef.current.setActiveObject(
      triangle
    );

    canvasRef.current.renderAll();
  };

  // DELETE OBJECT
  const deleteObject = () => {

    const activeObject =
      canvasRef.current.getActiveObject();

    if (activeObject) {

      canvasRef.current.remove(
        activeObject
      );

      canvasRef.current.renderAll();
    }
  };

  // CHANGE COLOR
  const changeColor = (color) => {

    const activeObject =
      canvasRef.current.getActiveObject();

    if (activeObject) {

      activeObject.set("fill", color);

      canvasRef.current.renderAll();
    }
  };

  // CHANGE FONT SIZE
  const changeFontSize = (size) => {

    const activeObject =
      canvasRef.current.getActiveObject();

    if (
      activeObject &&
      activeObject.type === "textbox"
    ) {

      activeObject.set(
        "fontSize",
        size
      );

      canvasRef.current.renderAll();
    }
  };

  // CHANGE FONT FAMILY
  const changeFontFamily = (font) => {

    const activeObject =
      canvasRef.current.getActiveObject();

    if (
      activeObject &&
      activeObject.type === "textbox"
    ) {

      activeObject.set(
        "fontFamily",
        font
      );

      canvasRef.current.renderAll();
    }
  };

  // SAVE DESIGN
  const saveDesign = () => {

    const designData =
      canvasRef.current.toJSON();

    console.log(designData);

    alert("Design Saved");
  };

  // ADD PAGE
  const addPage = () => {

    const newPage = {
      id: Date.now(),
      title: `Page ${pages.length + 1}`,
    };

    setPages([...pages, newPage]);

    setActivePage(newPage.id);
  };

  const fonts = [
  "Arial",
  "Georgia",
  "Courier New",
  "Roboto",
  "Poppins",
  "Montserrat",
  "Playfair Display",
];



  return (
    <div className="design-studio">

      {/* TOP HEADER */}
      <div className="design-top">

        <div className="header-left">
          <h3>Yearbook Design Studio</h3>

          <span>
            {pages.length} Pages
          </span>
        </div>

        <button
          className="save-btn"
          onClick={saveDesign}
        >
          Save Design
        </button>

      </div>

      {/* BODY */}
      <div className="studio-body">

        {/* LEFT SIDEBAR */}
        <aside className="left-sidebar">

          <h5>ADD</h5>

          <button
            className="tool-btn"
            onClick={addText}
          >
            <FiType />
            Add Text
          </button>

          <button
            className="tool-btn"
            onClick={addShape}
          >
            <FiSquare />
            Add Shape
          </button>

          <button
            className="tool-btn"
            onClick={addCircle}
          >
            Add Circle
          </button>

          <button
            className="tool-btn"
            onClick={addTriangle}
          >
            Add Triangle
          </button>

          <button className="tool-btn">
            <FiGrid />
            Add Frame
          </button>

          <button className="tool-btn">
            <FiImage />
            Upload Image
          </button>

          <button
            className="tool-btn"
            onClick={deleteObject}
          >
            Delete Selected
          </button>

          {/* COLOR TOOLS */}
          <div className="color-tools">

           <input
  type="color"
  onChange={(e) =>
    changeColor(e.target.value)
  }
/>

            <button
              onClick={() =>
                changeFontSize(20)
              }
            >
              Small
            </button>

            <button
              onClick={() =>
                changeFontSize(40)
              }
            >
              Large
            </button>

<select
  onChange={(e) =>
    changeFontFamily(e.target.value)
  }
>

  <option>
    Select Font
  </option>

  {fonts.map((font) => (

    <option
      key={font}
      value={font}
    >
      {font}
    </option>

  ))}

</select>

          </div>

          {/* SELECTED INFO */}
          {selectedObject && (
            <div className="selected-info">

              <p>
                Selected:
                {" "}
                {selectedObject.type}
              </p>

            </div>
          )}

        </aside>

        {/* CENTER WORKSPACE */}
        <main className="workspace">

          <div className="canvas-container">

            <div className="yearbook-page">

              <canvas id="editor-canvas"></canvas>

              <span className="page-size">
                A4 · 794 × 1123
              </span>

            </div>

          </div>

        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="right-sidebar">

          <div className="pages-scroll">

            {pages.map((page, index) => (

              <div
                key={page.id}
                className={`page-thumbnail ${
                  activePage === page.id
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActivePage(page.id)
                }
              >

                <div className="thumb-preview">
                  <span>
                    Page {index + 1}
                  </span>
                </div>

                <div className="thumb-footer">
                  <p>{page.title}</p>
                </div>

              </div>

            ))}

          </div>

          <button
            className="add-page-button"
            onClick={addPage}
          >
            <FiPlus />
            Add Page
          </button>

        </aside>

      </div>
    </div>
  );
}

export default DesignStudio;