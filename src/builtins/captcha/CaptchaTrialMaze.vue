<script setup>
const emit = defineEmits(['nextPageCaptcha'])
import { ref, reactive, onMounted } from 'vue'
const props = defineProps({
  timed_task: Boolean,
})
import useAPI from '@/core/composables/useAPI'
const api = useAPI()
import { animate } from 'motion'
// use SVG
import { SVG } from '@svgdotjs/svg.js'

// do you need keyboard or mouse for your experiment?
// import { onKeyDown } from '@vueuse/core'
// import { useMouse } from '@vueuse/core'

// import and initalize smile API
// import useAPI from '@/core/composables/useAPI'
// const api = useAPI()
// set timed_task using props
const timed_task = props.timed_task
let MAX_TIME = 15000
let start_time
let timeout = ref(0)

const svgCanvas = ref(null)

// const { x, y } = useMouse({ touch: false })
const svg = reactive({
  draw: null,
  circle: null,
  path: null,
  pathString: '',
  isDragging: false,
  bound: null,
  circleX: 0,
  circleY: 0,
  radius: 9,
  strokewidth: 2,
})
// Reactive variables
//const finished = ref(false)
const touched_black = ref(false)
const grey = '#7f7f7f'
const red = '#ff0000'
const bordercolor = ref(grey)
const rows = ref(15)
const cols = ref(15)
const grid = ref([])
const rectHeight = 500 / rows.value
const rectWidth = 500 / rows.value
const startGrid = 0
const flagLocation = reactive({ row: 11, col: 24 }) // Example location

const handleMouseMove = (event) => {
  const newX = event.clientX - svg.bound.left //- svg.clientLeft //- paddingLeft
  const newY = event.clientY - svg.bound.top //- svg.clientTop // - paddingTop
  if (svg.isDragging) {
    //svg.circle.move(event.offsetX, event.offsetY)

    // let paddingLeft = parseFloat(style['padding-left'].replace('px', ''))
    // let paddingTop = parseFloat(style['padding-top'].replace('px', ''))

    // const newX = event.clientX - svg.bound.left //- svg.clientLeft //- paddingLeft
    // const newY = event.clientY - svg.bound.top //- svg.clientTop // - paddingTop
    const newXreal = newX //- 10 //+ (newX - svg.circleX) //.width()
    const newYreal = newY //- 10 //+ (newY - svg.circleY) //.height()

    svg.circle.move(newXreal - svg.radius, newYreal - svg.radius)

    svg.pathString += ` L ${newXreal} ${newYreal}`
    //api.log.debug(flagLocation)
    // if newXreal and newYreal are withing the flag location
    api.log.debug(`${newXreal}, ${newYreal}, ${flagLocation.row * rectWidth}, ${flagLocation.col * rectHeight}`)
    if (
      newXreal > flagLocation.col * rectWidth &&
      newXreal < (flagLocation.col + 1) * rectWidth &&
      newYreal > flagLocation.row * rectHeight &&
      newYreal < (flagLocation.row + 1) * rectHeight
    ) {
      finished_task()
      //emit('nextPageCaptcha')
    }

    api.log.debug(`in cell  ${Math.floor(newXreal / rectWidth)}, ${Math.floor(newYreal / rectHeight)}`)
    //api.log.debug('color', )
    if (grid.value[Math.floor(newYreal / rectHeight)][Math.floor(newXreal / rectWidth)] == 'black') {
      touched_black.value = true
      bordercolor.value = red
    }

    //svg.pathString += ` L ${newX - svg.circle.width() / 2} ${newY - svg.circle.height() / 2}`
  }
}
onMounted(() => {
  generateGrid()
  svg.draw = SVG(svgCanvas)
  svg.circle = svg.draw.findOne('circle')
  svg.path = svg.draw.findOne('#path')
  svg.bound = svgCanvas.value.getBoundingClientRect() // get size of the canvas
  svg.circleY = svg.bound.width / 2 // start in the middle
  svg.circleX = 0 + svg.radius + svg.strokewidth / 2 // start at the left edge
  svg.pathString += `M ${svg.circleX} ${svg.circleY}` // move to the cirlce
  svg.draw.on('mousemove', handleMouseMove)
  start_time = Date.now()
  timeout.value = ((MAX_TIME - (Date.now(0) - start_time)) / MAX_TIME) * 100
  api.log.debug(`${timeout}`)

  // Add pulsing animation to the circle
  const circle = document.querySelector('#circle')
  animate(
    circle,
    { r: [svg.radius, svg.radius + 2, svg.radius] },
    {
      duration: 1.2,
      easing: 'ease-in-out',
      repeat: Infinity,
    }
  )

  if (timed_task) {
    var myInterval = setInterval(() => {
      timeout.value = ((MAX_TIME - (Date.now(0) - start_time)) / MAX_TIME) * 100
      if (timeout.value <= 0) {
        clearInterval(myInterval)
        emit('nextPageCaptcha')
      }
    }, 2)
  }
})

