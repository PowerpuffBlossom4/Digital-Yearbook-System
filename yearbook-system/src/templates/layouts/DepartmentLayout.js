export function DepartmentLayout() {

    const PAGE_WIDTH = 794;
    const PAGE_HEIGHT = 1123;

    return {

        version: "7.4.0",

        objects: [

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
            // TITLE
            // ==========================================

            {
                type: "textbox",
                text: "CONGRATULATIONS",

                left: 105,
                top: 60,

                width: PAGE_WIDTH,

                fontSize: 36,
                fontWeight: "bold",

                textAlign: "center",

                fill: "#222"
            },

            // ==========================================
            // BATCH
            // ==========================================

            {
                type: "textbox",
                text: "THEME BATCH YEAR",

                left: 105,
                top: 105,

                width: PAGE_WIDTH,

                fontSize: 26,
                fontWeight: "bold",

                textAlign: "center",

                fill: "#666",

                batchName: true
            },

            // ==========================================
            // PROGRAM NAME
            // ==========================================

            {
                type: "textbox",
                text: "DEPARTMENT",

                left: 105,
                top: 145,

                width: PAGE_WIDTH,

                fontSize: 20,

                textAlign: "center",

                fill: "#555",

                programName: true
            },

            // ==========================================
            // PHOTO FRAME
            // ==========================================

            {
                type: "rect",

                left: 297,
                top: 220,

                width: 200,
                height: 230,

                rx: 8,
                ry: 8,

                fill: "#ececec",

                stroke: "#444",
                strokeWidth: 2,

                chairpersonPhoto: true
            },

            // ==========================================
            // DIVIDER
            // ==========================================

            {
                type: "line",

                x1: 90,
                y1: 570,

                x2: 704,
                y2: 570,

                stroke: "#999",
                strokeWidth: 1.5
            },

            // ==========================================
            // SHORT MESSAGE
            // ==========================================

            {
                type: "textbox",

                text:
"Congratulations, Theme Batch Year!\n\nMay your hard work, determination, and perseverance continue to guide you toward a future filled with success, purpose, and endless opportunities. Wishing you all the best as you begin the next chapter of your journey.",

                left: 90,
                top: 610,

                width: 614,

                fontSize: 21,

                lineHeight: 1.7,

                textAlign: "center",

                fill: "#333",

                chairpersonMessage: true
            },

            // ==========================================
            // FOOTER
            // ==========================================

            {
                type: "line",

                x1: 90,
                y1: 1035,

                x2: 704,
                y2: 1035,

                stroke: "#999",
                strokeWidth: 1
            },

            {
                type: "textbox",

                text: "Agusan del Sur State University",

                left: 105,
                top: 1048,

                width: PAGE_WIDTH,

                fontSize: 15,

                textAlign: "center",

                fill: "#666"
            }

        ]

    };

}