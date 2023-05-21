import { IPicture } from "@/lib";
import { Reducer, useReducer } from "react";
import { getImageDataWhiteBlack } from "./get-image-data-white-black";
import { getImageData } from "@/grad/lib/histogram";

interface MonochomicState {
  sourcePicture: IPicture,
  currentPicture: IPicture,
}
interface Action<T, V = undefined> {
  type: T,
  payload: V
}

type MeanAction = Action<'MEAN', undefined>
type OtsuMethodAction = Action<'OTSU_METHOD', undefined>
type NiblackMethodAction = Action<'NIBLACK_METHOD', undefined>
type SauvolaMethodAction = Action<'SAUVOLA_METHOD', undefined>
type VolfMethodAction = Action<'VOLF_METHOD', undefined>
type BradleyMethodAction = Action<'BRADLEY_METHOD', undefined>

type Actions = 
  | MeanAction
  | OtsuMethodAction
  | NiblackMethodAction
  | SauvolaMethodAction
  | VolfMethodAction
  | BradleyMethodAction

type MonochromicReducer<T = undefined> = 
  T extends undefined 
    ? Reducer<MonochomicState, Actions> 
    : Reducer<MonochomicState, T>

const getInitialState = (sourcePicture: IPicture): MonochomicState => {
  const imgdata = getImageData(sourcePicture.bitmap)
  const newSrc: IPicture = {
    ...sourcePicture,
    imageData: getImageDataWhiteBlack(imgdata)
  }
  return {
    currentPicture: newSrc,
    sourcePicture: newSrc,
  }
}

const Mean: MonochromicReducer<MeanAction> = (prev) => {
  if (!prev.sourcePicture.imageData) return prev

  const width = prev.sourcePicture.bitmap.width
  const height = prev.sourcePicture.bitmap.height
  let sum = 0;

  for (let i = 0; i < prev.sourcePicture.imageData.data.length; i += 4) {
    sum += prev.sourcePicture.imageData.data[i]
  }

  const mean = sum / (width * height)
  console.log(mean)
  
  const clone = structuredClone(prev.sourcePicture.imageData)

  for (let i = 0; i < clone.data.length; i += 4) {
    const avg = clone.data[i] > mean ? 255 : 0
    clone.data[i] = avg
    clone.data[i + 1] = avg
    clone.data[i + 2] = avg
  }

  return {
    ...prev,
    currentPicture: {
      ...prev.currentPicture,
      imageData: clone
    }
  }
}

const OtsuMethod: MonochromicReducer<OtsuMethodAction> = (prev) => {
  if (!prev.sourcePicture.imageData) return prev
  const width = prev.sourcePicture.bitmap.width
  const height = prev.sourcePicture.bitmap.height
  const countOfPixels = width * height

  const hist: number[] = new Array(256).fill(0);
  let sum = 0;

  for (let i = 0; i < prev.sourcePicture.imageData.data.length; i += 4) {
    const intent = prev.sourcePicture.imageData.data[i]
    hist[intent]++;
    sum += intent
  }

  let tCandidate = 0;
  let sigmaCandidate = 0;

  let fromZeroToTCount = 0;
  let fromZeroToTIntensitySum = 0;

  for (let t = 0; t < hist.length; ++t) {
    fromZeroToTCount += hist[t];
    fromZeroToTIntensitySum += t * hist[t];

    const fromZeroProb = fromZeroToTCount / countOfPixels;
    const fromEndProb = 1.0 - fromZeroProb;

    const fromZeroToTMean = fromZeroToTIntensitySum / fromZeroToTCount;
    const fromEndToTMean = (sum - fromZeroToTIntensitySum) 
      / (countOfPixels - fromZeroToTCount);

    const meanDelta = fromZeroToTMean - fromEndToTMean;

    const sigma = fromZeroProb * fromEndProb * meanDelta * meanDelta;

    if (sigma > sigmaCandidate) {
      sigmaCandidate = sigma;
      tCandidate = t;
    }
  }

  const clone = structuredClone(prev.sourcePicture.imageData)
  console.log(clone)

  for (let i = 0; i < clone.data.length; i += 4) {
    const avg = clone.data[i] > tCandidate ? 255 : 0
    clone.data[i] = avg
    clone.data[i + 1] = avg
    clone.data[i + 2] = avg
  }

  return {
    ...prev,
    currentPicture: {
      ...prev.currentPicture,
      imageData: clone
    }
  }
}
const NiblackMethod: MonochromicReducer<NiblackMethodAction> = (prev) => {
  if (!prev.sourcePicture.imageData) return prev

  return {
    ...prev
  }
}
const SauvolaMethod: MonochromicReducer<SauvolaMethodAction> = (prev) => {
  if (!prev.sourcePicture.imageData) return prev

  return {
    ...prev
  }
}
const VolfMethod: MonochromicReducer<VolfMethodAction> = (prev) => {
  if (!prev.sourcePicture.imageData) return prev

  return {
    ...prev
  }
}
const BradleyMethod: MonochromicReducer<BradleyMethodAction> = (prev) => {
  if (!prev.sourcePicture.imageData) return prev

  return {
    ...prev
  }
}

const rootReducer: MonochromicReducer = (prevState, action) => {
  switch(action.type) {
    case 'MEAN':
      return Mean(prevState, action);
    case 'OTSU_METHOD':
      return OtsuMethod(prevState, action)
    case 'NIBLACK_METHOD':
      return NiblackMethod(prevState, action)
    case 'SAUVOLA_METHOD':
      return SauvolaMethod(prevState, action)
    case 'VOLF_METHOD':
      return VolfMethod(prevState, action)
    case 'BRADLEY_METHOD':
      return BradleyMethod(prevState, action)
    default:
      return prevState
  }
}

export const useMonochomicReducer = (sourcePicture: IPicture) => useReducer(rootReducer, getInitialState(sourcePicture))
