const PAGE_WIDTH = 894;
const PAGE_HEIGHT = 1123;

export function PrincipalLayout() {
    return {
        version:"7.4.0",

        objects:[

            // =========================
            // BACKGROUND (LOCKED)
            // =========================

            {
                type:"rect",
                left:0,
                top:0,
                width:PAGE_WIDTH,
                height:PAGE_HEIGHT,
                fill:"#ffffff",

                selectable:false,
                evented:false,
            },


            // =========================
            // TITLE (EDITABLE)
            // =========================

            {
                type:"textbox",
                text:"MESSAGE FROM THE PRINCIPAL",

                left:100,
                top:80,
                width:PAGE_WIDTH-200,

                fontSize:34,
                fontWeight:"bold",
                fontFamily:"Playfair Display",

                fill:"#222222",
                textAlign:"center",

                selectable:true,
                evented:true,
                hasControls:true,
                hasBorders:true,
            },


            {
                type:"textbox",
                text:"School Year 2025 - 2026",

                left:200,
                top:130,
                width:500,

                fontSize:16,
                fill:"#777777",
                textAlign:"center",

                selectable:true,
                evented:true,
                hasControls:true,
                hasBorders:true,
            },


            // =========================
            // PHOTO FRAME
            // =========================

            {
                type:"rect",

                left:120,
                top:230,

                width:220,
                height:270,

                fill:"#f5f5f5",
                stroke:"#dddddd",
                strokeWidth:1,


                selectable:true,
                evented:true,
                hasControls:true,
                hasBorders:true,
            },


            {
                type:"textbox",

                text:"Principal\nPhoto",

                left:140,
                top:325,

                width:180,

                fontSize:22,

                fill:"#999999",

                textAlign:"center",

                selectable:true,
                evented:true,
                hasControls:true,
                hasBorders:true,
            },


            // =========================
            // NAME
            // =========================


            {
                type:"textbox",

                text:"Dr. Principal Name",

                left:90,
                top:530,

                width:280,

                fontSize:24,
                fontWeight:"bold",

                fill:"#222222",

                textAlign:"center",

                selectable:true,
                evented:true,
                hasControls:true,
                hasBorders:true,
            },


            {
                type:"textbox",

                text:"School Principal",

                left:90,
                top:570,

                width:280,

                fontSize:16,

                fill:"#666666",

                textAlign:"center",

                selectable:true,
                evented:true,
                hasControls:true,
                hasBorders:true,
            },


            // =========================
            // MESSAGE
            // =========================

            {
                type:"textbox",

                text:
                "Insert the principal's inspirational message here.\n\n"+
                "Welcome to our school community. This yearbook represents "+
                "the memories, achievements, and experiences of our students.\n\n"+
                "May this collection remind everyone of the dedication, "+
                "friendships, and milestones we have shared together.",


                left:430,
                top:260,

                width:340,

                fontSize:18,

                lineHeight:1.8,

                fill:"#444444",

                textAlign:"left",


                selectable:true,
                evented:true,
                hasControls:true,
                hasBorders:true,
            },


           

        ]
    };
}