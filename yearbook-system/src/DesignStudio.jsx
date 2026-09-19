
import axios from "axios";
import * as fabric from "fabric";
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  FiType,
  FiImage,
  FiSquare,
  FiGrid,
  FiPlus,
  FiBold,
  FiItalic,
  FiUnderline,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiMinus,
  FiPlusCircle,
  FiCopy,
  FiChevronsUp,
  FiChevronsDown,
  FiArrowUp,
  FiArrowDown,
  FiUsers,
  FiBookOpen,
  FiMessageCircle,
} from "react-icons/fi";


import "./designstudio.css";

import PagePreview from "./components/PagePreview";
import StudentList from "./components/StudentList";
import FacultyList from "./components/FacultyList";
import MemoryList from "./components/MemoryList";

import { preparePhotos } from "./design/engine/PhotoUploadManager";
import { buildPhotoFrames } from "./design/engine/CanvasPhotoLayout";
import { enableSmartGuides } from "./design/engine/CanvasGuides";

import { applyTemplate } from "./templates";
import { FacultyLayout } from "./templates/layouts/FacultyLayout";

import { buildStudentGroups } from "./buildStudentGroups";


fabric.FabricObject.customProperties = [
  "objectType",
  "studentId",
  "studentName",
  "studentNickname",
  "studentQuote",
  "studentData",
  "studentTextField",
  "facultyId",
  "memoryId",
  "memoryType",
];


function DesignStudio() {


  const [showPublishMenu, setShowPublishMenu] = useState(false);

const [showPublishModal, setShowPublishModal] = useState(false);

const [publishData, setPublishData] = useState({
  title: "",
  batch_name: "",
  academic_year: "",
  description: "",
});

  const navigate = useNavigate();
  const location = useLocation();
  const [yearbookId, setYearbookId] = useState(null);

const canvasRef = useRef(null);
const isLoadingRef = useRef(false);
const canvasReadyRef = useRef(false);
const [scale, setScale] = useState(1);

const selectedObjectRef = useRef(null);

/*
=========================================================
STUDENT GROUP TEXT EDITING

When a student name/nickname/quote is being edited,
this stores the actual textbox.

IMPORTANT:
The Fabric ACTIVE object remains the student-group.
=========================================================
*/
const editingStudentTextRef = useRef(null);

const ignoreSelectionClearRef = useRef(false);

const [students, setStudents] = useState([]);
const [showStudentsPanel, setShowStudentsPanel] = useState(false);

// Track students already inserted into the yearbook
const [insertedStudentIds, setInsertedStudentIds] = useState([]);
const [faculty, setFaculty] = useState([]);
const [showFacultyPanel, setShowFacultyPanel] = useState(false);

  const [showTemplatePanel, setShowTemplatePanel] = useState(false);

const [activePage, setActivePage] = useState(1);
const [memories, setMemories] = useState([]);
const [showMemoriesPanel, setShowMemoriesPanel] = useState(false);
const activePageRef = useRef(1);

const [draggedPageId, setDraggedPageId] = useState(null);
const [dragOverPageId, setDragOverPageId] = useState(null);

const [selectedObject, setSelectedObject] = useState(null);
const [toolbarVisible, setToolbarVisible] = useState(false);
const [toolbarState, setToolbarState] = useState({
  fontWeight: "normal",
  fontStyle: "normal",
  textAlign: "left",
  underline: false,
});

const isTextSelected =
    selectedObject?.type === "textbox" ||
    selectedObject?.objectType ===
        "student-group";

const syncSelectedObject = () => {
    const canvas = canvasRef.current;

    const activeObject =
        canvas?.getActiveObject();

    /*
    =====================================================
    IMPORTANT

    If we are editing student text, the GROUP remains
    the selected object.

    The textbox itself is stored separately.
    =====================================================
    */

    if (
        editingStudentTextRef.current &&
        activeObject?.objectType ===
            "student-group"
    ) {
        const textObject =
            editingStudentTextRef.current;

        selectedObjectRef.current =
            activeObject;

        setSelectedObject(activeObject);

        setToolbarVisible(true);

        setToolbarState({
            fontWeight:
                textObject.fontWeight ||
                "normal",

            fontStyle:
                textObject.fontStyle ||
                "normal",

            textAlign:
                textObject.textAlign ||
                "left",

            underline:
                !!textObject.underline,
        });

        return activeObject;
    }

    /*
    =====================================================
    NORMAL OBJECT
    =====================================================
    */

    if (activeObject) {
        selectedObjectRef.current =
            activeObject;

        setSelectedObject(
            activeObject
        );

        setToolbarVisible(true);

        setToolbarState({
            fontWeight:
                activeObject.fontWeight ||
                "normal",

            fontStyle:
                activeObject.fontStyle ||
                "normal",

            textAlign:
                activeObject.textAlign ||
                "left",

            underline:
                !!activeObject.underline,
        });

        return activeObject;
    }

    /*
    =====================================================
    FALLBACK
    =====================================================
    */

    if (selectedObjectRef.current) {
        setSelectedObject(
            selectedObjectRef.current
        );

        setToolbarVisible(true);

        setToolbarState({
            fontWeight:
                selectedObjectRef.current
                    .fontWeight ||
                "normal",

            fontStyle:
                selectedObjectRef.current
                    .fontStyle ||
                "normal",

            textAlign:
                selectedObjectRef.current
                    .textAlign ||
                "left",

            underline:
                !!selectedObjectRef.current
                    .underline,
        });

        return selectedObjectRef.current;
    }

    selectedObjectRef.current =
        null;

    setSelectedObject(null);
    setToolbarVisible(false);

    setToolbarState({
        fontWeight: "normal",
        fontStyle: "normal",
        textAlign: "left",
        underline: false,
    });

    return null;
};

const duplicateObject = async () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    let obj = canvas.getActiveObject() || selectedObjectRef.current;

    if (!obj) return;

    // Resolve nested student photo/text editing back to the root group.
    const nestedStudentObjects = new Set([
        "student-text",
        "student-photo",
        "student-photo-border",
        "student-photo-placeholder",
    ]);

    if (nestedStudentObjects.has(obj?.objectType)) {
        const group = canvas
            .getObjects()
            .find(
                (item) =>
                    item.objectType === "student-group" &&
                    item._objects?.includes(obj)
            );

        if (group) {
            obj = group;
        }
    }

    if (!obj) return;

    if (obj.objectType !== "student-group") {
        const clone = await obj.clone();

        clone.set({
            left: (obj.left || 0) + 20,
            top: (obj.top || 0) + 20,
        });

        canvas.add(clone);
        canvas.setActiveObject(clone);
        canvas.requestRenderAll();

        selectedObjectRef.current = clone;
        setSelectedObject(clone);
        setToolbarVisible(true);
        editingStudentTextRef.current = null;

        await saveCurrentPage();
        return;
    }

    // Duplicate the entire group as a single Fabric object so future moves use
    // one active object instead of separate child objects.
    const clone = await obj.clone();

    clone.set({
        objectType: "student-group",
        selectable: true,
        evented: true,
        hasControls: true,
        hasBorders: true,
        lockUniScaling: true,
        subTargetCheck: true,
        interactive: true,
        left: (obj.left || 0) + 20,
        top: (obj.top || 0) + 20,
    });

    clone.setControlsVisibility({
        mt: true,
        mb: true,
        ml: true,
        mr: true,
        tl: true,
        tr: true,
        bl: true,
        br: true,
        mtr: true,
    });

    clone.setCoords();

    canvas.add(clone);
    canvas.setActiveObject(clone);
    canvas.requestRenderAll();

    selectedObjectRef.current = clone;
    setSelectedObject(clone);
    setToolbarVisible(true);

    editingStudentTextRef.current = null;

    await saveCurrentPage();
};


const bringToFront = async () => {
  const canvas = canvasRef.current;
  const obj =
    canvas?.getActiveObject() || selectedObjectRef.current;

  if (!obj) return;

  canvas.bringObjectToFront(obj);
  canvas.requestRenderAll();

  await saveCurrentPage();
};

const sendToBack = async () => {
  const canvas = canvasRef.current;
  const obj =
    canvas?.getActiveObject() || selectedObjectRef.current;

  if (!obj) return;

  canvas.sendObjectToBack(obj);
  canvas.requestRenderAll();

  await saveCurrentPage();
};

const bringForward = async () => {
  const canvas = canvasRef.current;
  const obj =
    canvas?.getActiveObject() || selectedObjectRef.current;

  if (!obj) return;

  canvas.bringObjectForward(obj);

  canvas.requestRenderAll();

  await saveCurrentPage();
};

const sendBackward = async () => {
  const canvas = canvasRef.current;
  const obj =
    canvas?.getActiveObject() || selectedObjectRef.current;

  if (!obj) return;

  canvas.sendObjectBackwards(obj);

  canvas.requestRenderAll();

  await saveCurrentPage();
};

const handleApplyTemplate = async (templateName) => {
  const pages = applyTemplate(templateName);

  if (!pages?.length) return;

  setPages(pages);
  pagesRef.current = pages;

  setActivePage(pages[0].id);
  activePageRef.current = pages[0].id;

  await loadPage(pages[0]);
};

