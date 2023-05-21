import { Pixel } from "@/lib"

export const getImageDataWhiteBlack = (imgData: ImageData) => {
  const clone = structuredClone(imgData)
  for (let i = 0; i < clone.data.length; i += 4) {
    const newPixel = new Pixel(
      clone.data[i], 
      clone.data[i + 1], 
      clone.data[i + 2],
      clone.data[i + 3]
    ).toWhiteBlack();

    clone.data[i] = newPixel.r, 
    clone.data[i + 1] = newPixel.g, 
    clone.data[i + 2] = newPixel.b;
  }
  return clone
}
