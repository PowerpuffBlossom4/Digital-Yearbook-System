export async function preparePhotos(files) {
  if (!files || !files.length) {
    return {
      photos: [],
    };
  }

  const photos = await Promise.all(
    files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          const img = new Image();

          img.onload = () => {
            resolve({
              id: crypto.randomUUID(),
              name: file.name,
              file,
              src: reader.result,
              width: img.width,
              height: img.height,
              portrait: img.height >= img.width,
            });
          };

          img.onerror = reject;
          img.src = reader.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    })
  );

  return {
    photos,
  };
}