const handleUploadImages = async (event) => {
  const files = Array.from(event.target.files || []);

  if (!files.length) return;

  const canvas = canvasRef.current;

  if (!canvas) {
    console.error("❌ Canvas is not ready");
    return;
  }

  try {
    const result = await preparePhotos(files);

    for (let index = 0; index < result.photos.length; index++) {
      const photo = result.photos[index];

      const img = await fabric.FabricImage.fromURL(
        photo.src
      );

      /*
      =====================================================
      CALCULATE INITIAL SIZE
      =====================================================
      */

      const maxWidth = 300;
      const maxHeight = 300;

      const imageWidth = img.width || 1;
      const imageHeight = img.height || 1;

      const scale = Math.min(
        maxWidth / imageWidth,
        maxHeight / imageHeight,
        1
      );

      /*
      =====================================================
      INITIAL POSITION
      =====================================================

      Each uploaded image gets a small offset so
      multiple images don't appear directly on top
      of each other.
      */

      const offset = index * 30;

      img.set({
        left: 80 + offset,
        top: 80 + offset,

        scaleX: scale,
        scaleY: scale,

        /*
        ===================================================
        FABRIC OBJECT BEHAVIOR
        ===================================================
        */

        selectable: true,
        evented: true,

        hasControls: true,
        hasBorders: true,

        lockUniScaling: false,

        objectType: "uploaded-photo",

        photoId: photo.id,
        photoName: photo.name,
      });

      /*
      =====================================================
      CUSTOM CONTROL VISIBILITY
      =====================================================
      */

      img.setControlsVisibility({
        mt: true,
        mb: true,
        ml: true,
        mr: true,

        tl: true,
        tr: true,
        bl: true,
        br: true,

        mtr: true,
      });

      img.setCoords();

      /*
      =====================================================
      ADD DIRECTLY TO CANVAS
      =====================================================
      */

      canvas.add(img);

      /*
      Make the newly uploaded image active.
      */

      canvas.setActiveObject(img);

      selectedObjectRef.current = img;
      setSelectedObject(img);
      setToolbarVisible(true);
    }

    canvas.requestRenderAll();

    /*
    =====================================================
    SAVE PAGE
    =====================================================
    */

    await saveCurrentPage();

    console.log(
      `✅ Uploaded ${result.photos.length} movable image(s)`
    );

  } catch (error) {
    console.error(
      "❌ Failed to upload images:",
      error
    );
  }

  /*
  =======================================================
  ALLOW SELECTING THE SAME FILE AGAIN
  =======================================================
  */

  event.target.value = "";
};

const insertMemory = async (memoriesToInsert) => {
  const canvas = canvasRef.current;

  if (!canvas) {
    console.error("❌ Canvas is not ready");
    return;
  }

  const selectedMemories = Array.isArray(memoriesToInsert)
    ? memoriesToInsert
    : [memoriesToInsert];

  if (!selectedMemories.length) {
    return;
  }

  console.log(
    "📦 Memories to insert:",
    selectedMemories
  );

  try {
    /*
    =====================================================
    GET MEMORIES ALREADY ON CURRENT CANVAS
    =====================================================
    */

    const existingMemoryIds = new Set(
      getInsertedMemoryIds()
    );

    /*
    =====================================================
    REMOVE DUPLICATES BEFORE INSERTING
    =====================================================
    */

    const memoriesToActuallyInsert =
      selectedMemories.filter((memory) => {
        const id =
          memory.id ??
          memory.memory_id ??
          memory.memoryId;

        if (
          id === undefined ||
          id === null
        ) {
          return true;
        }

        return !existingMemoryIds.has(
          String(id)
        );
      });

    if (!memoriesToActuallyInsert.length) {
      console.warn(
        "⚠️ All selected memories are already on the canvas."
      );

      return;
    }

    /*
    =====================================================
    INSERT MEMORIES
    =====================================================
    */

    for (
      let index = 0;
      index < memoriesToActuallyInsert.length;
      index++
    ) {
      const memory =
        memoriesToActuallyInsert[index];

      const memoryId =
        memory.id ??
        memory.memory_id ??
        memory.memoryId;

      const normalizedMemoryId =
        memoryId !== undefined &&
        memoryId !== null
          ? String(memoryId)
          : null;

      console.log(
        "📝 Processing memory:",
        memory
      );

      console.log(
        "🆔 Memory ID:",
        normalizedMemoryId
      );

      const offsetY = index * 250;

      /*
      =====================================================
      PHOTO
      =====================================================
      */

      if (memory.image) {
        const img =
          await fabric.FabricImage.fromURL(
            memory.image,
            {
              crossOrigin: "anonymous",
            }
          );

        img.set({
          left: 80,
          top: 50 + offsetY,

          scaleX: 0.3,
          scaleY: 0.3,

          selectable: true,
          evented: true,

          /*
          IMPORTANT
          */

          objectType: "memory-photo",
          memoryId: normalizedMemoryId,
        });

        canvas.add(img);

        console.log(
          "✅ Memory photo added:",
          normalizedMemoryId
        );
      }

      /*
      =====================================================
      MESSAGE
      =====================================================
      */

      if (
        memory.message &&
        String(memory.message).trim() !== ""
      ) {
        const messageText =
          String(memory.message).trim();

        const message =
          new fabric.Textbox(
            messageText,
            {
              left: 350,
              top: 100 + offsetY,

              width: 350,

              fontSize: 20,
              fontFamily: "Georgia",

              fill: "#222222",

              lineHeight: 1.3,

              textAlign: "left",

              editable: true,

              selectable: true,
              evented: true,

              objectCaching: false,

              /*
              IMPORTANT
              */

              objectType: "memory-message",
              memoryId: normalizedMemoryId,
            }
          );

        canvas.add(message);

        canvas.bringObjectToFront(
          message
        );

        console.log(
          "✅ Memory message added:",
          normalizedMemoryId
        );
      }
    }

    canvas.renderAll();

    /*
    =====================================================
    SAVE
    =====================================================
    */

    await saveCurrentPage();

    console.log(
      `✅ Successfully added ${
        memoriesToActuallyInsert.length
      } memory/memories`
    );

  } catch (error) {
    console.error(
      "❌ Failed to insert memories:",
      error
    );
  }
};


const insertSelectedMemories = async (selectedMemories) => {
  const canvas = canvasRef.current;

  if (!canvas || !selectedMemories?.length) {
    return;
  }

  try {
    // Insert ALL selected memories at once
    await insertMemory(selectedMemories);

    canvas.renderAll();

    console.log(
      `✅ Added ${selectedMemories.length} memories`
    );

    // Close modal after inserting
    setShowMemoriesPanel(false);

  } catch (error) {
    console.error(
      "❌ Failed to insert selected memories:",
      error
    );
  }
};


const insertFaculty = async (
  member,
  index = 0
) => {
  const canvas = canvasRef.current;

  if (!canvas) {
    console.error("❌ Canvas is not ready");
    return;
  }

  try {
    console.log("👨‍🏫 Inserting faculty:", member);

    // ==========================================
    // POSITION
    // ==========================================

    const offsetX = (index % 2) * 380;
    const offsetY =
      Math.floor(index / 2) * 560;

    // ==========================================
    // 1. FACULTY PHOTO
    // ==========================================

    if (member.photo) {
      const img =
        await fabric.FabricImage.fromURL(
          member.photo,
          {
            crossOrigin: "anonymous",
          }
        );

      const maxWidth = 250;
      const maxHeight = 300;

      const scale = Math.min(
        maxWidth / img.width,
        maxHeight / img.height
      );

img.set({
  left: 70 + offsetX,
  top: 40 + offsetY,

  scaleX: scale,
  scaleY: scale,

  selectable: true,

  // IMPORTANT
  objectType: "faculty-photo",
  facultyId: member.id,
});

      canvas.add(img);
    }

    // ==========================================
    // 2. FACULTY NAME
    // ==========================================

    const name = member.name || "";

    if (String(name).trim()) {
      const nameText =
        new fabric.Textbox(
          String(name).trim(),
{
  left: 45 + offsetX,
  top: 355 + offsetY,

  width: 300,

  fontSize: 24,
  fontWeight: "bold",
  fontFamily: "Poppins",

  fill: "#222222",

  textAlign: "center",

  editable: true,
  selectable: true,

  objectCaching: false,

  // IMPORTANT
  objectType: "faculty-name",
  facultyId: member.id,
}
        );

      canvas.add(nameText);
    }

    // ==========================================
    // 3. POSITION
    // ==========================================

    const position =
      member.position || "";

    if (String(position).trim()) {
      const positionText =
        new fabric.Textbox(
          String(position).trim(),
{
  left: 45 + offsetX,
  top: 390 + offsetY,

  width: 300,

  fontSize: 18,
  fontFamily: "Poppins",

  fill: "#666666",

  textAlign: "center",

  editable: true,
  selectable: true,

  objectCaching: false,

  // IMPORTANT
  objectType: "faculty-position",
  facultyId: member.id,
}
        );

      canvas.add(positionText);
    }

    // ==========================================
    // 4. FACULTY MESSAGE
    // ==========================================

const message = member.message || "";

    if (String(message).trim()) {
      const messageText =
        new fabric.Textbox(
          `"${String(message).trim()}"`,
{
  left: 35 + offsetX,
  top: 430 + offsetY,

  width: 320,

  fontSize: 16,
  fontFamily: "Georgia",
  fontStyle: "italic",

  fill: "#444444",

  textAlign: "center",
  lineHeight: 1.3,

  editable: true,
  selectable: true,

  objectCaching: false,

  // IMPORTANT
  objectType: "faculty-message",
  facultyId: member.id,
}
        );

      canvas.add(messageText);
    }

    canvas.renderAll();

    console.log(
      "✅ Faculty inserted:",
      {
        name: member.name,
        position: member.position,
        message:
          member.message ||
          member.quote,
      }
    );

  } catch (error) {
    console.error(
      "❌ Failed to insert faculty:",
      error
    );
  }
};

const insertSelectedFaculty = async (
  selectedFaculty
) => {
  const canvas = canvasRef.current;

  if (
    !canvas ||
    !selectedFaculty?.length
  ) {
    return;
  }

  try {
    for (
      let index = 0;
      index < selectedFaculty.length;
      index++
    ) {
      await insertFaculty(
        selectedFaculty[index],
        index
      );
    }

    canvas.renderAll();

    await saveCurrentPage();

    console.log(
      `✅ Added ${selectedFaculty.length} faculty members`
    );

    // Close faculty modal
    setShowFacultyPanel(false);

  } catch (error) {
    console.error(
      "❌ Failed to insert faculty:",
      error
    );
  }
};

const handleToolbarPointerDown = (event) => {
  event?.stopPropagation?.();
  ignoreSelectionClearRef.current = true;
  syncSelectedObject();
};

