<script setup>
import * as d3 from 'd3'
import * as dagre from '@dagrejs/dagre'
import { ref, onMounted, computed } from 'vue'
import timeline from '@/design'
import useAPI from '@/core/composables/useAPI'
const api = useAPI()

const props = defineProps(['currentRoute', 'hoverRoute'])
defineEmits(['hoveredOn', 'clickedOn'])
console.log('received', props)
// Create the input graph
// var g = new dagre.graphlib.Graph().setGraph({ nodesep: 80, ranksep: 40 }).setDefaultEdgeLabel(function () {
//   return {}
// }) // Default to assigning a new object as a label for each new edge.
var g = timeline.g

// var g_nonseq = new dagre.graphlib.Graph().setGraph({ nodesep: 80, ranksep: 40 }).setDefaultEdgeLabel(function () {
//   return {}
// }) // Default to assigning a new object as a label for each new edge.

var g_nonseq = timeline.g_nonseq

// Here we're setting nodeclass, which is used by our custom drawNodes function
// below.
//g_nonseq.setNode('recruit', { name: 'recruit', label: 'RecruitmentChooser.vue', class: 'node', shape: 'circle' })
// g.setNode('welcome_anonymous', {
//   name: 'welcome_anonymous',
//   label: 'Advertisement.vue',
//   class: 'node',
//   shape: 'circle',
// })
// g.setNode('welcome_referred', {
//   name: 'welcome_referred',
//   label: 'Advertisement.vue',
//   class: 'node',
//   shape: 'circle',
// })
// g.setNode('consent', { name: 'consent', label: 'ConsentPage.vue', class: 'node', shape: 'circle' })
// g.setNode('demograph', { name: 'demograph', label: 'DemographicSurvey.vue', class: 'node', shape: 'circle' })
// g.setNode('windowsizer', { name: 'windowsizer', label: 'WindowSizer.vue', class: 'node', shape: 'circle' })
// g.setNode('captcha', { name: 'captcha', label: 'Captcha.vue', class: 'node', shape: 'circle' })
// g.setNode('instructions', { name: 'instructions', label: 'Instructions.vue', class: 'node', shape: 'circle' })
// g.setNode('exp', { name: 'exp', label: 'ExpPage.vue', class: 'node', shape: 'circle' })
// g.setNode('task1', { name: 'task1', label: 'Task1.vue', class: 'node', shape: 'circle' })
// g.setNode('task2', { name: 'task2', label: 'Task2.vue', class: 'node', shape: 'circle' })
// g.setNode('stroop', { name: 'stroop', label: 'Stroop.vue', class: 'node', shape: 'circle' })
// g.setNode('debrief', { name: 'debrief', label: 'Debrief.vue', class: 'node', shape: 'circle' })
// g.setNode('thanks', { name: 'thanks', label: 'Thanks.vue', class: 'node', shape: 'circle' })

// nonseq routes
// g_nonseq.setNode('withdraw', { name: 'withdraw', label: 'Withdraw.vue', class: 'nonseq', shape: 'circle' })
// g_nonseq.setNode('mturk', { name: 'mturk', label: 'MTurk.vue', class: 'nonseq', shape: 'circle' })
//g_nonseq.setNode('data', { name: 'data', label: 'DataPage', class: 'nonseq', shape: 'circle' })
// Set up edges, no special attributes.
// g.setEdge('welcome_anonymous', 'consent')
// g.setEdge('welcome_referred', 'consent')
// g.setEdge('consent', 'demograph')
// g.setEdge('demograph', 'windowsizer')
// g.setEdge('windowsizer', 'captcha')
// g.setEdge('captcha', 'instructions')
// g.setEdge('instructions', 'exp')
// g.setEdge('exp', 'task1')
// g.setEdge('exp', 'task2')
// g.setEdge('task1', 'stroop')
// g.setEdge('task2', 'stroop')
// g.setEdge('stroop', 'debrief')
// g.setEdge('debrief', 'thanks')

dagre.layout(g)
dagre.layout(g_nonseq)

// post fix
var nonseq = 0
g_nonseq.nodes().forEach(function (v) {
  var node = g_nonseq.node(v)
  node.x = 180
  node.y = 20 + nonseq * 30
  nonseq += 1
})

const nonseq_nodes = []
g_nonseq.nodes().forEach(function (v) {
  var node = g_nonseq.node(v)
  nonseq_nodes.push(node)
})

const seq_nodes = []
let max_d = 0 // NEED TO UPDATE THIS
g.nodes().forEach(function (v) {
  var node = g.node(v)
  seq_nodes.push(node)
})
var nudge_x = 160
var nudge_y = 15
function translate(x, y) {
  return 'translate(' + x + ',' + y + ')'
}

function bold(name, cr) {
  if (name == cr) {
    return 'font-weight: 600'
  } else {
    return 'font-weight: 400'
  }
}

function hover(name, hr) {
  console.log(name, hr)
  if (name == hr) {
    return 14
  } else {
    return 10
  }
}

function xlabel_pos(x, str) {
  if (x < 200) {
    return -str.length * 5 - 24
  } else {
    return 14
  }
}
const nonseq_height = nonseq_nodes.length * 35

g.edges().forEach((e) => {
  console.log('edge', g.edge(e).points[1])
})

const inflatedCircle = 12
const mainCircle = 10

//
</script>

