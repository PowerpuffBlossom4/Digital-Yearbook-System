import * as fabric from "fabric";

/*
=========================================================
STUDENT CARD CONFIGURATION
=========================================================

BASE SIZE OF ONE STUDENT CARD.

The card is intentionally shorter than the previous
720 × 1300 version so that 9 students can fit on
an A4 portrait page while remaining readable.

Actual display size is automatically calculated by
buildStudentGroups().
=========================================================
*/

export const STUDENT_CARD = {
    width: 520,
    height: 720,

    /*
    -----------------------------------------------------
    PHOTO
    -----------------------------------------------------
    */

    photo: {
        width: 520,
        height: 430,
    },

    // PHOTO → NAME
    photoSpacing: 18,

    /*
    -----------------------------------------------------
    NAME
    -----------------------------------------------------
    */

    name: {
        fontSize: 32,
        fontWeight: "bold",

        // NAME → NICKNAME
        spacing: 10,
    },

    /*
    -----------------------------------------------------
    NICKNAME
    -----------------------------------------------------
    */

    nickname: {
        fontSize: 22,
        fontWeight: "normal",

        // NICKNAME → QUOTE
        spacing: 10,
    },

    /*
    -----------------------------------------------------
    QUOTE
    -----------------------------------------------------
    */

    quote: {
        fontSize: 18,
        fontWeight: "normal",
    },
};


/*
=========================================================
HELPER: LOAD STUDENT IMAGE
=========================================================
*/

async function loadStudentImage(src) {

    if (!src) {
        return null;
    }

    try {

        return await fabric.FabricImage.fromURL(
            src,
            {
                crossOrigin: "anonymous",
            }
        );

    } catch (error) {

        console.error(
            "❌ Failed to load student image:",
            error
        );

        return null;
    }
}


/*
=========================================================
HELPER: CREATE STUDENT PHOTO
=========================================================

The image is cover-cropped into the fixed
STUDENT_CARD.photo frame.
=========================================================
*/

async function createStudentPhoto(src) {

    const {
        width: frameWidth,
        height: frameHeight,
    } = STUDENT_CARD.photo;


    /*
    -----------------------------------------------------
    LOAD IMAGE
    -----------------------------------------------------
    */

    const img =
        await loadStudentImage(src);


    /*
    -----------------------------------------------------
    NO IMAGE
    -----------------------------------------------------
    */

    if (!img) {

        return new fabric.Rect({

            originX: "center",
            originY: "center",

            left: 0,
            top: 0,

            width:
                frameWidth,

            height:
                frameHeight,

            fill:
                "#eeeeee",

            stroke:
                "#dddddd",

            strokeWidth:
                1,

            selectable:
                false,

            evented:
                false,

            objectType:
                "student-photo-placeholder",
        });
    }


    /*
    -----------------------------------------------------
    ORIGINAL IMAGE SIZE
    -----------------------------------------------------
    */

    const originalSize =
        img.getOriginalSize
            ? img.getOriginalSize()
            : {
                width: img.width,
                height: img.height,
            };


    const sourceWidth =
        originalSize.width ||
        img.width ||
        frameWidth;


    const sourceHeight =
        originalSize.height ||
        img.height ||
        frameHeight;


    /*
    -----------------------------------------------------
    COVER SCALE
    -----------------------------------------------------
    */

    const scaleX =
        frameWidth /
        sourceWidth;


    const scaleY =
        frameHeight /
        sourceHeight;


    const scale =
        Math.max(
            scaleX,
            scaleY
        );


    /*
    -----------------------------------------------------
    IMAGE
    -----------------------------------------------------
    */

    img.set({

        originX:
            "center",

        originY:
            "center",

        left:
            0,

        top:
            0,

        scaleX:
            scale,

        scaleY:
            scale,

        selectable:
            false,

        evented:
            false,

        objectType:
            "student-photo",

        dirty:
            true,
    });


    /*
    -----------------------------------------------------
    CLIP PHOTO
    -----------------------------------------------------
    */

    const clip =
        new fabric.Rect({

            originX:
                "center",

            originY:
                "center",

            left:
                0,

            top:
                0,

            width:
                frameWidth,

            height:
                frameHeight,

            rx:
                2,

            ry:
                2,
        });


    img.clipPath =
        clip;


    return img;
}


/*
=========================================================
HELPER: CREATE STUDENT TEXT
=========================================================
*/