const hideToolbar = () => {
  if (selectedObjectRef.current) {
    setToolbarVisible(true);
    return;
  }
  setToolbarVisible(false);
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

  return pageJson;
};

const hasPageContent = (page) => {
  const pageJson = normalizePageJson(page);
  return Boolean(
    pageJson?.objects?.length ||
      (pageJson?.background && pageJson.background !== "#fff") ||
      pageJson?.backgroundImage
  );
};

const getBestThumbnailPage = (pages) => {
  if (!Array.isArray(pages)) return null;

  const activePage = pages.find((page) =>
    page.id === activePageRef.current && hasPageContent(page)
  );
  if (activePage) return activePage;

  const nonEmptyPage = pages.find(hasPageContent);
  if (nonEmptyPage) return nonEmptyPage;

  return pages[0] || null;
};

const generateThumbnailFromPage = async (pageJson, canvasSize) => {
  const normalized = normalizePageJson({ json: pageJson });
  if (!normalized) return null;

  return new Promise((resolve) => {
    const tempCanvas = new fabric.StaticCanvas(null, {
      width: canvasSize.width,
      height: canvasSize.height,
      backgroundColor: "#fff",
      enableRetinaScaling: true,
    });

    tempCanvas.loadFromJSON(normalized, () => {
      tempCanvas.renderAll();
      resolve(
        tempCanvas.toDataURL({
          format: "png",
          quality: 1,
          multiplier: 2,
        })
      );
    });
  });
};


const getInsertedMemoryIds = () => {
  const canvas = canvasRef.current;

  if (!canvas) return [];

  return [
    ...new Set(
      canvas
        .getObjects()
        .map((obj) => obj.memoryId)
        .filter(
          (id) =>
            id !== undefined &&
            id !== null
        )
        .map(String)
    ),
  ];
};

const getInsertedStudentIds = () => {
  const canvas = canvasRef.current;

  if (!canvas) return [];

  return [
    ...new Set(
      canvas
        .getObjects()
        .filter(
          (obj) =>
            obj.objectType === "student-group"
        )
        .map(
          (obj) => obj.studentId
        )
        .filter(
          (id) =>
            id !== undefined &&
            id !== null
        )
        .map(String)
    ),
  ];
};

const createStudentPage = async (studentChunk) => {
  const canvas = canvasRef.current;

  if (!canvas || !studentChunk?.length) {
    return null;
  }

  try {
    /*
    =====================================================
    1. SAVE CURRENT PAGE
    =====================================================
    */

    await saveCurrentPage();

    /*
    =====================================================
    2. CREATE NEW PAGE
    =====================================================
    */

    const newPage = {
      id: Date.now() + Math.random(),
      title: `Page ${pagesRef.current.length + 1}`,
      type: "students",
      json: null,
      preview: "",
    };

    const updatedPages = [
      ...pagesRef.current,
      newPage,
    ];

    /*
    =====================================================
    3. UPDATE PAGE LIST FIRST
    =====================================================
    */

    const normalizedPages = updatedPages.map(
      (page, index) => ({
        ...page,

        title:
          page.type === "faculty"
            ? page.title
            : index === 0
            ? "Cover"
            : `Page ${index + 1}`,
      })
    );

    pagesRef.current = normalizedPages;
    setPages([...normalizedPages]);

    /*
    =====================================================
    4. SWITCH ACTIVE PAGE
    =====================================================
    */

    activePageRef.current = newPage.id;
    setActivePage(newPage.id);

    /*
    =====================================================
    5. PREVENT AUTOSAVE WHILE CLEARING/SWITCHING
    =====================================================
    */

    isLoadingRef.current = true;

    canvas.clear();

    canvas.backgroundColor = "#ffffff";

    canvas.renderAll();

    /*
    =====================================================
    6. INSERT STUDENTS
    =====================================================
    */

    await buildStudentGroups(
      canvas,
      studentChunk,
      {
        columns: 3,
        gapX: 15,
        gapY: 15,
        marginX: 20,
        marginY: 20,
        removeExisting: false,
      }
    );

    canvas.requestRenderAll();

    /*
    =====================================================
    7. ENABLE AUTOSAVE AGAIN
    =====================================================
    */

    isLoadingRef.current = false;

    /*
    =====================================================
    8. SAVE NEW PAGE + GENERATE PREVIEW
    =====================================================
    */

    const savedPages = await saveCurrentPage();

    /*
    =====================================================
    9. UPDATE PREVIEW IMMEDIATELY
    =====================================================
    */

    pagesRef.current = savedPages;

    setPages([...savedPages]);

    console.log(
      "📄 Automatically created student page:",
      newPage.id
    );

    return savedPages.find(
      (page) => page.id === newPage.id
    );
  } catch (error) {
    isLoadingRef.current = false;

    console.error(
      "❌ Failed to create student page:",
      error
    );

    return null;
  }
};

const insertStudents = async (selectedStudents) => {
  if (!selectedStudents?.length) {
    return;
  }

  const canvas = canvasRef.current;

  if (!canvas) {
    console.error("❌ Canvas is not ready");
    return;
  }

  try {
    /*
    =====================================================
    CONFIG
    =====================================================
    */

    const STUDENTS_PER_PAGE = 2;

    /*
    =====================================================
    GET STUDENTS ALREADY IN CURRENT CANVAS
    =====================================================
    */

    const existingIds = new Set(
      getInsertedStudentIds().map(String)
    );

    
    /*
    =====================================================
    REMOVE DUPLICATES
    =====================================================
    */

    const studentsToInsert =
      selectedStudents.filter((student) => {
        const id =
          student.id ??
          student.student_id ??
          student.studentId;

        if (
          id === undefined ||
          id === null
        ) {
          return true;
        }

        return !existingIds.has(
          String(id)
        );
      });

    if (!studentsToInsert.length) {
      console.warn(
        "⚠️ All selected students are already inserted."
      );

      return;
    }

    /*
    =====================================================
    COUNT STUDENTS CURRENTLY ON PAGE
    =====================================================
    */

    let currentStudentIds =
      getInsertedStudentIds();

    let currentStudentCount =
      currentStudentIds.length;

    console.log(
      "📊 Current page students:",
      currentStudentCount
    );

    console.log(
      "📦 Students to insert:",
      studentsToInsert.length
    );

    /*
    =====================================================
    REMAINING STUDENTS TO PROCESS
    =====================================================
    */

    let remainingStudents = [
      ...studentsToInsert,
    ];

    /*
    =====================================================
    INSERT INTO CURRENT PAGE FIRST
    =====================================================
    */

    if (
      currentStudentCount <
      STUDENTS_PER_PAGE
    ) {
      const availableSlots =
        STUDENTS_PER_PAGE -
        currentStudentCount;

      const currentPageStudents =
        remainingStudents.slice(
          0,
          availableSlots
        );

      if (currentPageStudents.length) {
        console.log(
          `➕ Adding ${currentPageStudents.length} students to current page`
        );

        await buildStudentGroups(
          canvas,
          currentPageStudents,
          {
            columns: 2,
            gapX: 15,
            gapY: 15,
            marginX: 20,
            marginY: 20,
            removeExisting: false,
          }
        );

        canvas.requestRenderAll();

        await saveCurrentPage();

        /*
        -------------------------------------------------
        REMOVE INSERTED STUDENTS FROM QUEUE
        -------------------------------------------------
        */

        remainingStudents =
          remainingStudents.slice(
            currentPageStudents.length
          );

        currentStudentCount +=
          currentPageStudents.length;
      }
    }

    /*
    =====================================================
    CREATE AUTOMATIC NEW PAGES
    =====================================================
    */

    while (remainingStudents.length > 0) {
      /*
      ---------------------------------------------------
      TAKE MAXIMUM 9 STUDENTS
      ---------------------------------------------------
      */

      const nextChunk =
        remainingStudents.slice(
          0,
          STUDENTS_PER_PAGE
        );

      console.log(
        "📄 Automatically creating page for:",
        nextChunk.length,
        "students"
      );

      /*
      ---------------------------------------------------
      CREATE PAGE + INSERT STUDENTS
      ---------------------------------------------------
      */

      await createStudentPage(
        nextChunk
      );

      /*
      ---------------------------------------------------
      REMOVE PROCESSED STUDENTS
      ---------------------------------------------------
      */

      remainingStudents =
        remainingStudents.slice(
          nextChunk.length
        );

      /*
      ---------------------------------------------------
      NEW PAGE IS NOW FULL/PARTIALLY FULL
      ---------------------------------------------------
      */

      currentStudentCount =
        nextChunk.length;
    }



    /*
    =====================================================
    FINAL PAGE UPDATE
    =====================================================
    */

    const finalPages =
      pagesRef.current;

    setPages([...finalPages]);

    canvas.requestRenderAll();

    setShowStudentsPanel(false);

    console.log(
      `✅ Added ${studentsToInsert.length} students automatically`
    );

    console.log(
      `📄 Total pages now: ${finalPages.length}`
    );

  } catch (error) {
    console.error(
      "❌ Error inserting students:",
      error
    );
  }
};

const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];

  const bstr = atob(arr[1]);

  let n = bstr.length;

  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File(
    [u8arr],
    filename,
    { type: mime }
  );
};

