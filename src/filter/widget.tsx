import { getImageData } from '@/grad/lib/histogram';
import { ResizedCanvas } from '@/grad/ui/widget';
import { IPicture } from '@/lib'
import { useEffect, useMemo, useState } from 'react';

const linear = (imgData: ImageData) => {
  const width = imgData.width;
  const height = imgData.height;

  const matrix = [[0, -2, 0], [-2, 9, -2], [0, -2, 0]]

  //шаг от центрального пикселя
  const r_hor = 1;
  const r_ver = 1;

  //позиция крайних пикселей на изображении
  let limit_y = height - 1;
  let limit_x = width - 1;

  const res = new ImageData(imgData.width, imgData.height, { colorSpace: 'srgb' })

  for (let index = 0; index < imgData.data.length; index += 4) 
  {
    const pxNum = Math.floor(index / 4)
    const i = Math.floor(pxNum / width)
    const j = pxNum - i * width
    //задаем ограничения для взаимодействия с матрицей, чтоб центр матрицы совпал с теккущим положением пикселя
    const start_i1 = i - r_ver;
    const start_j1 = j - r_hor;
    const stop_i1 = i + r_ver;
    const stop_j1 = j + r_hor;

    let sum_r = 0, sum_g = 0, sum_b = 0;
    //проверка на крайние пиксели
    if (start_i1 < 0 || start_j1 < 0 || stop_i1 >= height || stop_j1 >= width)
    {
      //B(x, y) = Sum(F(i, j)*f(x + i, y + j))
      for (let i1 = start_i1, y = 0; i1 <= stop_i1; ++i1, ++y)
      {
        for (let j1 = start_j1, x = 0; j1 <= stop_j1; ++j1, ++x)
        {
          //если выходит за края, то зеркалим пиксели
          let pix_i = i1;
          if (i1 < 0) pix_i = i1 * -1;
          if (i1 >= height) pix_i = limit_y - (i1 - limit_y);

          let pix_j = j1;
          if (j1 < 0) pix_j = j1 * -1;
          if (j1 >= width) pix_j = limit_x - (j1 - limit_x);

          let pos_pixR = (pix_i * width + pix_j) * 4;
          sum_r += matrix[y][x] * imgData.data[pos_pixR];
          sum_g += matrix[y][x] * imgData.data[pos_pixR + 1];
          sum_b += matrix[y][x] * imgData.data[pos_pixR + 2];
        }
      }
    }
    else
    {
      //B(x, y) = Sum(F(i, j)*f(x + i, y + j))
      for (let i1 = start_i1, y = 0; i1 <= stop_i1; ++i1, ++y)
      {
        for (let j1 = start_j1, x = 0; j1 <= stop_j1; ++j1, ++x)
        {
          let pos_pixR = (i1 * width + j1) * 4;
          sum_r += matrix[y][x] * imgData.data[pos_pixR];
          sum_g += matrix[y][x] * imgData.data[pos_pixR + 1];
          sum_b += matrix[y][x] * imgData.data[pos_pixR + 2];
        }
      }
    }

    //сохраняем изменения
    res.data[index] = sum_r;
    res.data[index + 1] = sum_g;
    res.data[index + 2] = sum_b;
    res.data[index + 3] = imgData.data[index + 3];
  };
  return res
}

const qsparts = (arr: number[], low: number, high: number) => {
  let pivot = arr[high], pivotloc = low;
  let temp;
  for (let i = low; i <= high; i++)
  {
      // вставляем элементы с меньшим значением слева от точки поворота
      if (arr[i] < pivot)
      {
          temp = arr[i];
          arr[i] = arr[pivotloc];
          arr[pivotloc] = temp;
          pivotloc++;
      }
  }

  // изменение точки поворота
  temp = arr[high];
  arr[high] = arr[pivotloc];
  arr[pivotloc] = temp;

  return pivotloc;
}

const qssmallest = (arr: number[], low: number, high: number, k: number): number => {
  // находим разделение
  const partition = qsparts(arr, low, high);

  // если значение раздела равно k-й позиции, возвращаем значение в k.
  if (partition == k) return arr[partition];

  // если значение раздела меньше k-й позиции, ещем в правой части массива.
  else if (partition < k) return qssmallest(arr, partition + 1, high, k);

  // если значение раздела больше k-й позиции, ищем в левой части массива.
  else return qssmallest(arr, low, partition - 1, k);
}

