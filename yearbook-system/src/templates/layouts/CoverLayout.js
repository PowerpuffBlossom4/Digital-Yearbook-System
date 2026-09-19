export function CoverLayout(){

    const PAGE_WIDTH = 794;
    const PAGE_HEIGHT = 1123;


    return {

        version:"7.4.0",

        objects:[


            // Background Photo Placeholder

            {
                type:"rect",
                left:0,
                top:0,
                width:PAGE_WIDTH,
                height:PAGE_HEIGHT,
                fill:"#222222",
            },


            // School Logo

            {
                type:"textbox",
                left:150,
                top:350,
                width:500,
                text:"ADSSU",
                fontSize:80,
                fontWeight:"bold",
                fill:"#ffffff",
                textAlign:"center",
            },


            // Year

            {
                type:"textbox",
                left:200,
                top:500,
                width:400,
                text:"CLASS OF 2026",
                fontSize:40,
                fill:"#ffffff",
                textAlign:"center",
            },


            // Footer

            {
                type:"textbox",
                left:100,
                top:950,
                width:600,
                text:
                "Agusan del Sur State University",
                fontSize:25,
                fill:"#ffffff",
                textAlign:"center",
            }

        ]

    }

}