<template>
  <div class="nonsequential">
    <div class="nonseqtitle">Non-sequential Routes</div>
    <svg id="nonseqgraph" width="400" :height="nonseq_height">
      <g id="edges"></g>
      <g id="nodes">
        <g v-for="n in nonseq_nodes" :transform="translate(n.x, n.y)">
          <circle
            :r="n.name == props.hoverRoute ? inflatedCircle : mainCircle"
            style="stroke: #ccba82; stroke-width: 1.5px; fill: #ffe8a3"
            :style="n.name == props.hoverRoute ? 'fill: #ccba82' : 'fill: #ffe8a3'"
            @mouseover="$emit('hoveredOn', n.name)"
            @mouseout="$emit('hoveredOn', '')"
            @click="$emit('clickedOn', n.name)"
          ></circle>
          <circle
            r="6"
            style="stroke: #000; stroke-width: 1.5px; fill: #ccba82; visibility: visible"
            v-if="n.name == currentRoute"
          ></circle>
          <text
            :x="14"
            y="4"
            style="fill: #000; font-size: 11px; font-family: Helvetica"
            :style="bold(n.name, currentRoute)"
          >
            {{ n.label }}
          </text>
        </g>
      </g>
      <g id="notes">
        <text x="10" y="35" width="50px" style="font-weight: 400; font-family: Helvetica; font-size: 13px">
          accessed in any order.
        </text>
        <text x="10" y="20" width="50px" style="font-weight: 400; font-family: Helvetica; font-size: 13px">
          These routes can be
        </text>
      </g>
    </svg>
  </div>
  <div class="sequential">
    <div class="seqtitle">Sequential Routes</div>
    <svg id="seqgraph" width="400" height="450">
      <g id="edges">
        <g v-for="e in g.edges()" :key="e.v + '-' + e.w">
          <path
            :d="`M ${g.node(e.v).x + nudge_x},${g.node(e.v).y + nudge_y} L ${g.edge(e).points[1].x + nudge_x} ${
              g.edge(e).points[1].y + nudge_y
            } L ${g.node(e.w).x + nudge_x},${g.node(e.w).y + nudge_y}`"
            style="stroke: #1a3f; stroke-width: 1.5px; fill: none"
          ></path>
          <path
            :d="`M ${g.node(e.w).x + nudge_x},${g.node(e.w).y + nudge_y - 10} L ${g.node(e.w).x - 6 + nudge_x},${
              g.node(e.w).y + nudge_y - 15
            }`"
            style="stroke: #1a3f; stroke-width: 1.5px; fill: none"
          ></path>
          <path
            :d="`M ${g.node(e.w).x + nudge_x},${g.node(e.w).y + nudge_y - 10} L ${g.node(e.w).x + 6 + nudge_x},${
              g.node(e.w).y + nudge_y - 15
            }`"
            style="stroke: #1a3f; stroke-width: 1.5px; fill: none"
          ></path>
        </g>
      </g>
      <g id="nodes">
        <g v-for="n in seq_nodes" :transform="translate(n.x + nudge_x, n.y + nudge_y)">
          <circle
            :r="n.name == props.hoverRoute ? inflatedCircle : mainCircle"
            style="stroke: #8cc39e; stroke-width: 1.5px; fill: #aff4c6"
            :style="n.name == props.hoverRoute ? 'fill: #8cc39e' : 'fill: #aff4c6'"
            @mouseover="$emit('hoveredOn', n.name)"
            @mouseout="$emit('hoveredOn', '')"
            @click="$emit('clickedOn', n.name)"
          ></circle>
          <circle
            r="6"
            style="stroke: #000; stroke-width: 1.5px; fill: #8cc39e; visibility: visible"
            v-if="n.name == currentRoute"
          ></circle>
          <text
            :x="xlabel_pos(n.x + nudge_x, n.label)"
            y="4"
            style="fill: #000; font-size: 11px; font-family: Helvetica"
            :style="bold(n.name, currentRoute)"
          >
            {{ n.label }}
          </text>
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.nonseqtitle {
  background-color: #ffe8a3;
  border: 1px solid #d9c58b;
  padding: 2px;
  margin-left: 10px;
  border-radius: 5px;
  margin: 5px;
  width: auto;
  float: left;
  font-size: 0.8em;
  font-weight: 600;
}

.nonsequential {
  background-color: #fffcf1;
  border: 1px solid #d9c58b;
  border-radius: 10px;
  margin-bottom: 20px;
  margin-top: 5px;
  height: 100px;
}

.seqtitle {
  background-color: #aff4c6;
  border: 1px solid #95d0a8;
  padding: 2px;
  margin-left: 10px;
  border-radius: 5px;
  margin: 5px;
  width: auto;
  float: left;
  font-size: 0.8em;
  font-weight: 500;
}

.sequential {
  background-color: #f3fdf6;
  border: 1px solid #aff4c6;
  border-radius: 10px;
  height: 550px;
}

.title {
  padding-top: 8px;
  padding-left: 10px;
  padding-bottom: 0px;
  margin-bottom: 10px;
}

/* This sets the color for "TK" nodes to a light blue green. */
g.type-TK > rect {
  fill: #00ffd0;
}

text {
  font-weight: 300;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
}

.label {
  font-weight: 300;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 14px;
  fill: #fff;
}

.node rect,
.node circle,
.node ellipse,
.node polygon {
  stroke: #333;
  fill: #fff;
  stroke-width: 1.5px;
}

.edgePath path {
  stroke: #333;
  stroke-width: 1.5px;
}
</style>
