export class Pixel {
  public r: number
  public g: number
  public b: number
  public alpha: number

  constructor(
    r: number,
    g: number,
    b: number,
    alpha: number
  ) {
    this.r = Math.max(Math.min(r, 255), 0)
    this.b = Math.max(Math.min(b, 255), 0)
    this.g = Math.max(Math.min(g, 255), 0)
    this.alpha = Math.max(Math.min(alpha, 255), 0)
  }

  public toRest() {
    return [this.r, this.g, this.b, this.alpha]
  }

  public map(f: (n: number) => number) {
    this.r = f(this.r)
    this.g = f(this.g)
    this.b = f(this.b)

    return this
  }


  public static just(a: Pixel, b: Pixel) {
    return new Pixel(
      a.r * (255 - b.alpha) / 255 + b.r * b.alpha / 255,
      a.g * (255 - b.alpha) / 255 + b.g * b.alpha / 255,
      a.b * (255 - b.alpha) / 255 + b.b * b.alpha / 255,
      255
    )
  }

  public static sum(a: Pixel, b: Pixel) {
    return new Pixel(
      a.r + b.r,
      a.g + b.g,
      a.b + b.b,
      a.alpha
    )
  }

  public static div(a: Pixel, b: Pixel) {
    return new Pixel(
      a.r - b.r,
      a.g - b.g,
      a.b - b.b,
      a.alpha
    )
  }

  public static mul(a: Pixel, b: Pixel) {
    return new Pixel(
      a.r * b.r / 255,
      a.g * b.g / 255,
      a.b * b.b / 255,
      a.alpha
    )
  }
  
  public static mean(a: Pixel, b: Pixel) {
    return new Pixel(
      (a.r + b.r) / 2,
      (a.g + b.g) / 2,
      (a.b + b.b) / 2,
      a.alpha
    )
  }

  public toWhiteBlack() {
    const avg = (this.r + this.g + this.b) / 3
    return new Pixel(
      avg,
      avg,
      avg, 
      this.alpha
    )
  }
}
