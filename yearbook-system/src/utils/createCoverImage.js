import * as fabric from "fabric";

export async function createCoverImage(
    src,
    frameWidth,
    frameHeight
) {

    const image = await fabric.FabricImage.fromURL(src);

    const scale = Math.max(
        frameWidth / image.width,
        frameHeight / image.height
    );

    image.scale(scale);

    image.set({

        left:
            (frameWidth - image.getScaledWidth()) / 2,

        top:
            (frameHeight - image.getScaledHeight()) / 2,

        originX: "left",
        originY: "top"

    });

    return image;

}