function createStudentText(
    text,
    {
        fontSize,
        fontWeight = "normal",
        fontStyle = "normal",
    }
) {

    return new fabric.Textbox(

        text || "",

        {

            originX:
                "center",

            originY:
                "top",

            left:
                0,

            top:
                0,

            width:
                STUDENT_CARD.width - 20,

            fontSize,

            fontFamily:
                "Arial",

            fontWeight,

            fontStyle,

            fill:
                "#222222",

            textAlign:
                "center",

            lineHeight:
                1.15,

            editable:
                true,

            selectable:
                false,

            evented:
                false,

            objectType:
                "student-text",
        }
    );
}


/*
=========================================================
CREATE ONE STUDENT GROUP
=========================================================

Everything belonging to one student becomes ONE
Fabric Group:

    PHOTO
    NAME
    NICKNAME
    QUOTE

Therefore the whole student card can be:

    • selected
    • moved
    • resized
    • rotated

as one object.
=========================================================
*/

export async function createStudentGroup(
    student
) {

    if (!student) {
        return null;
    }


    /*
    -----------------------------------------------------
    CARD CONFIGURATION
    -----------------------------------------------------
    */

    const {
        width,
        height,

        photo:
            photoConfig,

        photoSpacing,

        name:
            nameConfig,

        nickname:
            nicknameConfig,

        quote:
            quoteConfig,

    } = STUDENT_CARD;


    /*
    -----------------------------------------------------
    STUDENT ID
    -----------------------------------------------------
    */

    const studentId =

        student.id ??
        student.student_id ??
        student.studentId ??
        null;


    /*
    -----------------------------------------------------
    PHOTO SOURCE
    -----------------------------------------------------
    */

    const photoSrc =

        student.photo_url ||
        student.photo ||
        student.image_url ||
        student.image ||
        student.profile_image ||
        student.profile_picture ||
        student.avatar ||
        null;


    /*
    -----------------------------------------------------
    STUDENT NAME
    -----------------------------------------------------
    */

    const name =

        student.name ||
        student.full_name ||
        student.fullName ||

        [
            student.first_name,
            student.middle_name,
            student.last_name,
        ]
            .filter(Boolean)
            .join(" ") ||

        "Student Name";


    /*
    -----------------------------------------------------
    NICKNAME
    -----------------------------------------------------
    */

    const nickname =

        student.nickname ||
        student.nick_name ||
        "";


    /*
    -----------------------------------------------------
    QUOTE
    -----------------------------------------------------
    */

    const quote =

        student.quote ||
        student.student_quote ||
        student.message ||
        "";


    /*
    =====================================================
    PHOTO
    =====================================================
    */

    const photo =
        await createStudentPhoto(
            photoSrc
        );


    photo.set({

        left:
            0,

        top:
            -height / 2 +
            photoConfig.height / 2,
    });


    photo.selectable =
        false;

    photo.evented =
        false;


    /*
    =====================================================
    NAME
    =====================================================
    */

    const nameText =
        createStudentText(
            name,
            nameConfig
        );


    const textStart =

        -height / 2 +
        photoConfig.height +
        photoSpacing;


    nameText.set({

        top:
            textStart,
    });


    /*
    =====================================================
    NICKNAME
    =====================================================
    */

    const nicknameText =

        createStudentText(

            nickname
                ? `"${nickname}"`
                : "",

            nicknameConfig
        );


    nicknameText.set({

        top:

            textStart +

            nameConfig.fontSize +

            nameConfig.spacing,
    });


    /*
    =====================================================
    QUOTE
    =====================================================
    */

    const quoteText =

        createStudentText(

            quote
                ? `"${quote}"`
                : "",

            quoteConfig
        );


    quoteText.set({

        top:

            textStart +

            nameConfig.fontSize +

            nameConfig.spacing +

            nicknameConfig.fontSize +

            nicknameConfig.spacing,
    });


    /*
    =====================================================
    PHOTO BORDER
    =====================================================
    */

    const photoBorder =

        new fabric.Rect({

            originX:
                "center",

            originY:
                "center",

            left:
                0,

            top:

                -height / 2 +

                photoConfig.height / 2,

            width:
                photoConfig.width,

            height:
                photoConfig.height,

            fill:
                "transparent",

            stroke:
                "#dddddd",

            strokeWidth:
                1,

            selectable:
                false,

            evented:
                false,

            objectType:
                "student-photo-border",
        });


    /*
    =====================================================
    STUDENT GROUP
    =====================================================
    */

    const group =

        new fabric.Group(

            [
                photo,
                photoBorder,
                nameText,
                nicknameText,
                quoteText,
            ],

            {

                originX:
                    "center",

                originY:
                    "center",

                left:
                    0,

                top:
                    0,

                /*
                -----------------------------------------
                IMPORTANT
                -----------------------------------------

                The group represents the complete
                520 × 720 student card.
                */

                width,
                height,

                selectable:
                    true,

                evented:
                    true,

                hasControls:
                    true,

                hasBorders:
                    true,

                lockUniScaling:
                    true,

                subTargetCheck:
                    false,

                /*
                -----------------------------------------
                IDENTIFICATION
                -----------------------------------------
                */

                objectType:
                    "student-group",

                studentId,

                studentData: {

                    id:
                        studentId,

                    name,

                    nickname,

                    quote,

                    photo:
                        photoSrc,
                },

                studentName:
                    name,

                studentNickname:
                    nickname,

                studentQuote:
                    quote,
            }
        );


    /*
    =====================================================
    CUSTOM CONTROLS
    =====================================================
    */

    group.setControlsVisibility({

        mt:
            true,

        mb:
            true,

        ml:
            true,

        mr:
            true,

        tl:
            true,

        tr:
            true,

        bl:
            true,

        br:
            true,

        mtr:
            true,
    });


    group.setCoords();


    return group;
}