const median = (imgData: ImageData) => {
  const width = imgData.width;
  const height = imgData.height;
  const res = new ImageData(width, height)

  //шаг от центрального пикселя
  const r_hor = 1;
  const r_ver = 1;

  //позиция крайних пикселей на изображении
  const limit_y = height - 1;
  const limit_x = width - 1;

  //размер матрицы
  const matrixLenght = 9;
  //позиция элемента по середине матрицы
  const matrix_posk = Math.floor(matrixLenght / 2);
  //позиция последнего элемента
  const matrix_poslast = matrixLenght - 1;

  for(let index = 0; index < imgData.data.length; index += 4) {
    const pxNum = Math.floor(index / 4)
    const i = Math.floor(pxNum / width)
    const j = pxNum - i * width

    const start_i1 = i - r_ver;
    const start_j1 = j - r_hor;
    const stop_i1 = i + r_ver;
    const stop_j1 = j + r_hor;

    const matrix_r = new Array(matrixLenght);
    const matrix_g = new Array(matrixLenght);
    const matrix_b = new Array(matrixLenght);
    let x = 0;

    //проверка на крайниые пиксели
    if (start_i1 < 0 || start_j1 < 0 || stop_i1 >= height || stop_j1 >= width)
    {
        for (let i1 = start_i1; i1 <= stop_i1; ++i1)
        {
            for (let j1 = start_j1; j1 <= stop_j1; ++j1)
            {
                //если выходит за края, то зеркалим пиксели
                let pix_i = i1;
                if (i1 < 0) pix_i = i1 * -1;
                if (i1 >= height) pix_i = limit_y - (i1 - limit_y);

                let pix_j = j1;
                if (j1 < 0) pix_j = j1 * -1;
                if (j1 >= width) pix_j = limit_x - (j1 - limit_x);
                let pos_pixR = (pix_i * width + pix_j) * 4;
                matrix_r[x] = imgData.data[pos_pixR];
                matrix_g[x] = imgData.data[pos_pixR + 1];
                matrix_b[x] = imgData.data[pos_pixR + 2];
                ++x;
            }
        }
    }
    else
    {
        for (let i1 = start_i1; i1 <= stop_i1; ++i1)
        {
            for (let j1 = start_j1; j1 <= stop_j1; ++j1)
            {
              let pos_pixR = (i1 * width + j1) * 4;
              matrix_r[x] = imgData.data[pos_pixR];
              matrix_g[x] = imgData.data[pos_pixR + 1];
              matrix_b[x] = imgData.data[pos_pixR + 2];
                ++x;
            }
        }
    }

    res.data[index] = qssmallest(matrix_r, 0, matrix_poslast, matrix_posk);
    res.data[index + 1] = qssmallest(matrix_g, 0, matrix_poslast, matrix_posk);
    res.data[index + 2] = qssmallest(matrix_b, 0, matrix_poslast, matrix_posk);
    res.data[index + 3] = imgData.data[index + 3]
  };

  return res
}

const enum Filters {
  Default = '_',
  Linear = 'linear',
  Median = 'median'
}

const filterSwitcher = (filter: Filters, imgData: ImageData): ImageData => {
  switch(filter) {
    case Filters.Linear:
      return linear(imgData)
    case Filters.Median:
      return median(imgData)
    default:
      return imgData
  }
}

export const FilterWidget = ({srcPicture}: {srcPicture: IPicture}) => {
  const imgData = useMemo(() => getImageData(srcPicture.bitmap), [srcPicture.bitmap]);
  const [filter, setFilter] = useState<Filters>(Filters.Default)
  const [filterResult, setResult] = useState<ImageData>(filterSwitcher(filter, imgData))

  useEffect(() => {
    setResult(filterSwitcher(filter, imgData))
  }, [filter, imgData])

  const onChange = (newValue: Filters) => {
    setFilter(newValue)
  }

  return (
    <>
      <p className='font-bold'>Filter Image</p>
      <div className='flex justify-center items-center'>
        <select 
          onChange={(e) => onChange(e.target.value as Filters)} 
          className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
        >
          <option defaultChecked value={Filters.Default}>Choose Filter</option>
          <option value={Filters.Linear}>Linear</option>
          <option value={Filters.Median}>Median</option>
        </select>
      </div>
      <div className='flex flex-row justify-between'>
        <ResizedCanvas 
          imageData={imgData} 
          title={<p className='text-center font-thin'>Source</p>} 
          maxWidth={240} 
          maxHeight={360} 
        />
        <ResizedCanvas 
          imageData={filterResult} 
          title={<p className='text-center font-thin'>Current</p>} 
          maxWidth={240} 
          maxHeight={360} 
        />
      </div>
    </>
  )
}