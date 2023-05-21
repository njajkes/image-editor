'use client';

import Image from 'next/image'
import { Inter } from 'next/font/google'
import React from 'react'
import { 
  ITypes, 
  Types, 
  IPicture, 
  computeCtx 
} from '@/lib'
import { HistogramWidget } from '@/grad';
import { useResizedCanvas } from '@/grad/lib/canvas-utils';
import { ImageController } from '@/img-controller/controller';

const inter = Inter({ subsets: ['latin'] })

const counter = () => counter.count++;
counter.count = 0

export default function Home() {
  const [ ctx, setCtx ] = React.useState<CanvasRenderingContext2D | null>(null)
  const [ pictures, setPictures ] = React.useState<IPicture[]>([])
  const { maxHeight, maxWidth } = React.useMemo(
    () => ({
      maxHeight: pictures.length ? Math.max(...pictures.map(pic => pic.bitmap.height)) : 600,
      maxWidth: pictures.length ? Math.max(...pictures.map(pic => pic.bitmap.width)) : 800,
    }), [pictures]
  )

  React.useEffect(() => {
    if (!ctx) return
    computeCtx(pictures, ctx, maxWidth, maxHeight)
    console.log(pictures)
  }, [maxHeight, maxWidth, pictures, ctx])

  const addPicture = 
    async (newFile: File) => {
      const newPicture: IPicture = { 
        id: counter(),
        bitmap: await createImageBitmap(newFile),
        imageFile: newFile,
        opacity: 1,
        type: Types.None 
      }
      setPictures(prev => [...prev, newPicture])
    }

  const changeOpacity =
    (pic: number, newOpacity: number) => {
      const prev = structuredClone(pictures)
      const idx = prev.findIndex(el => el.id === pic)
      if (!~idx) return
      prev[idx].opacity = newOpacity
      setPictures(prev)
    } 
  
  const pictureUp =
    (pic: number) => {
      const prev = structuredClone(pictures)
      const idx = prev.findIndex(el => el.id === pic)
      if (!~idx) return prev
      const element = prev[idx]
      prev.splice(idx, 1)
      prev.splice(idx - 1, 0, element)
      setPictures([...prev])

    }
  const pictureDown = 
    (pic: number) => {
      const prev = structuredClone(pictures)
      const idx = prev.findIndex(el => el.id === pic)
      if (!~idx) return prev
      const element = prev[idx]
      prev.splice(idx, 1)
      prev.splice(idx + 1, 0, element)
      setPictures([...prev])
    }

  const deletePicture = 
    (pic: number) => {
      setPictures(prev => prev.filter(el => el.id !== pic))
    }
  
  const setContext = React.useCallback(
    (newCtx: CanvasRenderingContext2D) => {
      setCtx(newCtx)
    }, []
  )

  const changeMode = 
    (pic: number, newMode: ITypes) => {
      const prev = structuredClone(pictures)
      const idx = prev.findIndex(el => el.id === pic)
      if (!~idx) return
      prev[idx].type = newMode
      setPictures(prev)
    }

  return (
    <div className="flex flex-row justify-between bg-gray-900 h-3/4 w-full p-4">
      <Canvas 
        setContext={setContext} 
        height={maxHeight} 
        width={maxWidth} 
      />
      <Menu 
        addPicture={addPicture} 
        pics={pictures} 
        changeOpacity={changeOpacity} 
        changeMode={changeMode} 
        picUp={pictureUp}
        picDown={pictureDown}
        deletePic={deletePicture}
      />
    </div>
  )
}

interface MenuProps {
  addPicture: (newFile: File) => Promise<void>,
  pics: IPicture[],
  changeOpacity: (id: number, newOpacity: number) => void,
  changeMode: (id: number, newMode: ITypes) => void,
  picUp: (id: number) => void,
  picDown: (id: number) => void,
  deletePic: (id: number) => void,
}

const Menu = ({ 
  pics, 
  addPicture, 
  changeOpacity, 
  changeMode, 
  picDown, 
  picUp, 
  deletePic 
}: MenuProps) => {
  return (
    <div className='flex flex-col gap-1 w-1/5'>
      <input 
        type='file' 
        onChange={async (e) => {
          await addPicture(e.target.files![0])
          e.target.value = ''
        }}
      />
      { pics.map(
          (pic, idx) => (
            <MenuItem 
              item={pic} 
              key={idx} 
              isFirst={idx === 0} 
              isLast={idx === pics.length - 1} 
              changeOpacity={changeOpacity} 
              changeMode={changeMode} 
              picDown={picDown}
              picUp={picUp}
              deletePic={deletePic}
            />
          )
      ) }
    </div>
  )
}

interface MenuItemProps {
  item: IPicture, 
  changeOpacity: (id: number, newOpacity: number) => void,
  changeMode: (id: number, newMode: ITypes) => void,
  isFirst: boolean,
  isLast: boolean,
  picUp: (id: number) => void,
  picDown: (id: number) => void,
  deletePic: (id: number) => void
}

const MenuItem = ({ 
  item, 
  changeOpacity, 
  changeMode, 
  isFirst, 
  isLast, 
  picDown, 
  picUp, 
  deletePic 
}: MenuItemProps) => {
  const [showWidget, setWidgetVisibility] = React.useState(false)

  return (
    <div className='flex flex-col items-center gap-2 px-2 py-4 even:bg-gray-600 relative'>
      { showWidget && <ImageController srcPicture={item} /> }
      <div className='flex flex-row items-center gap-2 justify-between'>
        <Image 
          src={URL.createObjectURL(item.imageFile)} 
          width={60} 
          height={60} 
          className='rounded aspect-square cursor-pointer' 
          onClick={() => setWidgetVisibility(prev => !prev)} 
          alt={''} 
        />
        <p className='font-bold overflow-x-hidden text-ellipsis'>{item.imageFile.name}</p>
      </div>
      <div className='flex flex-row w-full items-center gap-2 '>
        <input 
          type='range' 
          value={item.opacity} 
          step={0.01} 
          max={1} 
          min={0} 
          onChange={(e) => {
            const newValue = +e.target.value
            changeOpacity(item.id, newValue)
          }}
        />
        <select 
          onChange={
            (e) => {
              const newValue = e.target.value as ITypes
              changeMode(item.id, newValue)
            }
          }
          className='block w-full text-md bg-gray-700'
          value={item.type}
          disabled={isFirst}
        >
          <option value={Types.None}>None</option>
          <option value={Types.Sum}>Summa</option>
          <option value={Types.Div}>Subtraction</option>
          <option value={Types.Mul}>Multiplication</option>
          <option value={Types.Mean}>Mean value</option>
        </select>
      </div>
      <div className='flex flex-row w-full justify-end items-center gap-5 '>
        <button onClick={() => picUp(item.id)} className='block' style={{display: isFirst ? 'none' : undefined}}>/\</button>
        <button onClick={() => picDown(item.id)} className='block' style={{display: isLast ? 'none' : undefined}}>\/</button>
        <button onClick={() => deletePic(item.id)} className='block'>delete</button>
      </div>
    </div>
  )
}

interface CanvasComponentProps {
  setContext: (newCtx: CanvasRenderingContext2D) => void,
  height: number,
  width: number,
}

const MAX_HEIGHT = 720

const Canvas = ({ 
  setContext, 
  height, 
  width 
}: CanvasComponentProps) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)

  React.useEffect(() => {
    if (canvasRef.current) setContext(canvasRef.current.getContext('2d')!);
  }, [setContext])


  return (
    <div>
      <canvas ref={canvasRef} height={height} width={width}/>
    </div>
  )
}