const handleSaveDraft = async () => {
  try {
    const canvas = canvasRef.current;

    if (!canvas) {
      alert("Canvas is not ready.");
      return;
    }

    // ==========================================
    // SAVE CURRENT PAGE FIRST
    // ==========================================

    canvas.discardActiveObject();
    canvas.renderAll();

    await new Promise((resolve) =>
      requestAnimationFrame(resolve)
    );

    const updatedPages = await saveCurrentPage();

    // ==========================================
    // REMOVE LARGE PREVIEW DATA FROM PAGES
    // ==========================================
    //
    // The preview is only needed for the UI.
    // Sending all page previews can make the
    // request extremely large.
    //

    const pagesToSave = updatedPages.map((page) => ({
      id: page.id,
      title: page.title,
      type: page.type || null,
      facultyPage: page.facultyPage || false,
      json: page.json,
    }));

    // ==========================================
    // CREATE COVER THUMBNAIL
    // ==========================================

    const coverPage = pagesToSave[0];

    const thumbnail = coverPage?.json
      ? await createThumbnail(coverPage.json)
      : null;

    console.log(
      "📕 Cover thumbnail generated:",
      thumbnail
        ? `${Math.round(thumbnail.length / 1024)} KB`
        : "none"
    );

    // ==========================================
    // PAYLOAD
    // ==========================================

    const payload = {
      title:
        publishData.title ||
        "Untitled Yearbook",

      batch_name:
        publishData.batch_name ||
        "",

      academic_year:
        publishData.academic_year ||
        "",

      description:
        publishData.description ||
        "",

      pages: pagesToSave,

      thumbnail,
    };

    console.log(
      "💾 Saving draft..."
    );

    console.log(
      "📄 Pages:",
      pagesToSave.length
    );

    console.log(
      "📦 Payload size:",
      (
        JSON.stringify(payload).length /
        1024 /
        1024
      ).toFixed(2),
      "MB"
    );

    // ==========================================
    // CREATE OR UPDATE
    // ==========================================

    let response;

    if (yearbookId) {
      // ========================================
      // EXISTING YEARBOOK
      // ========================================

      response = await axios.put(
        `http://localhost:5000/api/yearbooks/save-draft/${yearbookId}`,
        payload
      );

      console.log(
        "✅ Existing yearbook saved as draft:",
        yearbookId
      );

    } else {
      // ========================================
      // NEW YEARBOOK
      // ========================================

      response = await axios.post(
        "http://localhost:5000/api/yearbooks/save-draft",
        payload
      );

      if (response.data.yearbookId) {
        setYearbookId(
          response.data.yearbookId
        );

        console.log(
          "🆕 New draft created:",
          response.data.yearbookId
        );
      }
    }

    alert("✅ Yearbook saved as draft!");

  } catch (err) {
    console.error(
      "❌ Save draft error:",
      err.response?.data || err
    );

    console.error(
      "Status:",
      err.response?.status
    );

    console.error(
      "Message:",
      err.message
    );

    alert(
      err.response?.data?.message ||
      "Failed to save yearbook draft."
    );
  }
};

const [pages, setPages] = useState([
{
    id:1,
    title:"Cover",
    json:null,
}
]);

const switchPage = async (pageId) => {

    const updatedPages = await saveCurrentPage();

    activePageRef.current = pageId;
    setActivePage(pageId);

    const page = updatedPages.find(p => p.id === pageId);

    if(page){
        loadPage(page);
    }

};
const addPage = () => {
  const currentPages = pagesRef.current;

  const currentIndex = currentPages.findIndex(
    (page) => page.id === activePageRef.current
  );

  const newPage = {
    id: Date.now(),
    title: `Page ${currentPages.length + 1}`,
    json: null,
  };

  // Insert immediately AFTER the currently active page
  const insertIndex =
    currentIndex === -1
      ? currentPages.length
      : currentIndex + 1;

  const updated = [
    ...currentPages.slice(0, insertIndex),
    newPage,
    ...currentPages.slice(insertIndex),
  ];

  // Re-number page titles
  const normalizedPages = updated.map((page, index) => ({
    ...page,
    title:
      page.type === "faculty"
        ? page.title
        : index === 0
        ? "Cover"
        : `Page ${index + 1}`,
  }));

  pagesRef.current = normalizedPages;
  setPages(normalizedPages);

  activePageRef.current = newPage.id;
  setActivePage(newPage.id);

  requestAnimationFrame(() => {
    loadPage(newPage);
  });
};

const deletePage = async (pageId) => {
  if (!pageId) return;

  /*
   * Don't allow deleting the last page
   */
  if (pagesRef.current.length <= 1) {
    alert("You must have at least one page.");
    return;
  }

  const pageToDelete = pagesRef.current.find(
    (page) => page.id === pageId
  );

  if (!pageToDelete) return;

  const confirmed = window.confirm(
    `Are you sure you want to delete "${pageToDelete.title}"?`
  );

  if (!confirmed) return;

  /*
   * Save the currently active page first
   */
  let currentPages = pagesRef.current;

  if (
    activePageRef.current &&
    canvasRef.current
  ) {
    currentPages = await saveCurrentPage();
  }

  /*
   * Find the page index BEFORE deleting
   */
  const deletedIndex = currentPages.findIndex(
    (page) => page.id === pageId
  );

  /*
   * Delete page
   */
  let updatedPages = currentPages.filter(
    (page) => page.id !== pageId
  );

  /*
   * Re-number normal pages
   */
  updatedPages = updatedPages.map(
    (page, index) => ({
      ...page,

      title:
        page.type === "faculty"
          ? page.title
          : index === 0
          ? "Cover"
          : `Page ${index + 1}`,
    })
  );

  /*
   * Update React + ref
   */
  pagesRef.current = updatedPages;
  setPages(updatedPages);

  /*
   * If deleted page was active,
   * open another page.
   */
  if (activePageRef.current === pageId) {
    const newIndex = Math.min(
      deletedIndex,
      updatedPages.length - 1
    );

    const nextPage =
      updatedPages[newIndex];

    activePageRef.current = nextPage.id;
    setActivePage(nextPage.id);

    requestAnimationFrame(() => {
      loadPage(nextPage);
    });
  }

  console.log(
    `🗑️ Deleted page: ${pageToDelete.title}`
  );
};

const addFacultyPage = () => {

    const facultyPages = pagesRef.current.filter(
        page => page.type === "faculty"
    );


    const newFacultyPage = {
        id: Date.now(),

        title:
        `Faculty ${facultyPages.length + 1}`,

        type:"faculty",

        facultyPage:true,

        json: FacultyLayout(),
    };


    const updated = [
        ...pagesRef.current.slice(
            0,
            pagesRef.current.length
        ),
        newFacultyPage
    ];


    pagesRef.current = updated;

    setPages(updated);


    activePageRef.current =
        newFacultyPage.id;

    setActivePage(newFacultyPage.id);


    requestAnimationFrame(()=>{
        loadPage(newFacultyPage);
    });

};

const calculateInitialScale = useCallback(() => {
  const workspace = document.querySelector(".workspace");

  if (!workspace) return;

  const availableWidth = workspace.clientWidth - 40;
  const availableHeight = workspace.clientHeight - 40;

  const widthScale = availableWidth / 794;
  const heightScale = availableHeight / 1123;

  const fitScale = Math.min(widthScale, heightScale);

  setScale(Math.min(fitScale, 1));
}, []);

useEffect(() => {
  const timer = setTimeout(() => {
    calculateInitialScale();
  }, 50);

  return () => clearTimeout(timer);
}, [calculateInitialScale]);

const loadPage = async (page) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  isLoadingRef.current = true;

  try {
    canvas.clear();

    // Always reset the Fabric canvas background first
    canvas.backgroundColor = "#ffffff";

    if (!page?.json) {
      canvas.renderAll();
      return;
    }

    console.log("Loading page:", page);

    let pageJson = page.json;

    // Handle JSON saved as string
    if (typeof pageJson === "string") {
      pageJson = JSON.parse(pageJson);
    }

    await canvas.loadFromJSON(pageJson);

    // IMPORTANT:
    // Force white page background after template JSON loads
    canvas.backgroundColor = "#ffffff";

    canvas.renderAll();

  } catch (error) {
    console.error("❌ Failed to load page:", error);

    canvas.clear();
    canvas.backgroundColor = "#ffffff";
    canvas.renderAll();

  } finally {
    isLoadingRef.current = false;
  }
};

const pagesRef = useRef(pages);

useEffect(() => {
  pagesRef.current = pages;
}, [pages]);

  const [showShapesPanel, setShowShapesPanel] = useState(false);

const savePage = async (pageId) => {
  const canvas = canvasRef.current;
  if (!canvas) return pagesRef.current;

  const json = canvas.toJSON();

const preview = await createThumbnail(json);

  const updated = pagesRef.current.map((p) =>
    p.id === pageId
      ? {
          ...p,
          json,
          preview,
        }
      : p
  );

  pagesRef.current = updated;
  setPages(updated);

  return updated;
};

  useEffect(() => {
  activePageRef.current = activePage;
}, [activePage]);

  // KEYBOARD DELETE SUPPORT
useEffect(() => {
  const handleKeyDown = async (e) => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    /*
    =====================================================
    DON'T DELETE WHILE TYPING
    =====================================================
    */

    const activeElement =
      document.activeElement;

    const isTyping =
      activeElement?.tagName === "INPUT" ||
      activeElement?.tagName === "TEXTAREA" ||
      activeElement?.isContentEditable;

    /*
    Student textbox editing is handled specially.
    */

    const editingText =
      editingStudentTextRef.current;

    if (editingText?.isEditing) {
      return;
    }

    /*
    =====================================================
    DELETE / BACKSPACE
    =====================================================
    */

    if (
      e.key !== "Delete" &&
      e.key !== "Backspace"
    ) {
      return;
    }

    if (isTyping) {
      return;
    }

    let activeObject =
      canvas.getActiveObject() ||
      selectedObjectRef.current;

    if (!activeObject) return;

    /*
    =====================================================
    STUDENT CHILD → STUDENT GROUP
    =====================================================
    */

    activeObject =
      getRootStudentGroup(
        canvas,
        activeObject
      );

    e.preventDefault();

    /*
    =====================================================
    DELETE
    =====================================================
    */
const deletedStudentId =
  activeObject?.objectType === "student-group"
    ? activeObject.studentId
    : null;

canvas.discardActiveObject();

canvas.remove(activeObject);

editingStudentTextRef.current = null;
selectedObjectRef.current = null;

setSelectedObject(null);
setToolbarVisible(false);

/*
=====================================================
SYNC STUDENT LIST
=====================================================
*/

if (deletedStudentId !== null) {
  setInsertedStudentIds(
    getInsertedStudentIds()
  );
}

canvas.requestRenderAll();

await saveCurrentPage();    canvas.discardActiveObject();

    canvas.remove(activeObject);

    editingStudentTextRef.current = null;
    selectedObjectRef.current = null;

    setSelectedObject(null);
    setToolbarVisible(false);

    canvas.requestRenderAll();

    await saveCurrentPage();

    console.log(
      "🗑️ Deleted:",
      activeObject.objectType
    );
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


  useEffect(() => {
  axios
    .get("http://localhost:5000/api/admin/memories", {
      withCredentials: true,
    })
    .then((res) => {
      // Only approved memories
      const approved = res.data.filter(
        (item) => item.status === "approved"
      );

      setMemories(approved);
    })
    .catch((err) => {
      console.error("Failed to fetch memories:", err);
    });
}, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/students/yearbook", {
        withCredentials: true,
      })
      .then((res) => {
        const data = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.students)
            ? res.data.students
            : [];

        setStudents(data);
      })
      .catch((err) => {
        console.error("Failed to fetch students for design studio:", err);
        setStudents([]);
      });
  }, []);

