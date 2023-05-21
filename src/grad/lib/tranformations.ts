export interface Point {
  x: number,
  y: number
}

// уравнение прямой по двум точкам
const lineEq = (
  x: number, 
  A: Point, 
  B: Point
) => ( (x - A.x) * (B.y - A.y) + A.y * (B.x - A.x) ) / ( B.x - A.x )

// короче делаем из набора точек, которые можно двигать, мапу, где ключ - входное значение пикселя, а значение - выходное
// например для негатива получится что-то типа [255, 254, 253, 252...] 
// [255, 123, 243] -> [ map[255], map[123], map[243] ]
export const getPixelMapForHistorgamEq = (points: Point[]): number[] => {
  const res: number[] = []

  // я не припомню чтобы делал более непонятной хуеты чем здесь
  for (let i = 1; i < points.length; i++) {
    for (let j = points[i - 1].x; j < points[i].x; j++) {
      res.push(lineEq(j, points[i - 1], points[i])) 
    }
  }

  return res
}

const range = (start: number, stop: number, step: number) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step))
export const getInitialPoints = () => {
  return range(-1, 255, 32).map(i => ({x: Math.max(0, i), y: Math.max(0, i)}))
}

export const replacePoint = (newPoint: Point, points: Point[]): Point[] => {
  const res = [...points]
  
  const index = points.findIndex(point => newPoint.x === point.x)
  if (!~index) {
    return points
  }
  
  res[index] = newPoint

  return res
}
