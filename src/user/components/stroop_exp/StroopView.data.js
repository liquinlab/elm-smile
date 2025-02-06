import fs from 'node:fs/promises'
import path from 'node:path'

//print the current directory
console.log(__dirname)

//const filenames = await fs.readdir(__dirname, { recursive: true });
const filenames = await fs.readdir('src/user/assets/image-test', { recursive: false })

console.log(`----------------------------------------------------`)
console.log(`---- Set to preloading files for ${__filename} ----`)
console.log(filenames)
console.log(`----------------------------------------------------`)
//const obj = ['something.png', 'something2.png', 'something3.png', 'something4.png']

export const preload = filenames