/*
=========================================================
BUILD MULTIPLE STUDENT GROUPS
=========================================================

AUTOMATIC LAYOUT:

1 student
→ 1 × 1

2 students
→ 2 × 1

3 students
→ 2 × 2

4 students
→ 2 × 2

5 students
→ 3 × 2

6 students
→ 3 × 2

7 students
→ 3 × 3

8 students
→ 3 × 3

9 students
→ 3 × 3

Every student remains ONE GROUP.
=========================================================
*/

export async function buildStudentGroups(
    canvas,
    students = [],
    options = {}
) {

    /*
    -----------------------------------------------------
    VALIDATION
    -----------------------------------------------------
    */

    if (!canvas) {

        console.error(
            "❌ Canvas is not available"
        );

        return [];
    }


    if (
        !students ||
        students.length === 0
    ) {

        console.warn(
            "⚠️ No students to insert"
        );

        return [];
    }


    /*
    -----------------------------------------------------
    OPTIONS
    -----------------------------------------------------
    */

    const {

        gapX =
            10,

        gapY =
            12,

        marginX =
            15,

        marginY =
            15,

        columns =
            null,

        removeExisting =
            false,

    } = options;


    /*
    -----------------------------------------------------
    REMOVE EXISTING STUDENT GROUPS
    -----------------------------------------------------
    */

    if (removeExisting) {

        const existingStudents =

            canvas
                .getObjects()
                .filter(

                    (obj) =>

                        obj.objectType ===
                        "student-group"
                );


        existingStudents.forEach(

            (obj) => {

                canvas.remove(
                    obj
                );
            }
        );
    }


    /*
    -----------------------------------------------------
    PAGE DIMENSIONS
    -----------------------------------------------------
    */

    const pageWidth =
        canvas.getWidth();


    const pageHeight =
        canvas.getHeight();


    /*
    -----------------------------------------------------
    STUDENT COUNT
    -----------------------------------------------------
    */

    const studentCount =
        students.length;


    /*
    -----------------------------------------------------
    AUTOMATIC COLUMNS
    -----------------------------------------------------

    1       → 1 column
    2       → 2 columns
    3-4     → 2 columns
    5+      → 3 columns
    -----------------------------------------------------
    */

    let calculatedColumns;


    if (columns) {

        calculatedColumns =
            columns;

    }

    else if (
        studentCount === 1
    ) {

        calculatedColumns =
            1;

    }

    else if (
        studentCount === 2
    ) {

        calculatedColumns =
            2;

    }

    else if (
        studentCount <= 4
    ) {

        calculatedColumns =
            2;

    }

    else {

        calculatedColumns =
            3;
    }


    calculatedColumns =

        Math.min(
            calculatedColumns,
            studentCount
        );


    /*
    -----------------------------------------------------
    ROW COUNT
    -----------------------------------------------------
    */

    const rows =

        Math.ceil(

            studentCount /
            calculatedColumns
        );


    /*
    -----------------------------------------------------
    BASE CARD SIZE
    -----------------------------------------------------
    */

    const baseCardWidth =
        STUDENT_CARD.width;


    const baseCardHeight =
        STUDENT_CARD.height;


    /*
    -----------------------------------------------------
    AVAILABLE WIDTH
    -----------------------------------------------------
    */

    const availableWidth =

        pageWidth -

        marginX * 2 -

        gapX *
            (
                calculatedColumns - 1
            );


    /*
    -----------------------------------------------------
    AVAILABLE HEIGHT
    -----------------------------------------------------
    */

    const availableHeight =

        pageHeight -

        marginY * 2 -

        gapY *
            (
                rows - 1
            );


    /*
    -----------------------------------------------------
    SCALE X
    -----------------------------------------------------
    */

    const scaleX =

        availableWidth /

        (
            calculatedColumns *
            baseCardWidth
        );


    /*
    -----------------------------------------------------
    SCALE Y
    -----------------------------------------------------
    */

    const scaleY =

        availableHeight /

        (
            rows *
            baseCardHeight
        );


    /*
    -----------------------------------------------------
    FINAL SCALE
    -----------------------------------------------------

    The smaller scale wins.

    This guarantees that every card fits.
    -----------------------------------------------------
    */

    const cardScale =

        Math.min(
            scaleX,
            scaleY
        );


    /*
    -----------------------------------------------------
    NEVER ENLARGE CARD
    -----------------------------------------------------
    */

    const finalScale =

        Math.min(
            cardScale,
            1
        );


    /*
    -----------------------------------------------------
    DISPLAY CARD SIZE
    -----------------------------------------------------
    */

    const displayCardWidth =

        baseCardWidth *
        finalScale;


    const displayCardHeight =

        baseCardHeight *
        finalScale;


    /*
    -----------------------------------------------------
    TOTAL GRID WIDTH
    -----------------------------------------------------
    */

    const totalGridWidth =

        calculatedColumns *
            displayCardWidth +

        (
            calculatedColumns - 1
        ) *
            gapX;


    /*
    -----------------------------------------------------
    TOTAL GRID HEIGHT
    -----------------------------------------------------
    */

    const totalGridHeight =

        rows *
            displayCardHeight +

        (
            rows - 1
        ) *
            gapY;


    /*
    -----------------------------------------------------
    CENTER GRID
    -----------------------------------------------------
    */

    const gridStartX =

        (
            pageWidth -
            totalGridWidth
        ) / 2;


    const gridStartY =

        (
            pageHeight -
            totalGridHeight
        ) / 2;


    /*
    -----------------------------------------------------
    DEBUG
    -----------------------------------------------------
    */

    console.log(
        "📐 STUDENT GRID",
        {

            students:
                studentCount,

            columns:
                calculatedColumns,

            rows,

            pageWidth,

            pageHeight,

            baseCardWidth,

            baseCardHeight,

            scale:
                finalScale,

            displayCardWidth,

            displayCardHeight,

            totalGridWidth,

            totalGridHeight,

            gridStartX,

            gridStartY,
        }
    );


    /*
    =====================================================
    CREATE STUDENT GROUPS
    =====================================================
    */

    const groups = [];


    for (
        let i = 0;
        i < students.length;
        i++
    ) {

        const student =
            students[i];


        /*
        -------------------------------------------------
        CREATE COMPLETE STUDENT CARD
        -------------------------------------------------
        */

        const group =

            await createStudentGroup(
                student
            );


        if (!group) {
            continue;
        }


        /*
        -------------------------------------------------
        COLUMN
        -------------------------------------------------
        */

        const column =

            i %
            calculatedColumns;


        /*
        -------------------------------------------------
        ROW
        -------------------------------------------------
        */

        const row =

            Math.floor(

                i /
                calculatedColumns
            );


        /*
        -------------------------------------------------
        X POSITION
        -------------------------------------------------
        */

        const x =

            gridStartX +

            displayCardWidth / 2 +

            column *
                (
                    displayCardWidth +
                    gapX
                );


        /*
        -------------------------------------------------
        Y POSITION
        -------------------------------------------------
        */

        const y =

            gridStartY +

            displayCardHeight / 2 +

            row *
                (
                    displayCardHeight +
                    gapY
                );


        /*
        -------------------------------------------------
        SCALE COMPLETE CARD
        -------------------------------------------------

        PHOTO
        NAME
        NICKNAME
        QUOTE

        all scale together.
        -------------------------------------------------
        */

        group.set({

            left:
                x,

            top:
                y,

            scaleX:
                finalScale,

            scaleY:
                finalScale,
        });


        group.setCoords();


        /*
        -------------------------------------------------
        ADD GROUP TO CANVAS
        -------------------------------------------------
        */

        canvas.add(
            group
        );


        groups.push(
            group
        );
    }


    /*
    =====================================================
    SELECT INSERTED STUDENTS
    =====================================================
    */

    if (
        groups.length === 1
    ) {

        canvas.setActiveObject(
            groups[0]
        );

    }

    else if (
        groups.length > 1
    ) {

        const selection =

            new fabric.ActiveSelection(

                groups,

                {
                    canvas,
                }
            );


        canvas.setActiveObject(
            selection
        );
    }


    /*
    =====================================================
    RENDER
    =====================================================
    */

    canvas.requestRenderAll();


    /*
    =====================================================
    RETURN
    =====================================================
    */

    return groups;
}


