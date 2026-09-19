import * as fabric from "fabric";

export function enableSmartGuides(canvas) {
    const SNAP_DISTANCE = 6;

    const pageWidth = canvas.getWidth();
    const pageHeight = canvas.getHeight();

    const centerX = pageWidth / 2;
    const centerY = pageHeight / 2;

    let vGuide = null;
    let hGuide = null;

    function removeGuides() {
        if (vGuide) {
            canvas.remove(vGuide);
            vGuide = null;
        }

        if (hGuide) {
            canvas.remove(hGuide);
            hGuide = null;
        }
    }

    canvas.on("object:moving", (e) => {
        const obj = e.target;
        if (!obj) return;

        removeGuides();

        obj.setCoords();

        const center = obj.getCenterPoint();

        // Vertical center
        if (Math.abs(center.x - centerX) <= SNAP_DISTANCE) {

            obj.left += centerX - center.x;

            vGuide = new fabric.Line(
                [centerX, 0, centerX, pageHeight],
                {
                    stroke: "#0bc448",
                    strokeWidth: 1,
                    selectable: false,
                    evented: false,
                    excludeFromExport: true,
                }
            );

            canvas.add(vGuide);
        }

        // Horizontal center
        if (Math.abs(center.y - centerY) <= SNAP_DISTANCE) {

            obj.top += centerY - center.y;

            hGuide = new fabric.Line(
                [0, centerY, pageWidth, centerY],
                {
                    stroke: "#0bc448",
                    strokeWidth: 1,
                    
                    selectable: false,
                    evented: false,
                    excludeFromExport: true,
                }
            );

            canvas.add(hGuide);
        }

        obj.setCoords();
        canvas.requestRenderAll();
    });

    canvas.on("mouse:up", () => {
        removeGuides();
        canvas.requestRenderAll();
    });
}