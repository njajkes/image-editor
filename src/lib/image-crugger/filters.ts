import { Pixel } from './pixel'

export const noopImageData = (
  imageDataA: ImageData, 
  imageDataB: ImageData,
) => {
  return imageDataA
}

type FilterFactoryType = (newPointCtor: (a: Pixel, b: Pixel) => Pixel) => ImagesFilter

const filterFactory: FilterFactoryType = (newPointCtor) => (imageDataA, imageDataB) => {
  for (let i = 0; i < imageDataA.data.length; i += 4) {
    const pointA = new Pixel(imageDataA.data[i], imageDataA.data[i+1], imageDataA.data[i+2], imageDataA.data[i+3])
    const pointB = new Pixel(imageDataB.data[i], imageDataB.data[i+1], imageDataB.data[i+2], imageDataB.data[i+3])

    const newPointArray = newPointCtor(pointA, pointB).toRest()

    imageDataA.data[i] = newPointArray[0]
    imageDataA.data[i + 1] = newPointArray[1]
    imageDataA.data[i + 2] = newPointArray[2]
    imageDataA.data[i + 3] = newPointArray[3]
  }
  return imageDataA
}

export const summa = filterFactory(Pixel.sum)
export const difference = filterFactory(Pixel.div)
export const multiply = filterFactory(Pixel.mul)
export const mean = filterFactory(Pixel.mean)
export const just = filterFactory(Pixel.just)

export type ImagesFilter = (imageDataA: ImageData, imageDataB: ImageData) => ImageData

