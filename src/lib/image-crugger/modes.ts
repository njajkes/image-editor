import { 
  difference, 
  ImagesFilter, 
  just, 
  mean, 
  multiply, 
  noopImageData, 
  summa 
} from './filters'

export const Types = {
  None: 'none',
  Sum: 'sum',
  Div: 'div',
  Mul: 'mul',
  Mean: 'mean'
} as const;

export type ITypes = typeof Types[keyof typeof Types];

export const modeSwitcher = (mode: ITypes): ImagesFilter => {
  switch(mode) {
    case 'sum':
      return summa
    case 'div':
      return difference
    case 'mul':
      return multiply
    case 'mean':
      return mean
    case 'none':
      return just
    default:
      return noopImageData
  }
}
