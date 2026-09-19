import * as fabric from "fabric";

/*
=========================================================
STUDENT CARD CONFIGURATION
=========================================================
*/

export const STUDENT_CARD = {
    width: 720,
    height: 1300,

    photo: {
        width: 720,
        height: 1079,
    },

    // PHOTO → NAME
    photoSpacing: 30,

    name: {
        fontSize: 40,
        fontWeight: "bold",

        // NAME → NICKNAME
        spacing: 20,
    },

    nickname: {
        fontSize: 32,
        fontWeight: "italic",

        // NICKNAME → MOTTO
        spacing: 20,
    },

    quote: {
        fontSize: 34,
        fontWeight: "italic",
    },
};


/*
=========================================================
HELPER: NORMALIZE IMAGE URL
=========================================================
*/

function normalizeImageUrl(src) {
    if (!src) return "";

    if (typeof src !== "string") {
        return "";
    }

    const trimmed = src.trim();

    if (!trimmed) {
        return "";
    }

    /*
    -----------------------------------------------------
    FULL URL
    -----------------------------------------------------
    */
    if (
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://") ||
        trimmed.startsWith("data:") ||
        trimmed.startsWith("blob:")
    ) {
        return trimmed;
    }

    /*
    -----------------------------------------------------
    RELATIVE URL

    Example:
    /uploads/student.jpg

    becomes:
    http://localhost:5000/uploads/student.jpg
    -----------------------------------------------------
    */

    if (trimmed.startsWith("/")) {
        return `http://localhost:5000${trimmed}`;
    }

    /*
    -----------------------------------------------------
    OTHER RELATIVE PATH
    -----------------------------------------------------
    */

    return `http://localhost:5000/${trimmed}`;
}


/*
=========================================================
HELPER: GET STUDENT PHOTO
=========================================================
*/

function getStudentPhoto(student) {
    if (!student) return "";

    /*
    IMPORTANT:

    Your backend returns:

        u.profile_pic

    Therefore profile_pic MUST be checked.
    */

    return (
        student.profile_pic ||
        student.profilePic ||
        student.photo ||
        student.photo_url ||
        student.photoUrl ||
        student.image ||
        student.image_url ||
        student.imageUrl ||
        student.profile_image ||
        student.profile_picture ||
        student.profilePhoto ||
        student.avatar ||
        ""
    );
}


/*
=========================================================
HELPER: GET STUDENT NAME
=========================================================
*/

function getStudentName(student) {
    if (!student) {
        return "Student Name";
    }

    return (
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
        "Student Name"
    );
}


/*
=========================================================
HELPER: GET STUDENT NICKNAME
=========================================================
*/

function getStudentNickname(student) {
    if (!student) {
        return "";
    }

    return (
        student.nickname ||
        student.nick_name ||
        student.nickName ||
        ""
    );
}


/*
=========================================================
HELPER: GET STUDENT MOTTO
=========================================================
*/

function getStudentMotto(student) {
    if (!student) {
        return "";
    }

    /*
    IMPORTANT:

    Your backend returns:

        sp.motto

    Therefore motto MUST be checked.
    */

    return (
        student.motto ||
        student.quote ||
        student.student_quote ||
        student.studentQuote ||
        student.message ||
        student.tagline ||
        ""
    );
}


/*
=========================================================
HELPER: LOAD IMAGE
=========================================================
*/

async function loadStudentImage(src) {
    if (!src) {
        console.warn(
            "⚠️ No student photo URL provided."
        );

        return null;
    }

    const imageUrl = normalizeImageUrl(src);

    console.log(
        "🖼️ Loading student photo:",
        imageUrl
    );

    try {
        const image =
            await fabric.FabricImage.fromURL(
                imageUrl,
                {
                    crossOrigin: "anonymous",
                }
            );

        if (!image) {
            console.error(
                "❌ Fabric returned no image:",
                imageUrl
            );

            return null;
        }

        console.log(
            "✅ Student photo loaded:",
            imageUrl
        );

        return image;
    } catch (error) {
        console.error(
            "❌ Failed to load student image:",
            imageUrl,
            error
        );

        return null;
    }
}


