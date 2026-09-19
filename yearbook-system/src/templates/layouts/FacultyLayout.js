export function FacultyLayout() {

    const PAGE_WIDTH = 794;
    const PAGE_HEIGHT = 1123;

    const objects = [

        // ==========================================
        // BACKGROUND
        // ==========================================

        {
            type: "rect",
            left: 0,
            top: 0,
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
            fill: "#ffffff",
            selectable: false,
            evented: false
        },

        // ==========================================
        // PROGRAM CHAIRPERSON
        // ==========================================

        {
            type: "textbox",
            text: "PROGRAM CHAIRPERSON AND FACULTY MEMBERS",
            left: 105,
            top: 105,
            width: PAGE_WIDTH,
            fontSize: 22,
            fontWeight: "bold",
            textAlign: "center",
            fill: "#444"
        },

        // Chairperson Photo

        {
            type: "rect",
            left: 397,
            top: 200,
            width: 200,
            height: 220,
            rx: 8,
            ry: 8,
            fill: "#ececec",
            strokeWidth: 2,

            facultyPhoto: true,
            facultyRole: "chairperson"
        },

        // Chairperson Name

        {
            type: "textbox",
            text: "CHAIRPERSON NAME",
            left: 397,
            top: 380,
            width: 550,
            fontSize: 28,
            fontWeight: "bold",
            textAlign: "center",
            fill: "#111",

            facultyName: true,
            facultyRole: "chairperson"
        },

        // Position

        {
            type: "textbox",
            text: "Program Chairperson",
            left: 397,
            top: 420,
            width: 550,
            fontSize: 20,
            fontStyle: "italic",
            textAlign: "center",
            fill: "#666",

            facultyPosition: true,
            facultyRole: "chairperson"
        },

        // Divider

        {
            type: "line",
            x1: 80,
            y1: 475,
            x2: 714,
            y2: 475,
            stroke: "#999",
            strokeWidth: 1.5
        },

        // ==========================================
        // INSTRUCTORS TITLE
        // ==========================================

        {
            type: "textbox",
            text: "FACULTY MEMBERS",
            left: 397,
            top: 495,
            width: PAGE_WIDTH,
            fontSize: 28,
            fontWeight: "bold",
            textAlign: "center",
            fill: "#333"
        }

    ];

    // ==========================================
    // 8 INSTRUCTORS (4 x 2 GRID)
    // ==========================================

    const startX = 120;
    const startY = 650;

    const photoWidth = 120;
    const photoHeight = 140;

    const columnGap = 65;
    const rowGap = 95;

    for (let i = 0; i < 8; i++) {

        const row = Math.floor(i / 4);
        const col = i % 4;

        const x = startX + col * (photoWidth + columnGap);
        const y = startY + row * (photoHeight + rowGap);

        objects.push(

            // Photo Frame

            {
                type: "rect",
                left: x,
                top: y,
                width: photoWidth,
                height: photoHeight,

                rx: 6,
                ry: 6,

                fill: "#ececec",

                stroke: "#555",
                strokeWidth: 1.5,

                instructorPhoto: true,
                instructorIndex: i + 1
            },

            // Name

            {
                type: "textbox",
                text: "INSTRUCTOR NAME",

                left: x - 2,
                top: y + 100,

                width: 160,

                fontSize: 15,
                fontWeight: "bold",

                textAlign: "center",

                fill: "#222",

                instructorName: true,
                instructorIndex: i + 1
            },

            // Position

            {
                type: "textbox",
                text: "Instructor",

                left: x - 20,
                top: y + 120,

                width: 160,

                fontSize: 13,
                fontStyle: "italic",

                textAlign: "center",

                fill: "#666",

                instructorPosition: true,
                instructorIndex: i + 1
            }

        );

    }

    return {

        version: "7.4.0",

        objects

    };

}