export function DeanLayout() {

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
            // PAGE TITLE
            // ==========================================

            {
                type: "textbox",
                text: "MESSAGE FROM THE DEAN",
                left: 0,
                top: 45,
                width: PAGE_WIDTH,
                fontSize: 40,
                fontWeight: "bold",
                fontFamily: "Times New Roman",
                textAlign: "center",
                fill: "#1f2937"
            },

            // ==========================================
            // COLLEGE NAME
            // ==========================================

            {
                type: "textbox",
                text: "COLLEGE OF COMPUTING AND INFORMATION SCIENCES",
                left: 70,
                top: 105,
                width: 654,
                fontSize: 22,
                fontWeight: "bold",
                textAlign: "center",
                fill: "#555",

                collegeName: true
            },

            // ==========================================
            // PHOTO FRAME
            // ==========================================

            {
                type: "rect",
                left: 297,
                top: 170,
                width: 200,
                height: 230,
                rx: 10,
                ry: 10,

                fill: "#ececec",
                stroke: "#444",
                strokeWidth: 2,

                deanPhoto: true
            },

            // ==========================================
            // DEAN NAME
            // ==========================================

            {
                type: "textbox",
                text: "DEAN NAME",
                left: 100,
                top: 425,
                width: 594,
                fontSize: 30,
                fontWeight: "bold",
                fontFamily: "Times New Roman",
                textAlign: "center",
                fill: "#111",

                deanName: true
            },

            // ==========================================
            // POSITION
            // ==========================================

            {
                type: "textbox",
                text: "College Dean",
                left: 100,
                top: 465,
                width: 594,
                fontSize: 20,
                fontStyle: "italic",
                textAlign: "center",
                fill: "#666",

                deanPosition: true
            },

            // ==========================================
            // DIVIDER
            // ==========================================

            {
                type: "line",
                x1: 120,
                y1: 520,
                x2: 674,
                y2: 520,
                stroke: "#999",
                strokeWidth: 2
            },

            // ==========================================
            // MESSAGE TITLE
            // ==========================================

            {
                type: "textbox",
                text: "MESSAGE",
                left: 0,
                top: 545,
                width: PAGE_WIDTH,
                fontSize: 24,
                fontWeight: "bold",
                textAlign: "center",
                fill: "#333"
            },

            // ==========================================
            // MESSAGE
            // ==========================================

            {
                type: "textbox",
                text:
`Congratulations to the graduating class.

May your knowledge, determination, and integrity guide you toward a future filled with success and meaningful service to society.

Always carry the values of Agusan del Sur State University wherever life leads you.

Best wishes to each one of you.`,

                left: 90,
                top: 600,
                width: 614,
                fontSize: 20,
                lineHeight: 1.6,
                fontFamily: "Georgia",
                textAlign: "justify",
                fill: "#333",

                deanMessage: true
            },

            // ==========================================
            // FOOTER
            // ==========================================

            {
                type: "textbox",
                text: "Agusan del Sur State University • Class of 2026",
                left: 0,
                top: 1060,
                width: PAGE_WIDTH,
                fontSize: 16,
                textAlign: "center",
                fill: "#777"
            }

        ]

    };

}