/*
=========================================================
HELPER: CREATE STUDENT PHOTO
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

    const image =
        await loadStudentImage(src);

    /*
    -----------------------------------------------------
    NO IMAGE
    -----------------------------------------------------
    */

    if (!image) {
        console.warn(
            "⚠️ Creating student photo placeholder."
        );

        return new fabric.Rect({
            width: frameWidth,
            height: frameHeight,

            fill: "#eeeeee",

            originX: "center",
            originY: "center",

            selectable: false,
            evented: false,

            objectType:
                "student-photo-placeholder",

            excludeFromExport: false,
        });
    }

    /*
    -----------------------------------------------------
    ORIGINAL IMAGE SIZE
    -----------------------------------------------------
    */

    const originalSize =
        image.getOriginalSize
            ? image.getOriginalSize()
            : {
                  width: image.width,
                  height: image.height,
              };

    const sourceWidth =
        originalSize.width ||
        image.width ||
        frameWidth;

    const sourceHeight =
        originalSize.height ||
        image.height ||
        frameHeight;

    /*
    -----------------------------------------------------
    COVER SCALE
    -----------------------------------------------------
    */

    const scaleX =
        frameWidth / sourceWidth;

    const scaleY =
        frameHeight / sourceHeight;

    const scale = Math.max(
        scaleX,
        scaleY
    );

    const scaledWidth =
        sourceWidth * scale;

    const scaledHeight =
        sourceHeight * scale;

    /*
    -----------------------------------------------------
    IMAGE
    -----------------------------------------------------
    */

    image.set({
        originX: "center",
        originY: "center",

        left: 0,
        top: 0,

        scaleX: scale,
        scaleY: scale,

        selectable: false,
        evented: false,

        objectType:
            "student-photo",

        controls: false,

        dirty: true,
    });

    /*
    -----------------------------------------------------
    CLIP PHOTO
    -----------------------------------------------------
    */

    const clip =
        new fabric.Rect({
            originX: "center",
            originY: "center",

            left: 0,
            top: 0,

            width: frameWidth,
            height: frameHeight,

            absolutePositioned: false,

            rx: 2,
            ry: 2,

            selectable: false,
            evented: false,
        });

    image.clipPath = clip;

    /*
    -----------------------------------------------------
    FINAL IMAGE SIZE
    -----------------------------------------------------
    */

    image.set({
        width: scaledWidth,
        height: scaledHeight,

        left: 0,
        top: 0,

        dirty: true,
    });

    return image;
}


/*
=========================================================
HELPER: CREATE EDITABLE TEXT
=========================================================
*/

function createStudentText(
    text,
    {
        fontSize,
        fontWeight = "normal",
        fontStyle = "normal",
    },
    fieldName
) {
    const textbox =
        new fabric.Textbox(
            text || "",
            {
                originX: "center",
                originY: "top",

                left: 0,
                top: 0,

                width:
                    STUDENT_CARD.width - 40,

                fontSize,

                fontFamily: "Arial",

                fontWeight,
                fontStyle,

                fill: "#222222",

                textAlign: "center",

                lineHeight: 1.15,

                editable: true,

                selectable: false,
                evented: false,

                objectCaching: false,

                objectType:
                    "student-text",

                studentTextField:
                    fieldName,

                excludeFromExport: false,
            }
        );

    return textbox;
}


/*
=========================================================
CREATE ONE STUDENT GROUP

PHOTO
NAME
NICKNAME
MOTTO

Everything belongs to ONE Fabric group.
=========================================================
*/

