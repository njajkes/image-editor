import { ITypes, modeSwitcher } from "./modes"

export interface IPicture {
  id: number,
  imageFile: File,
  bitmap: ImageBitmap,
  opacity: number,
  type: ITypes,
  imageData?: ImageData
}

export const computeCtx = async (
  pictures: IPicture[], 
  ctx: CanvasRenderingContext2D, 
  mxw: number, 
  mxh: number,
  resizeWidth?: number,
  resizeHeight?: number,
) => {
  // getting resized data of pics
  for (const pic of pictures) {
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = mxw
    tempCanvas.height = mxh
    const tempCtx = tempCanvas.getContext('2d')!
    tempCtx.scale(
      mxw / pic.bitmap.width, 
      mxh / pic.bitmap.height
    )
    tempCtx.globalAlpha = pic.opacity
    tempCtx.drawImage(pic.bitmap, 0, 0);
    tempCtx.save();
    const imageData = tempCtx.getImageData(0, 0, mxw, mxh);
    // imageData.data.forEach((el, idx) => {
    //   if (idx % 4 === 3) imageData.data[idx] = el * pic.opacity
    // })
    pic.imageData = imageData;
  }
  const imageData = pictures[0]?.imageData
  if (!imageData) return
  for (const pic of pictures.slice(1)) {
    const filterFn = modeSwitcher(pic.type)
    filterFn(imageData, pic.imageData!)
  }

  if (resizeHeight || resizeWidth) {
    const widthIfHeight = imageData.width / imageData.height * (resizeHeight || 0)
    const heightIfWidth = imageData.height / imageData.width * (resizeWidth || 0)
  }

  ctx?.putImageData(imageData, 0, 0)
}
