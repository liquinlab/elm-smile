// gets random integer between min (inclusive) and max (inclusive)
export function randomInt(min, max) {
  return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1) + Math.ceil(min))
}

export function shuffle(array) {
  const arrayCopy = array.slice(0)
  for (let i = arrayCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = arrayCopy[i]
    arrayCopy[i] = arrayCopy[j]
    arrayCopy[j] = temp
  }
  return arrayCopy
}

export function sampleWithoutReplacement(array, sampleSize) {
  if (sampleSize > array.length) {
    console.error('sample size larger than array length')
  }
  return shuffle(array).slice(0, sampleSize)
}

export function sampleWithReplacement(array, sampleSize) {
  const sample = []
  let s = sampleSize
  while (s > 0) {
    sample.push(array[randomInt(0, array.length - 1)])
    s -= 1
  }
  return sample
}

export function expandProduct(...arr) {
  // get length of each sub array in arr
  const lengths = arr.map((x) => x.length)
  // get product of lengths
  const product = lengths.reduce((a, b) => a * b, 1)
  if (product > 1000) {
    console.warn("That's a whole lot of combinations! Are you sure you want to do that?")
  }
  return arr.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())))
}
