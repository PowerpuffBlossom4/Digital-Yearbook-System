import * as fabric from "fabric";

export async function buildPhotoFrames(canvas, layout) {
    if (!canvas) return;

    const frameArea = layout.frameArea || {
        left: 0,
        top: 0,
        width: canvas.getWidth(),
        height: canvas.getHeight(),
    };

    const pageLeft = frameArea.left;
    const pageTop = frameArea.top;
    const pageWidth = frameArea.width;
    const pageHeight = frameArea.height;

    const rows = layout.rows;
    const cols = layout.cols;

    const frameWidth = pageWidth / cols;
    const frameHeight = pageHeight / rows;
  
  

  const photos = layout.photos;

 canvas.clear();
canvas.backgroundColor = "#ffffff";

for (let i = 0; i < photos.length; i++) {
  const row = Math.floor(i / cols);
  const col = i % cols;

const x = pageLeft + col * frameWidth;
const y = pageTop + row * frameHeight;

const width =
  col === cols - 1
    ? pageWidth - x
    : frameWidth;

const height =
  row === rows - 1
    ? pageHeight - y
    : frameHeight;

const img = await fabric.FabricImage.fromURL(photos[i].src);

// Scale image to completely cover the frame
img.scaleToWidth(width);

if (img.getScaledHeight() < height) {
  img.scaleToHeight(height);
}

img.set({
  originX: "center",
  originY: "center",

  left: x + width / 2,
  top: y + height / 2,

  selectable: true,
  hasControls: true,
  lockUniScaling: true,
});

  const clip = new fabric.Rect({
    originX: "center",
    originY: "center",

    left: x + width / 2,
    top: y + height / 2,

    width,
    height,

    absolutePositioned: true,
  });

  img.clipPath = clip;

  canvas.add(img);

  const border = new fabric.Rect({
    left: x,
    top: y,
    width,
    height,
    fill: null,
    
   
    selectable: false,
    evented: false,
  });

  canvas.add(border);
}

canvas.requestRenderAll();

}