export async function createStudentGroup(
    student
) {
    if (!student) {
        return null;
    }

    const {
        width,
        height,

        photo: photoConfig,

        photoSpacing,

        name: nameConfig,

        nickname: nicknameConfig,

        quote: quoteConfig,
    } = STUDENT_CARD;


    /*
    =====================================================
    STUDENT DATA
    =====================================================
    */

    const studentId =
        student.id ??
        student.student_id ??
        student.studentId ??
        null;


    /*
    =====================================================
    GET STUDENT INFORMATION
    =====================================================
    */

    const photoSrc =
        getStudentPhoto(student);

    const photoUrl =
        normalizeImageUrl(photoSrc);

    const name =
        getStudentName(student);

    const nickname =
        getStudentNickname(student);

    const motto =
        getStudentMotto(student);


    /*
    =====================================================
    DEBUG STUDENT DATA
    =====================================================
    */

    console.log(
        "👨‍🎓 Creating student card:",
        {
            id: studentId,

            name,

            nickname,

            motto,

            profile_pic:
                student.profile_pic,

            photoSrc,

            photoUrl,
        }
    );


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
        left: 0,

        top:
            -height / 2 +
            photoConfig.height / 2,
    });

    photo.selectable = false;
    photo.evented = false;


    /*
    =====================================================
    NAME
    =====================================================
    */

    const nameText =
        createStudentText(
            name,
            nameConfig,
            "name"
        );

    const textStart =
        -height / 2 +
        photoConfig.height +
        photoSpacing;

    nameText.set({
        top: textStart,
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
            nicknameConfig,
            "nickname"
        );

    nicknameText.set({
        top:
            textStart +
            nameConfig.fontSize +
            nameConfig.spacing,
    });


    /*
    =====================================================
    MOTTO
    =====================================================
    */

    const mottoText =
        createStudentText(
            motto
                ? `"${motto}"`
                : "",
            quoteConfig,
            "motto"
        );

    mottoText.set({
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
            originX: "center",
            originY: "center",

            left: 0,

            top:
                -height / 2 +
                photoConfig.height / 2,

            width:
                photoConfig.width,

            height:
                photoConfig.height,

            fill: "transparent",

            stroke: "#dddddd",

            strokeWidth: 1,

            selectable: false,
            evented: false,

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
                mottoText,
            ],
            {
                originX: "center",
                originY: "center",

                left: 0,
                top: 0,

                width,
                height,

                /*
                ==========================================
                GROUP IS THE ONLY SELECTABLE OBJECT
                ==========================================
                */

                selectable: true,
                evented: true,

                hasControls: true,
                hasBorders: true,

                lockMovementX: false,
                lockMovementY: false,

                lockScalingX: false,
                lockScalingY: false,

                lockRotation: false,

                /*
                ==========================================
                DO NOT SELECT CHILDREN
                ==========================================
                */

                subTargetCheck: false,

                objectType:
                    "student-group",

                /*
                ==========================================
                STUDENT DATA
                ==========================================
                */

                studentId,

                studentData: {
                    id: studentId,

                    name,

                    nickname,

                    motto,

                    /*
                    Keep quote for backward
                    compatibility.
                    */

                    quote: motto,

                    /*
                    IMPORTANT:
                    Save the original backend field.
                    */

                    photo:
                        photoSrc,

                    profile_pic:
                        student.profile_pic ||
                        "",

                    email:
                        student.email ||
                        "",

                    program:
                        student.program ||
                        student.department_program ||
                        "",

                    batch:
                        student.batch ||
                        student.batch_name ||
                        student.year ||
                        "",
                },

                studentName: name,

                studentNickname:
                    nickname,

                studentMotto:
                    motto,

                /*
                Backward compatibility
                */

                studentQuote:
                    motto,

                studentPhoto:
                    photoUrl,
            }
        );


    /*
    =====================================================
    CUSTOM CONTROLS
    =====================================================
    */

    group.setControlsVisibility({
        mt: true,
        mb: true,
        ml: true,
        mr: true,

        tl: true,
        tr: true,
        bl: true,
        br: true,

        mtr: true,
    });


    group.setCoords();


    console.log(
        "✅ Student group created:",
        {
            id: studentId,
            name,
            nickname,
            motto,
            photo: photoUrl,
        }
    );


    return group;
}


/*
=========================================================
BUILD MULTIPLE STUDENT GROUPS

1 student
→ 1 × 1

2 students
→ 2 × 1

3 students
→ 2 × 2

4 students
→ 2 × 2

5–6 students
→ 3 × 2

7–9 students
→ 3 × 3
=========================================================
*/

