export function MemoriesLayout() {

    const PAGE_WIDTH = 794;
    const PAGE_HEIGHT = 1123;

    const objects = [];


    // ==========================================
    // TITLE
    // ==========================================

    objects.push({
        type: "textbox",
        text: "MEMORIES",
        left: 400,
        top: 90,
        width: PAGE_WIDTH,
        textAlign: "center",
        fontSize: 36,
        fontWeight: "bold",
        fontFamily: "Georgia",
        fill: "#333",
        selectable: true,
        evented: true
    });

    objects.push({
        type: "textbox",
        text: "Moments Worth Remembering",
        left: 400,
        top: 120,
        width: PAGE_WIDTH,
        textAlign: "center",
        fontSize: 16,
        fontStyle: "italic",
        fill: "#666",
        selectable: true,
        evented: true
    });

    // ==========================================
    // POLAROID PHOTO PLACEHOLDER
    // ==========================================

function addPhotoFrame(id, left, top, width, height, angle = 0) {

    objects.push({

        id,
        name: id,

        type: "rect",

        left: 400,
        top,

        width,
        height,

        rx: 10,
        ry: 10,

        fill: "#ECECEC",

        stroke: "#D5D5D5",
        strokeWidth: 1,

        strokeDashArray: [8, 4],

        angle,

        photoFrame: true,
        memorySlot: true,

        selectable: true,
        evented: true,

        hasControls: true,
        hasBorders: true,

        lockMovementX: false,
        lockMovementY: false,
        lockScalingX: false,
        lockScalingY: false,
        lockRotation: false,

        shadow: {
            color: "rgba(0,0,0,0.15)",
            blur: 12,
            offsetX: 2,
            offsetY: 4
        }

    });

}

    // ==========================================
    // COLLAGE
    // ==========================================

// Large top image
addPhotoFrame("memory1", 40, 140, 330, 220, -2);

// Top right
addPhotoFrame("memory2", 390, 140, 170, 170, 4);
addPhotoFrame("memory3", 580, 140, 170, 220, -3);

// Middle
addPhotoFrame("memory4", 40, 390, 200, 170, 5);
addPhotoFrame("memory5", 260, 340, 260, 280, -2);
addPhotoFrame("memory6", 540, 390, 210, 170, 3);

// Bottom
addPhotoFrame("memory7", 40, 650, 240, 250, -4);
addPhotoFrame("memory8", 300, 670, 180, 180, 2);
addPhotoFrame("memory9", 500, 630, 250, 280, -3);

  


    return {

        version: "7.4.0",

        objects

    };

}