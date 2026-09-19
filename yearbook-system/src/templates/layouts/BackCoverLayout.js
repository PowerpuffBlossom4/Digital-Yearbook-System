export function BackCoverLayout() {

    const PAGE_WIDTH = 794;
    const PAGE_HEIGHT = 1123;

    const objects = [];

    // ==========================================
    // BACKGROUND (LOCKED)
    // ==========================================

    objects.push({
        id: "background",
        type: "rect",
        left: 400,
        top: 100,
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
        fill: "#123C6B",
        selectable: true,
        evented: true,
        excludeFromExport: false
    });

    // ==========================================
    // SCHOOL LOGO
    // ==========================================

    objects.push({
        id: "school-logo",
        type: "circle",
        left: 400,
        top: 90,
        radius: 100,
        fill: "#F2F2F2",
        stroke: "#FFFFFF",
        strokeWidth: 3,

        photoFrame: true,
        logoFrame: true,

        selectable: true,
        evented: true,
        hasControls: true,
        hasBorders: true
    });

    // ==========================================
    // SCHOOL NAME
    // ==========================================

    objects.push({
        id: "school-name",
        type: "textbox",
        text: "AGUSAN DEL SUR STATE UNIVERSITY",

        left: 400,
        top: 240,

        width: 634,

        textAlign: "center",

        fontSize: 28,
        fontWeight: "bold",
        fontFamily: "Georgia",

        fill: "#FFFFFF",

        editable: true,
        selectable: true,
        evented: true,

        hasControls: true,
        hasBorders: true
    });

    // ==========================================
    // YEARBOOK TITLE
    // ==========================================

    objects.push({
        id: "yearbook-title",
        type: "textbox",
        text: "YEARBOOK 2026",

        left: 400,
        top: 295,

        width: 474,

        textAlign: "center",

        fontSize: 22,
        fontWeight: "bold",

        fill: "#F4D03F",

        editable: true,
        selectable: true,
        evented: true
    });

    // ==========================================
    // MESSAGE
    // ==========================================

    objects.push({
        id: "back-message",

        type: "textbox",

        text:
`Thank you for being part of our story.

May this yearbook serve as a lasting reminder
of friendships, achievements,
and unforgettable memories.

Once a part of ASSCAT,
Always part of the family.`,

        left: 400,
        top: 410,

        width: 594,

        textAlign: "center",

        fontSize: 18,

        lineHeight: 1.5,

        fill: "#FFFFFF",

        editable: true,
        selectable: true,
        evented: true,

        hasControls: true,
        hasBorders: true
    });


    // ==========================================
    // FOOTER
    // ==========================================

    objects.push({
        id: "copyright",

        type: "textbox",

        text: "© 2026 Agusan del Sur State University",

        left: 400,
        top: 1070,

        width: 554,

        textAlign: "center",

        fontSize: 14,

        fill: "#D8D8D8",

        editable: true,
        selectable: true,
        evented: true
    });

    return {
        version: "7.4.0",
        objects
    };

}