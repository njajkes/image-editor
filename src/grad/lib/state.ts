import { IPicture } from "@/lib";
import { Reducer, useReducer } from "react";
import { Point, getInitialPoints, getPixelMapForHistorgamEq, replacePoint } from "./tranformations";
import { getNewImageDataByPoints } from "./canvas-utils";
import { getImageData } from "./histogram";
import debounce from "lodash.debounce";

interface HistogramState {
  sourcePicture: IPicture,
  currentPicture: IPicture,
  points: Point[]
}
interface Action<T, V = undefined> {
  type: T,
  payload: V
}

type MovePointAction = Action<'MOVE_POINT', Point>
type InitPicturesAction = Action<'INIT_PICTURES_ACTION', IPicture>

type Actions = 
  | MovePointAction 
  | InitPicturesAction

type HistogramReducer<T = undefined> = T extends undefined ? Reducer<HistogramState, Actions> : Reducer<HistogramState, T>

const getInitialState = (sourcePicture: IPicture): HistogramState => ({
  points: getInitialPoints(),
  currentPicture: sourcePicture,
  sourcePicture,
})

const getNewImageDataDebounced = debounce(getNewImageDataByPoints, 17)

const MovePointReducer: HistogramReducer<MovePointAction> = (prevState, action) => {
  if (!prevState.sourcePicture || !prevState.currentPicture) {
    console.warn('Pictures doesn\'t init')
    return prevState
  }
  const srcImageData = prevState.sourcePicture.imageData ?? getImageData(prevState.sourcePicture.bitmap)
  const newPoints = replacePoint(action.payload, prevState.points)

  const newData = getNewImageDataDebounced(newPoints, srcImageData) ?? srcImageData
  return {
    ...prevState, 
    currentPicture: {
      ...prevState.currentPicture,
      imageData: newData
    },
    points: newPoints
  }
}

const InitPicturesReducer: HistogramReducer<InitPicturesAction> = (prevState, action) => {
  return {
    ...prevState,
    currentPicture: action.payload,
    sourcePicture: action.payload,
  }
}

const rootReducer: HistogramReducer = (prevState, action) => {
  switch(action.type) {
    case 'MOVE_POINT':
      return MovePointReducer(prevState, action)
    case 'INIT_PICTURES_ACTION':
      return InitPicturesReducer(prevState, action)
    default:
      return prevState
  }
}

export const useHistogramReducer = (sourcePicture: IPicture) => useReducer(rootReducer, getInitialState(sourcePicture))
