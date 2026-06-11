<template>
  <div class="page">
    <header class="top">
      <button type="button" class="brand" @click="goHome">Thung Ho</button>
    </header>
    <div class="sidebar">
      <h2>Filters</h2>

      <div class="price-filter">
        <label>Max Price</label>

        <div id="slider-track">
          <div id="slider-fill"></div>
          <div id="slider-handle"></div>
        </div>

        <p>${{ maxPrice.toLocaleString() }}</p>
      </div>

      <button class="apply-filters-button" @click="applyFilters">
        Apply Filters
      </button>
    </div>

    <div class="listings">
      <div v-if="filteredListings.length === 0" class="no-results">
        No listings found for those settings.
      </div>
      <div v-else v-for="listing in filteredListings" :key="listing.id" class="card">
        <h3>{{ listing.title }}</h3>
        <p>{{ listing.description }}</p>
        <h4>${{ listing.price }}</h4>
      </div>
    </div>
  </div>
</template>

<script setup>

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useListingStore } from '@/stores/listingStore'
import gsap from 'gsap'
import Draggable from 'gsap/Draggable'

gsap.registerPlugin(Draggable)

const listingStore = useListingStore()
const listings = listingStore.listings
const filteredListings = ref([])
const maxPrice = ref(50000)

const applyFilters = () => {
  filteredListings.value = listings.value.filter((listing) => {
    return Number(listing.price) <= maxPrice.value
  })
}

const router = useRouter()
function goHome() { router.push({ name: 'home' }).catch(() => {}) }

onMounted(async () => {
  await listingStore.fetchListings()
  filteredListings.value = listings.value

  gsap.from('.card', {
    duration: 0.8,
    opacity: 0,
    y: 50,
    stagger: 0.1,
    ease: 'power2.out',
  })

  const track = document.getElementById('slider-track')
  const fill = document.getElementById('slider-fill')
  const handle = document.getElementById('slider-handle')
  const width = track.offsetWidth

  const initialPercent = maxPrice.value / 99999
  fill.style.width = `${initialPercent * 100}%`
  handle.style.transform = `translateX(${Math.round(initialPercent * (width - 26))}px)`

  Draggable.create('#slider-handle', {
    type: 'x',
    bounds: { minX: 0, maxX: width - 26 },
    onDrag() {
      const percent = this.x / (width - 26)
      maxPrice.value = Math.round(percent * 99999)
      fill.style.width = `${percent * 100}%`
    },
  })

  gsap.from('.sidebar', { x: -200, duration: 1 })
  gsap.from('.listings', { opacity: 0, duration: 1.2 })
})

</script>

<style scoped>
#slider-track {
  width: 100%;
  height: 12px;

  background: white;

  border-radius: 50px;

  position: relative;

  margin-top: 30px;
}

#slider-fill {
  width: 0;

  height: 100%;

  background: orange;

  border-radius: 50px;
}

#slider-handle {
  width: 26px;
  height: 26px;

  background: white;

  border-radius: 50%;

  position: absolute;

  top: -7px;

  left: 0;

  cursor: grab;

  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}
.price-filter label,
.price-filter p {
  color: #ff7a00;
  font-weight: 700;
}
.page {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 15%;
  background-color: #ffd7a3;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.apply-filters-button {
  width: 100%;
  padding: 12px 16px;
  margin-top: 20px;
  border: none;
  border-radius: 12px;
  background: #d35400;
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.apply-filters-button:hover {
  background: #bf4400;
  transform: translateY(-1px);
}

.no-results {
  color: white;
  font-weight: 700;
}

.listings {
  width: 85%;
  background-color: #d35400;

  display: grid;
  grid-template-columns: repeat(4, 1fr);

  gap: 20px;

  padding: 20px;
  overflow-y: auto;
}

.card {
  background: white;

  border-radius: 18px;

  padding: 20px;

  color: #d35400;

  min-height: 180px;

  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-5px);
}
.top{ display:flex; justify-content:flex-end; padding:12px 16px; }
.brand{ font-weight:700; font-size:18px; color:#fff; background:transparent; border:none; cursor:pointer; }
</style>
