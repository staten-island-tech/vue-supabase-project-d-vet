<template>
  <div class="h-screen flex">
    <!-- LEFT SIDEBAR -->
    <aside class="w-[15%] min-w-[220px] bg-orange-200 p-6 flex flex-col">
      <h2 class="text-2xl font-bold text-orange-700 mb-6">Filters</h2>

      <div class="mt-4">
        <p class="text-orange-700 font-semibold mb-2">Max Price</p>

        <!-- GSAP Slider Goes Here -->
        <div id="slider-container" class="relative mt-8">
          <div class="w-full h-3 bg-white rounded-full shadow">
            <div id="slider-fill" class="h-3 bg-orange-500 rounded-full"></div>
          </div>

          <div
            id="slider-handle"
            class="absolute top-[-10px] w-8 h-8 bg-white rounded-full shadow-lg cursor-pointer"
          ></div>
        </div>

        <p class="mt-4 text-orange-700 font-bold">${{ maxPrice.toLocaleString() }}</p>
      </div>
    </aside>

    <!-- RIGHT CONTENT -->
    <main class="w-[85%] bg-orange-600 p-8 overflow-y-auto">
      <div class="grid grid-cols-4 gap-6">
        <div
          v-for="listing in listings"
          :key="listing.id"
          class="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition"
        >
          <h3 class="text-orange-600 text-xl font-bold">
            {{ listing.title }}
          </h3>

          <p class="text-orange-500 mt-2">
            {{ listing.description }}
          </p>

          <p class="mt-4 text-2xl font-bold text-orange-700">${{ listing.price }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import Draggable from 'gsap/Draggable'

const listings = ref([
  {
    id: 1,
    title: 'Gaming Laptop',
    description: 'RTX graphics card',
    price: 600
  },
  {
    id: 2,
    title: 'iPhone',
    description: 'Excellent condition',
    price: 400
  },
  {
    id: 3,
    title: 'Bicycle',
    description: 'Mountain bike',
    price: 250
  }
])


gsap.registerPlugin(Draggable)

const maxPrice = ref(50000)

onMounted(() => {
  const trackWidth = document.getElementById('slider-container').offsetWidth

  Draggable.create('#slider-handle', {
    type: 'x',
    bounds: {
      minX: 0,
      maxX: trackWidth - 32,
    },

    onDrag() {
      const percent = this.x / (trackWidth - 32)

      maxPrice.value = Math.round(percent * 99999)

      gsap.set('#slider-fill', {
        width: this.x + 16,
      })
    },
  })
})
</script>

<style scoped></style>
