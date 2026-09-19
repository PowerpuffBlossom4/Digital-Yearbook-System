export function ClosingLayout() {

    const PAGE_WIDTH = 794;
    const PAGE_HEIGHT = 1123;

    const objects = [];


    // ==========================================
    // TITLE (MOVABLE)
    // ==========================================

    objects.push({
        id: "closing-title",
        type: "textbox",
        text: "THANK YOU",
        left: 400,
        top: 70,
        width: 450,
        textAlign: "center",
        fontSize: 42,
        fontWeight: "bold",
        fontFamily: "Georgia",
        fill: "#1E3A5F",

        selectable: true,
        evented: true,
        editable: true,

        hasControls: true,
        hasBorders: true
    });

    // ==========================================
    // QUOTE (MOVABLE)
    // ==========================================

    objects.push({
        id: "closing-quote",
        type: "textbox",
        text: "\"Every ending marks the beginning of a new journey.\"",

        left: 400,
        top: 145,

        width: 580,

        textAlign: "center",

        fontSize: 20,
        fontStyle: "italic",
        fill: "#666",

        selectable: true,
        evented: true,
        editable: true,

        hasControls: true,
        hasBorders: true
    });

    // ==========================================
    // IMAGE PLACEHOLDER (MOVABLE)
    // ==========================================

    objects.push({

        id: "closing-photo",

        type: "rect",

        left: 400,
        top: 250,

        width: 430,
        height: 310,

        rx: 12,
        ry: 12,

        fill: "#ECECEC",

        stroke: "#CFCFCF",
        strokeWidth: 1,

        strokeDashArray: [8,4],

        photoFrame: true,
        closingPhoto: true,

        selectable: true,
        evented: true,

        hasControls: true,
        hasBorders: true,

        lockScalingFlip: true,

        shadow: {
            color: "rgba(0,0,0,.18)",
            blur: 12,
            offsetX: 2,
            offsetY: 5
        }

    });

    // ==========================================
    // MESSAGE (MOVABLE)
    // ==========================================

    objects.push({

        id: "closing-message",

        type: "textbox",

        text:
`To the Class of 2026,

Thank you for every memory,
every friendship,
every challenge,
and every success we shared.

May this yearbook always remind us
where our dreams began
and inspire us to keep
reaching for new heights.

Congratulations and best wishes!`,

        left: 400,
        top: 600,

        width: 590,

        textAlign: "center",

        fontSize: 18,

        lineHeight: 1.4,

        fill: "#444",

        editable: true,
        selectable: true,
        evented: true,

        hasControls: true,
        hasBorders: true

    });

    // ==========================================
    // FOOTER (MOVABLE)
    // ==========================================

    objects.push({

        id: "closing-footer",

        type: "textbox",

        text: "ADSSU • CLASS OF 2026",

        left: 400,
        top: 1030,

        width: 450,

        textAlign: "center",

        fontSize: 18,
        fontWeight: "bold",

        fill: "#1E3A5F",

        selectable: true,
        evented: true,
        editable: true,

        hasControls: true,
        hasBorders: true

    });

    return {

        version: "7.4.0",

        objects

    };

}