import { IPicture } from '@/lib'
import React from 'react'
import { getImageData, processImage } from '../lib/histogram'
import { Point } from '../lib/tranformations'
import debounce from 'lodash.debounce'
import { useHistogramReducer } from '../lib/state'
import { useResizedCanvas } from '../lib/canvas-utils'

interface HistogramWidgetProps {
  srcPicture: IPicture
}

export const HistogramWidget = ({ srcPicture }: HistogramWidgetProps) => {
  const [state, dispatch] = useHistogramReducer(srcPicture)

  const onNewFunction = React.useMemo(
    () => (newPoint: Point) => {
      dispatch({type: 'MOVE_POINT', payload: newPoint})
    }, [dispatch]
  )

  return (
    <>
      <p className='font-bold'>Histograms and other shit</p>
      <div className='flex flex-row justify-between'>
        <ResizedCanvas imageData={state.sourcePicture.imageData || getImageData(state.sourcePicture.bitmap)} title={<p className='text-center font-thin'>Source</p>} maxWidth={240} maxHeight={360} />
        <ResizedCanvas imageData={state.currentPicture.imageData || getImageData(state.currentPicture.bitmap)} title={<p className='text-center font-thin'>Current</p>} maxWidth={240} maxHeight={360} />
      </div>
      <Histogram imageData={state.currentPicture.imageData || getImageData(state.currentPicture.bitmap)}/>
      <FuncMaker onChangePoints={onNewFunction} points={state.points} />
    </>
  )
}

interface HistogramProps {
  imageData: ImageData
}

const Histogram = ({ imageData }: HistogramProps) => {
  const histoRef = React.useRef<HTMLCanvasElement | null>(null)
  const [byValue, setMode] = React.useState<boolean>(true)

  React.useEffect(() => {
    if (!histoRef.current) return

    processImage(imageData, histoRef.current, byValue)
  }, [byValue, imageData])

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex flex-row justify-between'>
        <p className='font-thin'>Histogram</p>
        <div className='flex flex-row gap-3 items-center'>
          <label htmlFor='value-histo-checkbox'>Toggle Value</label>
          <input name='value-histo-checkbox' type='checkbox' defaultChecked={byValue} onChange={(e) => setMode(e.target.checked)} />
        </div>
      </div>
      <canvas ref={histoRef} width={480} height={100}></canvas>
    </div>
  )
}

interface ResizedCanvasProps {
  title: React.ReactNode,
  maxWidth?: number,
  maxHeight?: number,
  imageData: ImageData,
}

export const ResizedCanvas = ({ title, imageData, maxHeight, maxWidth }: ResizedCanvasProps) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)

  useResizedCanvas(canvasRef, imageData, maxHeight, maxWidth)

  return (
    <div className='flex flex-col gap-2'>
      {title}
      <canvas ref={canvasRef}></canvas>
    </div>
  )
}

interface FuncMakerProps {
  onChangePoints: (newPoint: Point) => void,
  points: Point[]
}

const FuncMaker = ({ onChangePoints, points }: FuncMakerProps) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null)
  const currentPoint = React.useRef<Point | null>(null)
  

  const draw = React.useCallback((points: Point[]) => {
    if (!canvasRef.current) return
    
    if (!ctxRef.current) {
      ctxRef.current = canvasRef.current.getContext('2d')
      if (!ctxRef.current) return
    }

    ctxRef.current.fillStyle = 'white'
    ctxRef.current.fillRect(0, 0, 256, 256)

    for (let i = 1; i < points.length; i++) {
      const pointPrev = points[i - 1]
      const pointCur = points[i]
      ctxRef.current.fillStyle = 'black'
      ctxRef.current.beginPath()
      ctxRef.current.moveTo(pointPrev.x, 255 - pointPrev.y)
      ctxRef.current.lineTo(pointCur.x, 255 - pointCur.y)
      ctxRef.current.stroke()
      ctxRef.current.fillStyle = 'red'
      ctxRef.current.fillRect(pointPrev.x - 5, 255 - pointPrev.y - 5, 7, 7)
      ctxRef.current.fillRect(pointCur.x - 5, 255 - pointCur.y - 5, 7, 7)
    }
  }, [])

  React.useEffect(() => {
    draw(points)
  }, [draw, points])

  const onCancel = React.useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!currentPoint.current) return
      currentPoint.current = null
  }, [])

  const onMove = React.useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!currentPoint.current) return
      currentPoint.current.y = 255 - e.nativeEvent.offsetY
      React.startTransition(() => {
        onChangePoints(currentPoint.current!)
      })
  }, [onChangePoints])

  const onStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentPoint.current) { 
      currentPoint.current = null 
      return
    }
    const index = points.findIndex(
      point => 
           e.nativeEvent.offsetX > point.x - 10 
        && 255 - e.nativeEvent.offsetY > point.y - 10 
        && point.x + 10 > e.nativeEvent.offsetX 
        && point.y + 10 > 255 - e.nativeEvent.offsetY 
    )
    if (!~index) return

    currentPoint.current = {...points[index]}
  }

  return (
    <div>
      <canvas 
        style={{maxWidth: 256, maxHeight: 256}} 
        height={256} 
        width={256} 
        ref={canvasRef} 
        onMouseDown={onStart} 
        onMouseMove={onMove} 
        onMouseUp={onCancel}
        onMouseLeave={onCancel}
      >

      </canvas>
    </div>
  )
}
