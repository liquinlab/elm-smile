<!-- TextWhisper.vue -->
<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { animate, stagger, easeOut } from 'motion'

const props = defineProps({
  wordDelay: {
    type: Number,
    default: 500,
  },
  fadeDelay: {
    type: Number,
    default: 1500,
  },
  wordDuration: {
    type: Number,
    default: 2500,
  },
  startDelay: {
    type: Number,
    default: 0,
  },
  sentenceDelay: {
    type: Number,
    default: 1000,
  },
})

const slotContent = ref(null)
const wordsContainer = ref(null)
const currentSentenceIndex = ref(0)
const sentences = ref([])
const isDestroyed = ref(false)
const activeTimeouts = ref([])

const processSlotContent = () => {
  if (!slotContent.value) return

  sentences.value = Array.from(slotContent.value.children).map((div) => {
    return div.textContent.trim().split(/\s+/)
  })

  currentSentenceIndex.value = 0
}

const createSentenceContainer = () => {
  const container = document.createElement('div')
  container.className = 'sentence'
  container.style.display = 'flex'
  container.style.flexWrap = 'wrap'
  container.style.gap = '0.2em'
  container.style.justifyContent = 'center'
  container.style.width = '100%'
  wordsContainer.value.appendChild(container)
  return container
}

const createWordElements = (words, container) => {
  return words.map((word) => {
    const span = document.createElement('span')
    span.textContent = word
    span.style.opacity = '0'
    span.style.display = 'inline-block'
    container.appendChild(span)
    return span
  })
}

const inkFadeEasing = [0.4, 0.0, 0.2, 1]

const animateWord = async (element, index, totalWords) => {
  if (isDestroyed.value) return

  animate(
    element,
    {
      opacity: [0, 1],
      //y: [20, 0],
    },
    {
      duration: 0.4,
      easing: [0.2, 0.0, 0.0, 1],
    }
  )

  const timeoutId = setTimeout(async () => {
    if (!isDestroyed.value) {
      await animate(
        element,
        { opacity: 0 },
        {
          duration: props.fadeDelay / 1000,
          easing: inkFadeEasing,
        }
      )
    }
  }, props.wordDuration)

  activeTimeouts.value.push(timeoutId)
}

const animateSentence = async (sentenceIndex) => {
  if (isDestroyed.value) return

  const words = sentences.value[sentenceIndex]
  const container = createSentenceContainer()
  const elements = createWordElements(words, container)

  for (let i = 0; i < elements.length; i++) {
    if (isDestroyed.value) break

    const element = elements[i]
    animateWord(element, i, elements.length)

    if (i < elements.length - 1) {
      await new Promise((resolve) => {
        const timeoutId = setTimeout(resolve, props.wordDelay)
        activeTimeouts.value.push(timeoutId)
      })
    }
  }

  const sentenceTimeoutId = setTimeout(async () => {
    if (!isDestroyed.value) {
      container.remove()
      currentSentenceIndex.value = (currentSentenceIndex.value + 1) % sentences.value.length
      const nextSentenceTimeoutId = setTimeout(() => {
        requestAnimationFrame(() => animateSentence(currentSentenceIndex.value))
      }, props.sentenceDelay)
      activeTimeouts.value.push(nextSentenceTimeoutId)
    }
  }, props.wordDuration + props.fadeDelay)

  activeTimeouts.value.push(sentenceTimeoutId)
}

// Cleanup function
const cleanup = () => {
  isDestroyed.value = true

  // Clear all timeouts
  activeTimeouts.value.forEach((timeoutId) => clearTimeout(timeoutId))
  activeTimeouts.value = []

  // Stop any ongoing animations and clear DOM
  if (wordsContainer.value) {
    const elements = wordsContainer.value.querySelectorAll('span')
    elements.forEach((element) => {
      animate(element, { opacity: 0 }, { duration: 0 })
    })
    wordsContainer.value.innerHTML = ''
  }
}

onMounted(() => {
  isDestroyed.value = false
  processSlotContent()
  if (sentences.value.length > 0) {
    // Add delay before starting the animation
    const timeoutId = setTimeout(() => {
      if (!isDestroyed.value) {
        animateSentence(currentSentenceIndex.value)
      }
    }, props.startDelay)
    activeTimeouts.value.push(timeoutId)
  }
})

onUnmounted(() => {
  cleanup()
})
</script>

<template>
  <div class="text-whisper">
    <div ref="slotContent" style="display: none">
      <slot></slot>
    </div>
    <div ref="wordsContainer" class="words-container"></div>
  </div>
</template>

<style scoped>
.text-whisper {
  position: relative;
  min-height: 2em;
  width: 100%;
  display: flex;
  justify-content: center;
}

.words-container {
  position: relative;
  padding: 0;
  margin: 0;
  min-height: 1.5em;
  width: 100%;
  display: flex;
  justify-content: center;
}

.sentence {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  margin: 0 auto;
  display: flex;
  justify-content: center;
}
</style>