useEffect(() => {
  axios
    .get("http://localhost:5000/api/faculty/yearbook", {
      withCredentials: true,
    })
    .then((res) => {
      const data = Array.isArray(res?.data)
        ? res.data
        : [];

      setFaculty(data);
    })
    .catch((err) => {
      console.error("Failed to fetch faculty for design studio:", err);
      setFaculty([]);
    });
}, []);

useEffect(() => {
  if (!location.state) return;

  const { pages: rawPages = [], yearbookId } = location.state;

  let parsedPages = [];

  try {
    parsedPages =
      typeof rawPages === "string"
        ? JSON.parse(rawPages)
        : rawPages;
  } catch (e) {
    parsedPages = [];
  }

  if (parsedPages.length) {
    setPages(parsedPages);
    pagesRef.current = parsedPages;

    setActivePage(parsedPages[0].id);
    activePageRef.current = parsedPages[0].id;

    requestAnimationFrame(() => {
      loadPage(parsedPages[0]);
    });
  }

  if (yearbookId) {
    setYearbookId(yearbookId);
  }
}, [location.state]);

  // ADD TEXT
  const addText = () => {

const text = new fabric.Textbox("New Text", {
  left: 100,
  top: 100,
  width: 200,
  fontSize: 28,
  fontFamily: "Arial",
  fill: "#000000",
});

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


    // SAVE CURRENT PAGE
const saveCurrentPage = async () => {

    const canvas = canvasRef.current;

    if (!canvas) {
        return pagesRef.current;
    }

    const json = canvas.toJSON();

    const preview = await createThumbnail(json);

    const updated = pagesRef.current.map(
        (page) =>
            page.id === activePageRef.current
                ? {
                      ...page,
                      json,
                      preview: preview || page.preview || page.thumbnail || "",
                  }
                : page
    );

    pagesRef.current = updated;

    setPages(updated);

    return updated;
};

const saveAsTemplate = async () => {
  const canvas = canvasRef.current;

  await saveCurrentPage();

  const allPages = pagesRef.current;

  // 🔥 generate thumbnail from FIRST page
  let thumbnail = null;

  if (allPages?.[0]?.json) {
    thumbnail = await generateThumbnailFromPage(
      allPages[0].json,
      {
        width: canvas.width,
        height: canvas.height,
      }
    );
  }

  try {
    await axios.post("http://localhost:5000/api/themes/save-template", {
      theme_name: "Custom Template",
      description: "Created from design studio",
      created_by: 3,
      pages: allPages,
      thumbnail, // 🔥 ADD THIS
    });

    alert("Template saved with preview!");
  } catch (err) {
    console.log(err);
  }
};

const customizeTheme = async (theme) => {
  const res = await axios.post(
    "http://localhost:5000/api/yearbooks/create-from-theme",
    {
      title: "My Yearbook 2026",
      theme_id: theme.id,
    }
  );

  navigate("/admin/design", {
    state: {
      pages: res.data.theme_pages,
      yearbookId: res.data.yearbook_id,
    },
  });
};

const saveYearbook = async () => {
  await axios.put(
    `http://localhost:5000/api/yearbooks/${yearbookId}`,
    {
      pages: pagesRef.current,
    }
  );

  alert("Yearbook Saved");
};

const getRootStudentGroup = (canvas, object) => {
  if (!canvas || !object) return object;

  if (object.objectType === "student-group") {
    return object;
  }

  const studentObjects = new Set([
    "student-text",
    "student-photo",
    "student-photo-border",
    "student-photo-placeholder",
  ]);

  if (studentObjects.has(object.objectType)) {
    const group = canvas
      .getObjects()
      .find(
        (item) =>
          item.objectType === "student-group" &&
          item._objects?.includes(object)
      );

    if (group) {
      return group;
    }
  }

  return object;
};

  // DELETE OBJECT
const deleteObject = async () => {
  const canvas = canvasRef.current;

  if (!canvas) return;

  let activeObject =
    canvas.getActiveObject() ||
    selectedObjectRef.current;

  if (!activeObject) return;

  /*
  =====================================================
  IF STUDENT TEXT IS BEING EDITED
  =====================================================
  */

  const editingText =
    editingStudentTextRef.current;

  if (editingText) {
    const group = canvas
      .getObjects()
      .find(
        (obj) =>
          obj.objectType === "student-group" &&
          obj._objects?.includes(editingText)
      );

    if (group) {
      activeObject = group;
    }
  }

  /*
  =====================================================
  RESOLVE STUDENT CHILD → STUDENT GROUP
  =====================================================
  */

  activeObject = getRootStudentGroup(
    canvas,
    activeObject
  );

  /*
  =====================================================
  SAVE ID BEFORE REMOVING
  =====================================================
  */

  const deletedStudentId =
    activeObject?.objectType === "student-group"
      ? activeObject.studentId
      : null;

  /*
  =====================================================
  DELETE
  =====================================================
  */

  canvas.discardActiveObject();

  canvas.remove(activeObject);

  editingStudentTextRef.current = null;
  selectedObjectRef.current = null;

  setSelectedObject(null);
  setToolbarVisible(false);

  /*
  =====================================================
  UPDATE STUDENT TRACKING
  =====================================================
  */

  if (deletedStudentId !== null) {
    setInsertedStudentIds(
      getInsertedStudentIds()
    );
  }

  canvas.requestRenderAll();

  await saveCurrentPage();

  console.log(
    "🗑️ Deleted object:",
    activeObject.objectType,
    deletedStudentId
  );
};
  // CHANGE COLOR
  const changeColor = async (color) => {
    const activeObject =
      canvasRef.current?.getActiveObject() || selectedObjectRef.current;

    if (activeObject) {
      activeObject.set("fill", color);
      canvasRef.current.renderAll();
      selectedObjectRef.current = activeObject;
      setSelectedObject(activeObject);
      setToolbarVisible(true);
      setToolbarState({
        fontWeight: activeObject.fontWeight || "normal",
        fontStyle: activeObject.fontStyle || "normal",
        textAlign: activeObject.textAlign || "left",
        underline: !!activeObject.underline,
      });
      await saveCurrentPage();
    }
  };


  // CHANGE FONT SIZE
const changeFontSize = async (size) => {
    const canvas =
        canvasRef.current;

    if (!canvas) return;

    /*
    =====================================================
    DETERMINE WHICH TEXT SHOULD CHANGE
    =====================================================

    For a normal textbox:
        activeObject = textbox

    For student group:
        activeObject = student-group
        editingStudentTextRef = textbox
    =====================================================
    */

    let textObject =
        editingStudentTextRef.current;

    const activeObject =
        canvas.getActiveObject() ||
        selectedObjectRef.current;

    /*
    -----------------------------------------------------
    NORMAL TEXTBOX
    -----------------------------------------------------
    */

    if (
        !textObject &&
        activeObject?.type ===
            "textbox"
    ) {
        textObject =
            activeObject;
    }

    /*
    -----------------------------------------------------
    NO TEXT
    -----------------------------------------------------
    */

    if (
        !textObject ||
        textObject.objectType !==
            "student-text" &&
        textObject.type !==
            "textbox"
    ) {
        return;
    }

    /*
    =====================================================
    CHANGE FONT SIZE
    =====================================================
    */

    const newSize =
        Math.max(
            6,
            Number(size) || 6
        );

    textObject.set({
        fontSize:
            newSize,
    });

    /*
    IMPORTANT:

    Recalculate the textbox dimensions.
    */

    textObject.initDimensions();
    textObject.setCoords();

    /*
    =====================================================
    KEEP THE GROUP SELECTED
    =====================================================
    */

    if (
        activeObject?.objectType ===
        "student-group"
    ) {
        activeObject.setCoords();

        selectedObjectRef.current =
            activeObject;

        setSelectedObject(
            activeObject
        );
    } else {
        selectedObjectRef.current =
            textObject;

        setSelectedObject(
            textObject
        );
    }

    /*
    =====================================================
    UPDATE TOOLBAR
    =====================================================
    */

    setToolbarState({
        fontWeight:
            textObject.fontWeight ||
            "normal",

        fontStyle:
            textObject.fontStyle ||
            "normal",

        textAlign:
            textObject.textAlign ||
            "left",

        underline:
            !!textObject.underline,
    });

    canvas.requestRenderAll();

    await saveCurrentPage();
};

const publishYearbook = async () => {
    try {
        const canvas = canvasRef.current;

        if (!canvas) {
            alert("Canvas is not ready.");
            return;
        }

        // ==========================================
        // SAVE CURRENT PAGE
        // ==========================================

        const updatedPages = await saveCurrentPage();

        // ==========================================
        // REMOVE PREVIEWS FROM PUBLISH PAYLOAD
        // ==========================================

        const pagesForPublish = updatedPages.map((page) => ({
            id: page.id,
            title: page.title,
            type: page.type || null,
            facultyPage: page.facultyPage || false,

            // IMPORTANT:
            // Keep the actual Fabric JSON
            // but DON'T send the base64 preview.
            json: page.json,
        }));

        // ==========================================
        // SMALL YEARBOOK THUMBNAIL
        // ==========================================

// ==========================================
// YEARBOOK COVER THUMBNAIL
// ALWAYS USE FIRST PAGE
// ==========================================

const coverPage = pagesForPublish[0];

const thumbnail = coverPage?.json
    ? await createThumbnail(coverPage.json)
    : null;

console.log(
    "📕 Using cover page as yearbook thumbnail:",
    coverPage?.title
);

        // ==========================================
        // PAYLOAD
        // ==========================================

        const payload = {
            title: publishData.title,
            batch_name: publishData.batch_name,
            academic_year: publishData.academic_year,
            description: publishData.description,

            pages: pagesForPublish,

            thumbnail,
        };

        console.log(
            "📦 Publishing yearbook..."
        );

        console.log(
            "📄 Pages:",
            pagesForPublish.length
        );

        console.log(
            "📦 Payload size:",
            (
                JSON.stringify(payload).length /
                1024 /
                1024
            ).toFixed(2),
            "MB"
        );

        console.log(
            "👨‍🎓 Student objects:",
            pagesForPublish.reduce(
                (total, page) =>
                    total +
                    (page.json?.objects?.length || 0),
                0
            )
        );

        // ==========================================
        // PUBLISH
        // ==========================================

        let response;

        if (yearbookId) {

            // ======================================
            // EXISTING YEARBOOK
            // ======================================

            response = await axios.put(
                `http://localhost:5000/api/yearbooks/publish/${yearbookId}`,
                payload
            );

        } else {

            // ======================================
            // NEW YEARBOOK
            // ======================================

            response = await axios.post(
                "http://localhost:5000/api/yearbooks/publish",
                payload
            );

            if (response.data.yearbookId) {
                setYearbookId(
                    response.data.yearbookId
                );
            }
        }

        console.log(
            "✅ Publish response:",
            response.data
        );

        alert("🎉 Yearbook Published!");

        setShowPublishModal(false);
        setShowPublishMenu(false);

        navigate("/admin/yearbooks");

    } catch (err) {

        console.error(
            "❌ Publish yearbook error:",
            err.response?.data || err
        );

        console.error(
            "Status:",
            err.response?.status
        );

        console.error(
            "Response:",
            err.response?.data
        );

        console.error(
            "Message:",
            err.message
        );

        alert(
            err.response?.data?.message ||
            "Failed to publish yearbook."
        );
    }
};

// CHANGE FONT FAMILY
const changeFontFamily = async (
    fontFamily
) => {
    const canvas =
        canvasRef.current;

    if (!canvas) return;

    let textObject =
        editingStudentTextRef.current;

    const activeObject =
        canvas.getActiveObject() ||
        selectedObjectRef.current;

    /*
    -----------------------------------------------------
    NORMAL TEXTBOX
    -----------------------------------------------------
    */

    if (
        !textObject &&
        activeObject?.type ===
            "textbox"
    ) {
        textObject =
            activeObject;
    }

    if (
        !textObject ||
        textObject.type !==
            "textbox"
    ) {
        return;
    }

    textObject.set({
        fontFamily,
    });

    textObject.initDimensions();
    textObject.setCoords();

    /*
    -----------------------------------------------------
    KEEP STUDENT GROUP SELECTED
    -----------------------------------------------------
    */

    if (
        activeObject?.objectType ===
        "student-group"
    ) {
        activeObject.setCoords();

        selectedObjectRef.current =
            activeObject;

        setSelectedObject(
            activeObject
        );
    } else {
        selectedObjectRef.current =
            textObject;

        setSelectedObject(
            textObject
        );
    }

    canvas.requestRenderAll();

    setToolbarVisible(true);

    setToolbarState({
        fontWeight:
            textObject.fontWeight ||
            "normal",

        fontStyle:
            textObject.fontStyle ||
            "normal",

        textAlign:
            textObject.textAlign ||
            "left",

        underline:
            !!textObject.underline,
    });

    await saveCurrentPage();
};

const increaseFont = async () => {
    const textObject =
        editingStudentTextRef.current ||
        (
            selectedObjectRef.current?.type ===
            "textbox"
                ? selectedObjectRef.current
                : null
        );

    if (!textObject) return;

    await changeFontSize(
        (textObject.fontSize || 20) + 2
    );
};

const decreaseFont = async () => {
    const textObject =
        editingStudentTextRef.current ||
        (
            selectedObjectRef.current?.type ===
            "textbox"
                ? selectedObjectRef.current
                : null
        );

    if (!textObject) return;

    await changeFontSize(
        (textObject.fontSize || 20) - 2
    );
};

const toggleBold = async () => {
    const canvas =
        canvasRef.current;

    if (!canvas) return;

    const activeObject =
        canvas.getActiveObject() ||
        selectedObjectRef.current;

    const textObject =
        editingStudentTextRef.current ||
        (
            activeObject?.type ===
            "textbox"
                ? activeObject
                : null
        );

    if (!textObject) return;

    textObject.set({
        fontWeight:
            textObject.fontWeight ===
            "bold"
                ? "normal"
                : "bold",
    });

    textObject.initDimensions();
    textObject.setCoords();

    if (
        activeObject?.objectType ===
        "student-group"
    ) {
        activeObject.setCoords();

        selectedObjectRef.current =
            activeObject;

        setSelectedObject(
            activeObject
        );
    }

    canvas.requestRenderAll();

    setToolbarState({
        fontWeight:
            textObject.fontWeight ||
            "normal",

        fontStyle:
            textObject.fontStyle ||
            "normal",

        textAlign:
            textObject.textAlign ||
            "left",

        underline:
            !!textObject.underline,
    });

    await saveCurrentPage();
};

const toggleItalic = async () => {
    const canvas =
        canvasRef.current;

    if (!canvas) return;

    const activeObject =
        canvas.getActiveObject() ||
        selectedObjectRef.current;

    const textObject =
        editingStudentTextRef.current ||
        (
            activeObject?.type ===
            "textbox"
                ? activeObject
                : null
        );

    if (!textObject) return;

    textObject.set({
        fontStyle:
            textObject.fontStyle ===
            "italic"
                ? "normal"
                : "italic",
    });

    textObject.initDimensions();
    textObject.setCoords();

    if (
        activeObject?.objectType ===
        "student-group"
    ) {
        activeObject.setCoords();

        selectedObjectRef.current =
            activeObject;

        setSelectedObject(
            activeObject
        );
    }

    canvas.requestRenderAll();

    setToolbarState({
        fontWeight:
            textObject.fontWeight ||
            "normal",

        fontStyle:
            textObject.fontStyle ||
            "normal",

        textAlign:
            textObject.textAlign ||
            "left",

        underline:
            !!textObject.underline,
    });

    await saveCurrentPage();
};

const toggleUnderline = async () => {
    const canvas =
        canvasRef.current;

    if (!canvas) return;

    const activeObject =
        canvas.getActiveObject() ||
        selectedObjectRef.current;

    const textObject =
        editingStudentTextRef.current ||
        (
            activeObject?.type ===
            "textbox"
                ? activeObject
                : null
        );

    if (!textObject) return;

    textObject.set({
        underline:
            !textObject.underline,
    });

    textObject.initDimensions();
    textObject.setCoords();

    if (
        activeObject?.objectType ===
        "student-group"
    ) {
        activeObject.setCoords();

        selectedObjectRef.current =
            activeObject;

        setSelectedObject(
            activeObject
        );
    }

    canvas.requestRenderAll();

    setToolbarState({
        fontWeight:
            textObject.fontWeight ||
            "normal",

        fontStyle:
            textObject.fontStyle ||
            "normal",

        textAlign:
            textObject.textAlign ||
            "left",

        underline:
            !!textObject.underline,
    });

    await saveCurrentPage();
};

const changeAlignment = async (
    align
) => {
    const canvas =
        canvasRef.current;

    if (!canvas) return;

    const activeObject =
        canvas.getActiveObject() ||
        selectedObjectRef.current;

    const textObject =
        editingStudentTextRef.current ||
        (
            activeObject?.type ===
            "textbox"
                ? activeObject
                : null
        );

    if (!textObject) return;

    textObject.set({
        textAlign: align,
    });

    textObject.initDimensions();
    textObject.setCoords();

    if (
        activeObject?.objectType ===
        "student-group"
    ) {
        activeObject.setCoords();

        selectedObjectRef.current =
            activeObject;

        setSelectedObject(
            activeObject
        );
    }

    canvas.requestRenderAll();

    setToolbarState({
        fontWeight:
            textObject.fontWeight ||
            "normal",

        fontStyle:
            textObject.fontStyle ||
            "normal",

        textAlign:
            textObject.textAlign ||
            "left",

        underline:
            !!textObject.underline,
    });

    await saveCurrentPage();
};

  // SAVE DESIGN
  const saveDesign = () => {

    const designData =
      canvasRef.current.toJSON();

    console.log(designData);

    alert("Design Saved");
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

useEffect(() => {
  const canvas = new fabric.Canvas("editor-canvas", {
    width: 794,
    height: 1123,
    backgroundColor: "#fff",
    preserveObjectStacking: true,
  });

  canvasRef.current = canvas;
  canvasReadyRef.current = true;

canvas.on(
    "mouse:dblclick",
    (opt) => {
        const target =
            opt.target;

        if (!target) return;

        /*
        =====================================================
        DIRECT TEXT OBJECT
        =====================================================
        */

        if (
            target.objectType ===
            "student-text"
        ) {
            /*
            -------------------------------------------------
            Store the text being edited.
            -------------------------------------------------
            */

            editingStudentTextRef.current =
                target;

            /*
            -------------------------------------------------
            If it has a parent group, keep GROUP active.
            -------------------------------------------------
            */

            const group =
                canvas
                    .getObjects()
                    .find(
                        (item) =>
                            item.objectType ===
                                "student-group" &&
                            item._objects?.includes(
                                target
                            )
                    );

            if (group) {
                canvas.setActiveObject(
                    group
                );

                selectedObjectRef.current =
                    group;

                setSelectedObject(
                    group
                );

                setToolbarVisible(
                    true
                );

                setToolbarState({
                    fontWeight:
                        target.fontWeight ||
                        "normal",

                    fontStyle:
                        target.fontStyle ||
                        "normal",

                    textAlign:
                        target.textAlign ||
                        "left",

                    underline:
                        !!target.underline,
                });
            }

            /*
            -------------------------------------------------
            Enter text editing.
            -------------------------------------------------
            */

            target.enterEditing();
            target.selectAll();

            canvas.requestRenderAll();

            return;
        }

        /*
        =====================================================
        STUDENT GROUP
        =====================================================
        */

        if (
            target.objectType ===
            "student-group"
        ) {
            /*
            -------------------------------------------------
            Find the nested text that was double-clicked.
            -------------------------------------------------
            */

            const subTarget =
                opt.subTargets?.find(
                    (obj) =>
                        obj.objectType ===
                        "student-text"
                );

            if (!subTarget) {
                return;
            }

            /*
            -------------------------------------------------
            KEEP THE GROUP AS ACTIVE OBJECT
            -------------------------------------------------
            */

            editingStudentTextRef.current =
                subTarget;

            canvas.setActiveObject(
                target
            );

            selectedObjectRef.current =
                target;

            setSelectedObject(
                target
            );

            setToolbarVisible(
                true
            );

            setToolbarState({
                fontWeight:
                    subTarget.fontWeight ||
                    "normal",

                fontStyle:
                    subTarget.fontStyle ||
                    "normal",

                textAlign:
                    subTarget.textAlign ||
                    "left",

                underline:
                    !!subTarget.underline,
            });

            /*
            -------------------------------------------------
            ENTER TEXT EDITING WITHOUT MAKING THE
            TEXTBOX THE ACTIVE CANVAS OBJECT.
            -------------------------------------------------
            */

            subTarget.enterEditing();
            subTarget.selectAll();

            canvas.requestRenderAll();
        }
    }
);

   enableSmartGuides(canvas);

  const updateSelection = () => {
    const obj = canvas.getActiveObject();

    if (obj) {
      selectedObjectRef.current = obj;
      setSelectedObject(obj);
      setToolbarVisible(true);
      setToolbarState({
        fontWeight: obj.fontWeight || "normal",
        fontStyle: obj.fontStyle || "normal",
        textAlign: obj.textAlign || "left",
      });
      return;
    }

    if (selectedObjectRef.current) {
      setSelectedObject(selectedObjectRef.current);
      setToolbarVisible(true);
      setToolbarState({
        fontWeight: selectedObjectRef.current.fontWeight || "normal",
        fontStyle: selectedObjectRef.current.fontStyle || "normal",
        textAlign: selectedObjectRef.current.textAlign || "left",
      });
      return;
    }

    selectedObjectRef.current = null;
    setSelectedObject(null);
    setToolbarVisible(false);
    setToolbarState({
      fontWeight: "normal",
      fontStyle: "normal",
      textAlign: "left",
      underline: false,
    });
  };

const autoSave = async () => {
  if (isLoadingRef.current) return;

  const pageId = activePageRef.current;

  try {
    const json = canvas.toJSON();

    const preview = await createThumbnail(json);

    // IMPORTANT:
    // Ignore this result if the user has already
    // switched to another page while thumbnail was generating.
    if (activePageRef.current !== pageId) {
      return;
    }

    const updated = pagesRef.current.map((page) =>
      page.id === pageId
        ? {
            ...page,
            json,
            preview:
              preview ||
              page.preview ||
              page.thumbnail ||
              "",
          }
        : page
    );

    pagesRef.current = updated;
    setPages([...updated]);

  } catch (error) {
    console.error(
      "❌ Auto-save preview failed:",
      error
    );
  }
};

canvas.on("selection:created", updateSelection);
canvas.on("selection:updated", updateSelection);

canvas.on(
    "selection:cleared",
    () => {
        /*
        -------------------------------------------------
        If a student text is currently being edited,
        don't destroy the group selection state.
        -------------------------------------------------
        */

        if (
            editingStudentTextRef.current
        ) {
            const group =
                canvas
                    .getObjects()
                    .find(
                        (item) =>
                            item.objectType ===
                                "student-group" &&
                            item._objects?.includes(
                                editingStudentTextRef.current
                            )
                    );

            if (group) {
                canvas.setActiveObject(
                    group
                );

                selectedObjectRef.current =
                    group;

                setSelectedObject(
                    group
                );

                setToolbarVisible(
                    true
                );

                return;
            }
        }

        if (
            ignoreSelectionClearRef.current
        ) {
            ignoreSelectionClearRef.current =
                false;

            syncSelectedObject();

            return;
        }

        selectedObjectRef.current =
            null;

        setSelectedObject(
            null
        );

        setToolbarVisible(
            false
        );

        editingStudentTextRef.current =
            null;
    }
);

canvas.on(
    "mouse:down",
    (event) => {
        if (!event.target) {
            editingStudentTextRef.current =
                null;

            selectedObjectRef.current =
                null;

            setSelectedObject(
                null
            );

            setToolbarVisible(
                false
            );
        }
    }
);

  canvas.on("object:added", autoSave);
  canvas.on("object:modified", autoSave);
  canvas.on("object:removed", autoSave);


  return () => {
    canvas.dispose();
  };
}, []);



const createThumbnail = async (pageJson) => {
    return new Promise((resolve) => {
        const element = document.createElement("canvas");

        const THUMB_WIDTH = 1200;
        const THUMB_HEIGHT = 1697;

        element.width = THUMB_WIDTH;
        element.height = THUMB_HEIGHT;

        const tempCanvas = new fabric.StaticCanvas(element, {
            width: THUMB_WIDTH,
            height: THUMB_HEIGHT,
            backgroundColor: "#ffffff",
            enableRetinaScaling: true,
        });

        tempCanvas
            .loadFromJSON(pageJson)
            .then(() => {
                tempCanvas.setZoom(
                    THUMB_WIDTH / 794
                );

                tempCanvas.renderAll();

                const image = tempCanvas.toDataURL({
                    format: "jpeg",
                    quality: 0.92,
                    multiplier: 2,
                });

                tempCanvas.dispose();

                resolve(image);
            })
            .catch((error) => {
                console.error(
                    "Thumbnail generation failed:",
                    error
                );

                tempCanvas.dispose();
                resolve(null);
            });
    });
};

useEffect(() => {
  const updateScale = () => {
    const workspace = document.querySelector(".workspace");
    if (!workspace || !canvasRef.current) return;

    const pageWidth = 794;
    const pageHeight = 1123;

    const availableWidth = workspace.clientWidth - 40;
    const availableHeight = workspace.clientHeight - 40;

    const scale = Math.min(
      availableWidth / pageWidth,
      availableHeight / pageHeight
    );

    setScale(scale);

    // Keep Fabric at real size
    canvasRef.current.setDimensions({
      width: pageWidth,
      height: pageHeight,
    });

    canvasRef.current.setViewportTransform([1, 0, 0, 1, 0, 0]);

    canvasRef.current.requestRenderAll();
  };

  updateScale();

  window.addEventListener("resize", updateScale);

  return () => window.removeEventListener("resize", updateScale);
}, []);

  return (
    <div className="design-studio">

{/* TOP HEADER */}
<div className="design-top">

    <div className="header-left">
        <h3>Yearbook Design Studio</h3>
        <span>{pages.length} Pages</span>
    </div>

    <div className="toolbar-center">

        <div
          className={`header-toolbar ${toolbarVisible ? "visible" : "hidden"}`}
          onMouseDown={handleToolbarPointerDown}
        >

               {toolbarVisible &&
(
    selectedObject?.type === "textbox" ||
    selectedObject?.objectType === "student-group"
) && (
  <>
<select
    value={
        editingStudentTextRef.current
            ?.fontFamily ||
        selectedObject?.fontFamily ||
        fonts[0]
    }
    onMouseDown={(e) => e.stopPropagation()}
    onChange={(e) => changeFontFamily(e.target.value)}
>
        {fonts.map((font) => (
          <option
            key={font}
            value={font}
          >
            {font}
          </option>
        ))}
      </select>

<div className="font-size-box">

<button
    onMouseDown={(e) => e.preventDefault()}
    onClick={decreaseFont}
>
    <FiMinus />
</button>

<input
    type="number"
    min="6"
    onMouseDown={(e) =>
        e.preventDefault()
    }
    value={
        editingStudentTextRef.current?.fontSize ||
        selectedObject?.fontSize ||
        28
    }
    onChange={(e) =>
        changeFontSize(
            Number(e.target.value)
        )
    }
/>

<button
    onMouseDown={(e) => e.preventDefault()}
    onClick={increaseFont}
>
    <FiPlusCircle />
</button>

</div>

<button
    
    onMouseDown={(e) => e.preventDefault()}
    onClick={toggleBold}
    className={
        toolbarState.fontWeight === "bold"
            ? "active-tool"
            : ""
    }
>
    <FiBold/>
</button>

<button
    onMouseDown={(e) => e.preventDefault()}
    
    onClick={toggleItalic}
    className={
        toolbarState.fontStyle === "italic"
            ? "active-tool"
            : ""
    }
>
    <FiItalic/>
</button>

<button
    onMouseDown={(e) => e.preventDefault()}
    onClick={toggleUnderline}
    className={
        toolbarState.underline
            ? "active-tool"
            : ""
    }
>
    <FiUnderline/>
</button>

<button
    
    onMouseDown={(e) => e.preventDefault()}
    onClick={()=>changeAlignment("left")}
>
    <FiAlignLeft />
</button>

<button
    
    onMouseDown={(e) => e.preventDefault()}
    onClick={()=>changeAlignment("center")}
    className={
        toolbarState.textAlign === "center"
        ? "active-tool"
        : ""
    }
>
    <FiAlignCenter/>
</button>

<button
    onMouseDown={(e) => e.preventDefault()}
    onClick={()=>changeAlignment("right")}
    className={
        toolbarState.textAlign === "right"
        ? "active-tool"
        : ""
    }
>
    <FiAlignRight/>
</button>

<input
    type="color"
   
    onMouseDown={(e)=>e.preventDefault()}
    onChange={(e)=>changeColor(e.target.value)}
/>

<button
  onMouseDown={(e) => e.preventDefault()}
  onClick={duplicateObject}
>
  <FiCopy />
</button>

<button
  onMouseDown={(e) => e.preventDefault()}
  onClick={bringForward}
>
  <FiArrowUp />
</button>

<button
  onMouseDown={(e) => e.preventDefault()}
  onClick={sendBackward}
>
  <FiArrowDown />
</button>

<button
  onMouseDown={(e) => e.preventDefault()}
  onClick={bringToFront}
>
  <FiChevronsUp />
</button>

<button
  onMouseDown={(e) => e.preventDefault()}
  onClick={sendToBack}
>
  <FiChevronsDown />
</button>

<button
  
    onMouseDown={(e) => e.preventDefault()}
    onClick={deleteObject}
>
    Delete
</button>

  </>
  )}

  {/* SHAPE TOOLS */}
  {toolbarVisible && selectedObject &&
    selectedObject.type !== "textbox" && (
      <>
        <input
          type="color"
          value={selectedObject.fill || "#6366f1"}
          onChange={(e) =>
            changeColor(e.target.value)
          }
        />

        <button
  onMouseDown={(e) => e.preventDefault()}
  onClick={duplicateObject}
>
  <FiCopy />
</button>

<button
  onMouseDown={(e) => e.preventDefault()}
  onClick={bringForward}
>
  <FiArrowUp />
</button>

<button
  onMouseDown={(e) => e.preventDefault()}
  onClick={sendBackward}
>
  <FiArrowDown />
</button>

<button
  onMouseDown={(e) => e.preventDefault()}
  onClick={bringToFront}
>
  <FiChevronsUp />
</button>

<button
  onMouseDown={(e) => e.preventDefault()}
  onClick={sendToBack}
>
  <FiChevronsDown />
</button>

        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={deleteObject}
        >
          Delete
        </button>
      </>
  )}

</div>

</div>

<div className="save-menu">

  <button
    onClick={() => setShowPublishMenu(!showPublishMenu)}
  >
    Publish
  </button>

  {showPublishMenu && (
    <div className="save-dropdown">

      <button
        onClick={() => {
          setShowPublishModal(!showPublishModal);
        }}
      >
        Publish Yearbook
      </button>

      <button
        onClick={() => {
          handleSaveDraft();
          setShowPublishMenu(false);
        }}
      >
        Save Draft
      </button>

{/* Publish Modal */}
{showPublishModal && (
  <div className="publish-modal-overlay">

    <div className="publish-form">

      <h2>Publish Yearbook</h2>

      <label>Title</label>
      <input
        value={publishData.title}
        onChange={(e) =>
          setPublishData({
            ...publishData,
            title: e.target.value,
          })
        }
      />

      <label>Batch Name</label>
      <input
        value={publishData.batch_name}
        onChange={(e) =>
          setPublishData({
            ...publishData,
            batch_name: e.target.value,
          })
        }
      />

      <label>Academic Year</label>
      <input
        value={publishData.academic_year}
        onChange={(e) =>
          setPublishData({
            ...publishData,
            academic_year: e.target.value,
          })
        }
      />

      <label>Description</label>
      <textarea
        rows={4}
        value={publishData.description}
        onChange={(e) =>
          setPublishData({
            ...publishData,
            description: e.target.value,
          })
        }
      />

      <div className="publish-actions">
        <button onClick={() => setShowPublishModal(false)}>
          Cancel
        </button>

        <button onClick={publishYearbook}>
          Publish
        </button>
      </div>

    </div>

  </div>
)}

    </div>
  )}

</div>

</div>

      {/* BODY */}
      <div className="studio-body">

        {/* LEFT SIDEBAR */}
        <aside className="left-sidebar">

        <div className="left-sidebar-content">

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
  onClick={() =>
    setShowShapesPanel(
      !showShapesPanel
    )
  }
>
  <FiSquare />
  Add Shape
</button>

{showShapesPanel && (
  <div className="shapes-card">

    <h4>Shapes</h4>

    <div className="shapes-grid">

      <div
        className="shape-item"
        onClick={addShape}
      >
        <div className="shape-preview rectangle" />
      </div>

      <div
        className="shape-item"
        onClick={addCircle}
      >
        <div className="shape-preview circle" />
      </div>

      <div
        className="shape-item"
        onClick={addTriangle}
      >
        <div className="shape-preview triangle" />
      </div>

    </div>

  </div>
)}

 <button
    className="tool-btn"
    onClick={() =>
        setShowTemplatePanel(!showTemplatePanel)
    }
>
<FiGrid />
Templates
</button>

{showTemplatePanel && (
  <div className="template-panel">

    <div
      className="template-card"
      onClick={async () => {
        await handleApplyTemplate();
        setShowTemplatePanel(false);
      }}
    >
      <div className="template-preview">
        📘
      </div>

      <div className="template-name">
        Simple Template
      </div>
    </div>

  </div>
)}

<button
  className="tool-btn"
  onClick={() => {
    // Canvas is the source of truth.
    // Deleted students will no longer be included.
    const canvasIds = getInsertedStudentIds();
    setInsertedStudentIds(canvasIds);
    setShowStudentsPanel(true);
  }}
>
  <FiUsers size={18} />
  <span>Students</span>
</button>

<button
  className="tool-btn"
  onClick={() => setShowFacultyPanel(true)}
>
  <FiBookOpen size={18} />
  <span>Faculty</span>
</button>

<button
  className="tool-btn"
  onClick={() => setShowMemoriesPanel(true)}
>
  <FiMessageCircle size={18} />
  <span>Memories/Message</span>
</button>


          <label className="tool-btn">
    <FiImage />
    Upload Images

    <input
        hidden
        type="file"
        multiple
        accept="image/*"
        onChange={handleUploadImages}
    />
</label>
</div>

</aside>

        {/* CENTER WORKSPACE */}
        <main className="workspace">

          
          <div className="canvas-container">

<div
    className="canvas-wrapper"
    style={{
        transform: `scale(${scale})`
    }}
>
    <div className="yearbook-page">
        <canvas id="editor-canvas"></canvas>
    </div>
</div>

              <span className="page-size">
                A4 · 794 × 1123
              </span>

            

          </div>

        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="right-sidebar">


          <div className="pages-scroll">

{pages.map((page) => (
  <div
    key={page.id}
    draggable
    className={`page-drag-wrapper ${
      dragOverPageId === page.id ? "page-drag-over" : ""
    }`}
    
    onDragStart={(e) => {
      setDraggedPageId(page.id);

      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData(
        "text/plain",
        String(page.id)
      );
    }}

    onDragOver={(e) => {
      e.preventDefault();

      e.dataTransfer.dropEffect = "move";

      if (dragOverPageId !== page.id) {
        setDragOverPageId(page.id);
      }
    }}

    onDragLeave={() => {
      setDragOverPageId(null);
    }}

    onDrop={(e) => {
      e.preventDefault();

      const draggedId = Number(
        e.dataTransfer.getData("text/plain")
      );

      const targetId = page.id;

      if (!draggedId || draggedId === targetId) {
        setDraggedPageId(null);
        setDragOverPageId(null);
        return;
      }

      const currentPages = [...pagesRef.current];

      const draggedIndex = currentPages.findIndex(
        (p) => p.id === draggedId
      );

      const targetIndex = currentPages.findIndex(
        (p) => p.id === targetId
      );

      if (
        draggedIndex === -1 ||
        targetIndex === -1
      ) {
        return;
      }

      // Remove dragged page
      const [draggedPage] =
        currentPages.splice(draggedIndex, 1);

      // Find target again after removal
      const newTargetIndex =
        currentPages.findIndex(
          (p) => p.id === targetId
        );

      // Insert before target
      currentPages.splice(
        newTargetIndex,
        0,
        draggedPage
      );

      // Update page titles
      const reorderedPages =
        currentPages.map((p, index) => ({
          ...p,
          title:
            p.type === "faculty"
              ? p.title
              : index === 0
              ? "Cover"
              : `Page ${index + 1}`,
        }));

      pagesRef.current = reorderedPages;
      setPages(reorderedPages);

      setDraggedPageId(null);
      setDragOverPageId(null);
    }}

    onDragEnd={() => {
      setDraggedPageId(null);
      setDragOverPageId(null);
    }}
  >
<PagePreview
  page={page}
  active={activePage === page.id}
  onClick={() => switchPage(page.id)}
  onDelete={deletePage}
/>
  </div>
))}
          </div>

          {
pages.find(
 p => p.id === activePage
)?.type === "faculty"
?
<button
 className="add-page-button"
 onClick={addFacultyPage}
>
 <FiPlus />
 Add Faculty Page
</button>

:

<button
 className="add-page-button"
 onClick={addPage}
>
 <FiPlus />
 Add Page
</button>

}

        </aside>

      </div>


{/* ==========================================
    FACULTY MODAL
========================================== */}

{showFacultyPanel && (
  <FacultyList
    faculty={faculty}
    onInsert={insertSelectedFaculty}
    onClose={() => setShowFacultyPanel(false)}
    insertedFacultyIds={
      [
        ...new Set(
          (canvasRef.current?.getObjects() || [])
            .map((obj) => obj.facultyId)
            .filter(Boolean)
        )
      ]
    }
  />
)}


{showMemoriesPanel && (
  <MemoryList
    memories={memories}
    onInsert={insertSelectedMemories}
    onClose={() =>
      setShowMemoriesPanel(false)
    }
    insertedMemoryIds={
      getInsertedMemoryIds()
    }
  />
)}


  
{showStudentsPanel && (
  <StudentList
    students={students}
    onInsert={insertStudents}
    onClose={() => setShowStudentsPanel(false)}
    insertedStudentIds={insertedStudentIds}
  />
)}


    </div>
  );
}

export default DesignStudio;