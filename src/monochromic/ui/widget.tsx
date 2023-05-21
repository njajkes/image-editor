import { IPicture } from '@/lib'
import React from 'react'
import { useMonochomicReducer } from '../lib/state'
import { ResizedCanvas } from '@/grad/ui/widget'
import { getImageData } from '@/grad/lib/histogram'

export const MonochromicWidget = ({ srcPicture }: {srcPicture: IPicture}) => {
  const [state, dispatch] = useMonochomicReducer(srcPicture)

  const Mean = React.useCallback(
    () => dispatch({
      type: 'MEAN', payload: undefined
    }), [dispatch]
  )

  const Otsu = React.useCallback(
    () => dispatch({
      type: 'OTSU_METHOD', payload: undefined
    }), [dispatch]
  )

  const Niblack = React.useCallback(
    () => dispatch({
      type: 'NIBLACK_METHOD', payload: undefined
    }), [dispatch]
  )

  const Sauvola = React.useCallback(
    () => dispatch({
      type: 'SAUVOLA_METHOD', payload: undefined
    }), [dispatch]
  )

  const Volf = React.useCallback(
    () => dispatch({
      type: 'VOLF_METHOD', payload: undefined
    }), [dispatch]
  )

  const Bradley = React.useCallback(
    () => dispatch({
      type: 'BRADLEY_METHOD', payload: undefined
    }), [dispatch]
  )


  return (
    <>
      <p className='font-bold'>Monochromic actions</p>
      <div className='flex flex-row justify-between'>
        <ResizedCanvas 
          imageData={state.sourcePicture.imageData || getImageData(state.sourcePicture.bitmap)} 
          title={<p className='text-center font-thin'>Source</p>} 
          maxWidth={240} 
          maxHeight={360} 
        />
        <ResizedCanvas 
          imageData={state.currentPicture.imageData || getImageData(state.currentPicture.bitmap)} 
          title={<p className='text-center font-thin'>Current</p>} 
          maxWidth={240} 
          maxHeight={360} 
        />
      </div>
      <div className='flex flex-wrap gap-2 justify-center items-center'>
        <button onClick={Mean}>
          Gavrilov
        </button>
        <button onClick={Otsu}>
          Otsu
        </button>
        <button onClick={Niblack}>
          Niblack
        </button>
        <button onClick={Sauvola}>
          Sauvola
        </button>
        <button onClick={Volf}>
          Volf
        </button>
        <button onClick={Bradley}>
          Bradley
        </button>
      </div>
    </>
  )
}
