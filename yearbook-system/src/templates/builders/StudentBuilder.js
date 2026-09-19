import * as fabric from "fabric";

export async function buildStudents(canvas, students) {

    if (!canvas || !students) return;

    // Photo placeholders
    const photoFrames = canvas
        .getObjects()
        .filter(obj => obj.studentPhoto);

    for (let i = 0; i < photoFrames.length; i++) {

        const frame = photoFrames[i];
        const student = students[i];

        if (!student) continue;
        if (!student.photo) continue;

        //-------------------------------------------------
        // Load image
        //-------------------------------------------------

        const img = await fabric.FabricImage.fromURL(
            student.photo,
            {
                crossOrigin: "anonymous"
            }
        );

        //-------------------------------------------------
        // COVER SCALE
        //-------------------------------------------------

        const scale = Math.max(
            frame.width / img.width,
            frame.height / img.height
        );

        img.scale(scale);

        //-------------------------------------------------
        // CENTER IMAGE
        //-------------------------------------------------

        img.set({

            left:
                frame.left +
                (frame.width - img.getScaledWidth()) / 2,

            top:
                frame.top +
                (frame.height - img.getScaledHeight()) / 2,

            selectable: false,
            evented: false

        });

        //-------------------------------------------------
        // Clip inside frame
        //-------------------------------------------------

        img.clipPath = new fabric.Rect({

            left: frame.left,
            top: frame.top,

            width: frame.width,
            height: frame.height,

            absolutePositioned: true,

            rx: frame.rx || 0,
            ry: frame.ry || 0

        });

        //-------------------------------------------------
        // Add image
        //-------------------------------------------------

        canvas.add(img);

        //-------------------------------------------------
        // Remove gray placeholder
        //-------------------------------------------------

        canvas.remove(frame);

        //-------------------------------------------------
        // Student Name
        //-------------------------------------------------

        const name = canvas
            .getObjects()
            .find(o =>
                o.studentName &&
                o.studentIndex === frame.studentIndex
            );

        if (name) {
            name.text = student.name || "";
        }

        //-------------------------------------------------
        // Nickname
        //-------------------------------------------------

        const nickname = canvas
            .getObjects()
            .find(o =>
                o.studentNickname &&
                o.studentIndex === frame.studentIndex
            );

        if (nickname) {
            nickname.text = student.nickname
                ? `"${student.nickname}"`
                : "";
        }

        //-------------------------------------------------
        // Quote
        //-------------------------------------------------

        const quote = canvas
            .getObjects()
            .find(o =>
                o.studentQuote &&
                o.studentIndex === frame.studentIndex
            );

        if (quote) {
            quote.text = student.quote || "";
        }

    }

    canvas.requestRenderAll();

}