function finished_task() {
  //finished.value = true
  emit('nextPageCaptcha')
}
// Function to generate the grid
function generateGrid() {
  grid.value = Array.from({ length: rows.value }, () => Array.from({ length: cols.value }, () => '#60d3af'))
  let y = 7 //Math.floor(Math.random() * rows.value) // Random starting row
  let path = [[0, y]]

  // Continue building the path until the rightmost column is reached
  // choose a random integer between 2 and rows.value - 1
  let stop = Math.max(4, Math.floor(Math.random() * (rows.value - 2)))
  while (path[path.length - 1][0] < stop) {
    let x = path[path.length - 1][0]
    let y = path[path.length - 1][1]
    let possibleMoves = []

    // Move right if possible
    if (x + 1 < rows.value) {
      possibleMoves.push([x + 1, y])
    }

    // Move up if possible, avoiding revisits
    if (y - 1 >= 0 && !path.some((p) => p[0] === x && p[1] === y - 1)) {
      possibleMoves.push([x, y - 1])
    }

    // Move down if possible, avoiding revisits
    if (y + 1 < rows.value && !path.some((p) => p[0] === x && p[1] === y + 1)) {
      possibleMoves.push([x, y + 1])
    }

    // Choose the next move randomly from the possible moves
    if (possibleMoves.length > 0) {
      let nextMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)]
      path.push(nextMove)
    } else {
      // No possible move (which is rare), start over
      return generateRandomPath(rows.value)
    }
  }

  // Mark the path in the grid
  path.forEach((p) => {
    grid.value[p[1]][p[0]] = 'white'
  })

  let lastcell = path[path.length - 1]
  grid.value[lastcell[1]][lastcell[0]] = 'red'
  flagLocation.row = lastcell[1]
  flagLocation.col = lastcell[0]
}

// Function to generate a random color
function getRandomColor() {
  if (Math.random() < 0.25) {
    return 'black'
  } else {
    return 'white'
  }
}

const startDragging = () => {
  // api.log.debug('start dragging')
  svg.isDragging = true
}
const stopDragging = () => {
  //api.log.debug('stop dragging')
  svg.isDragging = false
}

const flag_touch = () => {
  if (svg.isDragging) {
    api.log.debug('flag touched')
  } else {
    api.log.debug('nice try')
  }
}

function getCellColor(color) {
  if (color == 'white') {
    return 'src/assets/captcha/maze/road.png'
  } else {
    return 'src/assets/captcha/maze/emptygrass.png'
  }
}

/*

*/

// <button class="button is-success" id="finish" @click="$emit('nextPageCaptcha')">Done</button>
</script>

<template>
  <div class="prevent-select">
    <h1 class="title pb-0 mb-0">Don't walk on the grass!</h1>
    <p class="is-size-5 has-text-center pb-4">
      ...while dragging the pink dot to the flag <img id="flag" src="/src/assets/captcha/maze/flag.svg" width="30" />
    </p>
    <svg class="maze" ref="svgCanvas" width="500px" height="500px" @mouseup="stopDragging" @mouseleave="stopDragging">
      <rect width="500" height="500" fill="#60d3af" />
      <g v-for="(row, rowIndex) in grid" :key="rowIndex">
        <g v-for="(color, colIndex) in row" :key="colIndex">
          <!-- Conditionally render flag image at specified location -->
          <rect
            v-if="rowIndex === flagLocation.row && colIndex === flagLocation.col"
            :x="colIndex * rectWidth + startGrid"
            :y="rowIndex * rectHeight"
            :width="rectWidth"
            :height="rectHeight"
            fill="white"
          />
          <image
            v-if="rowIndex === flagLocation.row && colIndex === flagLocation.col"
            :x="colIndex * rectWidth"
            :y="rowIndex * rectHeight"
            :width="rectWidth"
            :height="rectHeight"
            xlink:href="/src/assets/captcha/maze/road.png"
            stroke="black"
          />

          <image
            v-else
            :x="colIndex * rectWidth + startGrid"
            :y="rowIndex * rectHeight"
            :width="rectWidth"
            :height="rectHeight"
            :xlink:href="getCellColor(color)"
          />
        </g>
      </g>
      <path id="mazewall" d="" />
      <path id="trace" ref="path" stroke="pink" stroke-width="3" :d="svg.pathString" fill="none" />
      <image
        id="flagg"
        :x="flagLocation.col * rectWidth"
        :y="flagLocation.row * rectHeight"
        :width="rectWidth"
        :height="rectHeight"
        xlink:href="/src/assets/captcha/maze/flag.svg"
        transform-origin="center center"
        style="transform-box: fill-box; transform-origin: center"
      />
      <circle
        id="circle"
        ref="circle"
        :cx="svg.circleX + 6"
        :cy="svg.circleY - 2"
        :r="svg.radius"
        :stroke-width="svg.strokewidth"
        stroke="#ED6B83"
        fill="#F2BBBB"
        @mousedown="startDragging"
      />
    </svg>
    <div v-if="timed_task" class="timer">
      <br />
      <br />
      Respond quickly: <progress class="progress is-large" :value="timeout" max="100"></progress>
    </div>
  </div>
</template>

<style scoped>
.timer {
  width: 60%;
  margin: auto;
}
.black {
  background-color: #79f2cc;
}
.feedback {
  width: 800px;
  height: 800px;
  background-color: black;
  color: white;
  font-size: 50px;
}
.instructions p {
  padding-bottom: 20px;
}

svg {
  border: 1px solid v-bind(bordercolor);
  background-color: '#60d3af';
  background: '#60d3af';
  fill: '#60d3af';
  margin: auto;
}
</style>
