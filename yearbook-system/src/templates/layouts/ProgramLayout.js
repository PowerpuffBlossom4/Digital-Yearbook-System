export function ProgramLayout() {

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
            // PROGRAM NAME
            // ==========================================

            {
                type: "textbox",
                text: "PROGRAM NAME",

                left: 70,
                top: 120,
                width: 654,

                fontSize: 38,
                fontWeight: "bold",
                textAlign: "center",

                fill: "#222",

                programName: true
            },

            // ==========================================
            // DIVIDER
            // ==========================================

            {
                type: "line",
                x1: 180,
                y1: 190,
                x2: 614,
                y2: 190,

                stroke: "#999",
                strokeWidth: 1.5
            },

            // ==========================================
            // CONGRATULATORY MESSAGE
            // ==========================================

            {
                type: "textbox",

                text:
`Congratulations, Class of 2026!

Your dedication, perseverance, and commitment have brought you to this important milestone. May you continue to pursue your dreams with confidence, integrity, and excellence.

Wishing you success in every journey ahead.

— Program Chairperson`,

                left: 110,
                top: 280,
                width: 574,

                fontSize: 24,
                lineHeight: 1.8,

                textAlign: "center",

                fill: "#444",

                congratulatoryMessage: true
            }

        ]

    };

}