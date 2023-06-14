import { IPicture } from '@/lib'
import React, { useEffect, useState } from 'react'
import { ResizedCanvas } from '@/grad/ui/widget'
import { getImageData } from '@/grad/lib/histogram'
import { add, multiply, divide, Complex, complex as ComplexCreator } from 'mathjs'

const DFT = (input_array: Complex[], reverse: boolean = false) => {
  const count = input_array.length;
  const output_array: Complex[] = [];
  output_array.length = count;
  for (let u = 0; u < count; u++){
    const arg = -2.0 * Math.PI * u / count;
    for (let k = 0; k < count; k++) {
      const cmpl = ComplexCreator(Math.cos(arg * k), Math.sin(arg * k))
      output_array[u] = add(
        output_array[u] ?? 0, 
        multiply(
          cmpl, 
          input_array[k]
        )
      ) as Complex;
    }
    if (!reverse) {
      output_array[u] = divide(output_array[u], count) as Complex;
    }
  }
  return output_array;
}

const getFourierArray = (imgData: ImageData) => {
  let complex: Complex[] = [];
  complex.length = imgData.width * imgData.height * 3
  for (let i = 0; i < imgData.width; i++) {
      for (let j = 0; j < imgData.height; j++)
      {
          complex[(i * imgData.width + j) * 3] = ComplexCreator(
            imgData.data[(i * imgData.height + j) * 4] * Math.pow(-1, i + j), 0
          ); // R
          complex[(i * imgData.width + j) * 3 + 1] = ComplexCreator(
            imgData.data[(i * imgData.height + j) * 4 + 1] * Math.pow(-1, i + j), 0
          ); // G
          complex[(i * imgData.width + j) * 3 + 2] = ComplexCreator(
            imgData.data[(i * imgData.height + j) * 4 + 2] * Math.pow(-1, i + j), 0
          ); // B
      };
  };
  
  //преобразование по строкам
  for (let i = 0; i < imgData.width; i++) {
      let tmp: Complex[] = [];
      tmp.length = imgData.height * 3
      for (let j = 0; j < imgData.height; j++) {
        tmp[j * 3] = complex[(i * imgData.height + j) * 3]
        tmp[j * 3 + 1] = complex[(i * imgData.height + j) * 3 + 1]
        tmp[j * 3 + 2] = complex[(i * imgData.height + j) * 3 + 2]
      }
      tmp = DFT(tmp)
      for (let j = 0; j < imgData.height; j++) {
        complex[(i * imgData.height + j) * 3] = tmp[j * 3]
        complex[(i * imgData.height + j) * 3 + 1] = tmp[j * 3 + 1]
        complex[(i * imgData.height + j) * 3 + 2] = tmp[j * 3 + 2]
      }
  };

  for (let j = 0; j < imgData.height; j++) {
    let tmp: Complex[] = []
    tmp.length = imgData.width * 3
    for (let i = 0; i < imgData.width; i++) {
      const idx = (i * imgData.height + j) * 3
      tmp[i * 3] = complex[idx];
      tmp[i * 3 + 1] = complex[idx + 1];
      tmp[i * 3 + 2] = complex[idx + 2];
    }
    tmp = DFT(tmp)
    for (let i = 0; i < imgData.width; i++) {
      const idx = (i * imgData.height + j) * 3
      complex[idx] = tmp[i * 3];
      complex[idx + 1] = tmp[i * 3 + 1];
      complex[idx + 2] = tmp[i * 3 + 2];
    }
  };
  return complex
}

const getFourierImage = (fourier: Complex[], width: number, height: number) => {
  const toPixel = (el: Complex) => Math.log(Math.sqrt(el.im * el.im + el.re * el.re) + 1)
  
  const maxR = Math.max(...fourier.filter((_, idx) => (idx % 3) === 0).map(toPixel))
  const maxG = Math.max(...fourier.filter((_, idx) => (idx % 3) === 1).map(toPixel))
  const maxB = Math.max(...fourier.filter((_, idx) => (idx % 3) === 2).map(toPixel))
  const max = [maxR, maxG, maxB]
  
  const pixels = fourier.map((el, idx) => Math.max(Math.min(toPixel(el) * 255 / max[idx % 3], 255), 0))
  
  const fourierImg = new ImageData(width, height, { colorSpace: 'srgb' })
  for (let i = 0; i < fourierImg.height * fourierImg.width; i++) {
    fourierImg.data[i * 4] = pixels[i * 3]
    fourierImg.data[i * 4 + 1] = pixels[i * 3 + 1]
    fourierImg.data[i * 4 + 2] = pixels[i * 3 + 2]
    fourierImg.data[i * 4 + 3] = 255
  }
  
  return fourierImg
}

export const FurryWidget = ({ srcPicture }: {srcPicture: IPicture}) => {
  const newPic = structuredClone(srcPicture)
  const imgData = getImageData(newPic.bitmap)
  const [fourier, setFourie] = useState<null | Complex[]>(null)
  const [fourierData, setFourieData] = useState<null | ImageData>(null)
  useEffect(() => {
    setTimeout(() => {
      setFourie(getFourierArray(imgData))
    }, 0)
  }, [])
  useEffect(() => {
    if (!fourier) return
    const img = getFourierImage(fourier, imgData.width, imgData.height)
    setFourieData(img)
  }, [fourier, imgData.height, imgData.width]) 

  return (
    <>
      <p className='font-bold'>Fourier Image</p>
      <div className='flex flex-row justify-between'>
        <ResizedCanvas 
          imageData={imgData} 
          title={<p className='text-center font-thin'>Source</p>} 
          maxWidth={240} 
          maxHeight={360} 
        />
        {
          fourierData
          ? <ResizedCanvas 
              imageData={fourierData} 
              title={<p className='text-center font-thin'>Current</p>} 
              maxWidth={240} 
              maxHeight={360} 
            />
          : <>w8...</>
        }
      </div>
    </>
  )
}