export async function buildStudentGroups(
    canvas,
    students,
    options = {}
) {
    /*
    =====================================================
    VALIDATION
    =====================================================
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
    =====================================================
    OPTIONS
    =====================================================
    */

    const {
        gapX = 15,
        gapY = 15,

        marginX = 20,
        marginY = 20,

        columns = null,

        removeExisting = false,
    } = options;


    /*
    =====================================================
    REMOVE EXISTING STUDENTS
    =====================================================
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
                canvas.remove(obj);
            }
        );
    }


    /*
    =====================================================
    PAGE DIMENSIONS
    =====================================================
    */

    const pageWidth =
        canvas.getWidth();

    const pageHeight =
        canvas.getHeight();


    /*
    =====================================================
    SORT STUDENTS ALPHABETICALLY
    =====================================================
    */

    const sortedStudents =
        [...students].sort(
            (a, b) => {
                const nameA =
                    getStudentName(a);

                const nameB =
                    getStudentName(b);

                return nameA.localeCompare(
                    nameB,
                    undefined,
                    {
                        sensitivity:
                            "base",
                    }
                );
            }
        );


    /*
    =====================================================
    STUDENT COUNT
    =====================================================
    */

    const studentCount =
        sortedStudents.length;


    /*
    =====================================================
    AUTOMATIC COLUMN COUNT
    =====================================================
    */

    let calculatedColumns;

    if (columns) {
        calculatedColumns =
            columns;
    } else if (
        studentCount === 1
    ) {
        calculatedColumns = 1;
    } else if (
        studentCount === 2
    ) {
        calculatedColumns = 2;
    } else if (
        studentCount <= 4
    ) {
        calculatedColumns = 2;
    } else {
        calculatedColumns = 3;
    }

    calculatedColumns =
        Math.min(
            calculatedColumns,
            studentCount
        );


    /*
    =====================================================
    ROW COUNT
    =====================================================
    */

    const rows =
        Math.ceil(
            studentCount /
                calculatedColumns
        );


    /*
    =====================================================
    BASE CARD SIZE
    =====================================================
    */

    const baseCardWidth =
        STUDENT_CARD.width;

    const baseCardHeight =
        STUDENT_CARD.height;


    /*
    =====================================================
    AVAILABLE WIDTH
    =====================================================
    */

    const availableWidth =
        pageWidth -
        marginX * 2 -
        gapX *
            (calculatedColumns - 1);


    /*
    =====================================================
    AVAILABLE HEIGHT
    =====================================================
    */

    const availableHeight =
        pageHeight -
        marginY * 2 -
        gapY *
            (rows - 1);


    /*
    =====================================================
    SCALE
    =====================================================
    */

    const scaleX =
        availableWidth /
        (
            calculatedColumns *
            baseCardWidth
        );

    const scaleY =
        availableHeight /
        (
            rows *
            baseCardHeight
        );

    const cardScale =
        Math.min(
            scaleX,
            scaleY
        );


    /*
    =====================================================
    NEVER ENLARGE ABOVE ORIGINAL SIZE
    =====================================================
    */

    const finalScale =
        Math.min(
            cardScale,
            1
        );


    /*
    =====================================================
    DISPLAY CARD SIZE
    =====================================================
    */

    const displayCardWidth =
        baseCardWidth *
        finalScale;

    const displayCardHeight =
        baseCardHeight *
        finalScale;


    /*
    =====================================================
    TOTAL GRID WIDTH
    =====================================================
    */

    const totalGridWidth =
        calculatedColumns *
            displayCardWidth +
        (
            calculatedColumns - 1
        ) *
            gapX;


    /*
    =====================================================
    TOTAL GRID HEIGHT
    =====================================================
    */

    const totalGridHeight =
        rows *
            displayCardHeight +
        (
            rows - 1
        ) *
            gapY;


    /*
    =====================================================
    CENTER GRID
    =====================================================
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
    =====================================================
    DEBUG
    =====================================================
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
    CREATE STUDENTS
    =====================================================
    */

    const groups = [];


    for (
        let i = 0;
        i < sortedStudents.length;
        i++
    ) {
        const student =
            sortedStudents[i];


        /*
        -------------------------------------------------
        CREATE STUDENT CARD
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
        SCALE WHOLE CARD
        -------------------------------------------------
        */

        group.set({
            left: x,
            top: y,

            scaleX:
                finalScale,

            scaleY:
                finalScale,

            selectable: true,
            evented: true,

            lockMovementX: false,
            lockMovementY: false,

            lockRotation: false,
        });


        group.setCoords();


        /*
        -------------------------------------------------
        ADD TO CANVAS
        -------------------------------------------------
        */

        canvas.add(group);

        groups.push(group);
    }


    /*
    =====================================================
    SELECT ONLY FIRST INSERTED STUDENT
    =====================================================
    */

    if (groups.length > 0) {
        canvas.discardActiveObject();

        canvas.setActiveObject(
            groups[0]
        );

        groups[0].set({
            selectable: true,
            evented: true,
        });

        groups[0].setCoords();
    }


    /*
    =====================================================
    RENDER
    =====================================================
    */

    canvas.requestRenderAll();


    /*
    =====================================================
    RETURN GROUPS
    =====================================================
    */

    return groups;
}