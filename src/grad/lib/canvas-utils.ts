import React from "react"
import { Point, getPixelMapForHistorgamEq } from "./tranformations"

export const getNewImageDataByPoints = (newPoints: Point[], srcImageData: ImageData) => {
  const newMap = getPixelMapForHistorgamEq(newPoints)
  const newData = new ImageData(srcImageData.width, srcImageData.height)
  for (let i = 0; i < newData!.data.length; i += 4) {
    newData.data[i] = newMap[srcImageData.data[i]]
    newData.data[i + 1] = newMap[srcImageData.data[i + 1]]
    newData.data[i + 2] = newMap[srcImageData.data[i + 2]]
    newData.data[i + 3] = srcImageData.data[i + 3]
  }
  return newData
}

export const useResizedCanvas = (
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
  imageData?: ImageData,
  maxHeight?: number,
  maxWidth?: number,
) => {
  React.useEffect(() => {
    (async () => {
      if (!canvasRef.current || !imageData) return
      const ctx = canvasRef.current.getContext('2d')
      if (!ctx) return

      canvasRef.current.width = imageData.width
      canvasRef.current.height = imageData.height

      if (maxHeight && canvasRef.current.height > maxHeight) {
        const prevW = canvasRef.current.width, prevH = canvasRef.current.height
        canvasRef.current.height = maxHeight
        canvasRef.current.width = imageData.width / imageData.height * maxHeight
        ctx.scale(imageData.width / imageData.height * maxHeight / prevW, maxHeight / prevH)
      }
      const bit = await createImageBitmap(imageData)
      
      ctx.drawImage(bit, 0, 0)
    })()
  }, [canvasRef, imageData, maxHeight, maxWidth])
}