/*
=========================================================
STUDENT TEMPLATE
=========================================================

This template is only the PAGE BACKGROUND / layout
metadata.

IMPORTANT:

Do NOT create separate photo/name/nickname/quote
objects here.

The actual student content is inserted through:

    createStudentGroup()

and:

    buildStudentGroups()

Each student therefore remains ONE Fabric group.
=========================================================
*/

export function StudentLayout() {

    const PAGE_WIDTH =
        794;

    const PAGE_HEIGHT =
        1123;


    /*
    -----------------------------------------------------
    PAGE BACKGROUND
    -----------------------------------------------------
    */

    const objects = [];


    objects.push({

        type:
            "rect",

        left:
            0,

        top:
            0,

        width:
            PAGE_WIDTH,

        height:
            PAGE_HEIGHT,

        fill:
            "#ffffff",

        selectable:
            false,

        evented:
            false,

        objectType:
            "student-page-background",
    });


    /*
    -----------------------------------------------------
    9 STUDENT CONFIGURATION
    -----------------------------------------------------
    */

    const studentCount =
        9;


    const rows =
        3;


    const cols =
        3;


    /*
    -----------------------------------------------------
    GRID SPACING
    -----------------------------------------------------
    */

    const gapX =
        10;


    const gapY =
        12;


    const marginX =
        15;


    const marginY =
        15;


    /*
    -----------------------------------------------------
    BASE CARD SIZE
    -----------------------------------------------------
    */

    const baseCardWidth =
        STUDENT_CARD.width;


    const baseCardHeight =
        STUDENT_CARD.height;


    /*
    -----------------------------------------------------
    AVAILABLE WIDTH
    -----------------------------------------------------
    */

    const availableWidth =

        PAGE_WIDTH -

        marginX * 2 -

        gapX *
            (cols - 1);


    /*
    -----------------------------------------------------
    AVAILABLE HEIGHT
    -----------------------------------------------------
    */

    const availableHeight =

        PAGE_HEIGHT -

        marginY * 2 -

        gapY *
            (rows - 1);


    /*
    -----------------------------------------------------
    SCALE
    -----------------------------------------------------
    */

    const scaleX =

        availableWidth /

        (
            cols *
            baseCardWidth
        );


    const scaleY =

        availableHeight /

        (
            rows *
            baseCardHeight
        );


    const finalScale =

        Math.min(
            scaleX,
            scaleY,
            1
        );


    /*
    -----------------------------------------------------
    DISPLAY CARD SIZE
    -----------------------------------------------------
    */

    const cardWidth =

        baseCardWidth *
        finalScale;


    const cardHeight =

        baseCardHeight *
        finalScale;


    /*
    -----------------------------------------------------
    TOTAL GRID SIZE
    -----------------------------------------------------
    */

    const totalGridWidth =

        cols *
            cardWidth +

        (cols - 1) *
            gapX;


    const totalGridHeight =

        rows *
            cardHeight +

        (rows - 1) *
            gapY;


    /*
    -----------------------------------------------------
    CENTER GRID
    -----------------------------------------------------
    */

    const startX =

        (
            PAGE_WIDTH -
            totalGridWidth
        ) / 2;


    const startY =

        (
            PAGE_HEIGHT -
            totalGridHeight
        ) / 2;


    /*
    -----------------------------------------------------
    RETURN TEMPLATE
    -----------------------------------------------------

    Only the background is placed into the template.

    Students are inserted later as complete
    Fabric groups.
    -----------------------------------------------------
    */

    return {

        version:
            "7.4.0",

        rows,

        cols,

        studentCount,

        cardWidth,

        cardHeight,

        scale:
            finalScale,

        gapX,

        gapY,

        marginX,

        marginY,

        startX,

        startY,

        objects,
    };
}