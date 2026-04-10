export const extractAccentFromImage = (src) =>
  new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 24;
      canvas.height = 24;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve("#9D4EDD");
        return;
      }

      ctx.drawImage(image, 0, 0, 24, 24);
      const data = ctx.getImageData(0, 0, 24, 24).data;
      let red = 0;
      let green = 0;
      let blue = 0;
      let count = 0;

      for (let i = 0; i < data.length; i += 16) {
        red += data[i];
        green += data[i + 1];
        blue += data[i + 2];
        count += 1;
      }

      resolve(
        `rgb(${Math.round(red / count)}, ${Math.round(green / count)}, ${Math.round(blue / count)})`
      );
    };

    image.onerror = () => resolve("#9D4EDD");
    image.src = src;
  });
