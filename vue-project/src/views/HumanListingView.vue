<template>
  <div class="page">
    <header class="top">
      <button type="button" class="brand" @click="goHome">Repertoire</button>
      <div class="search">
        <input v-model="searchQuery" placeholder="Search recipes..." @keyup.enter="applyFilters" />
        <button @click="applyFilters">Search</button>
      </div>
    </header>

    <div class="content">
      <aside class="sidebar">
        <h2>Filters</h2>

        <div class="price-filter">
          <label>Max Time to make</label>

          <div id="slider-track">
            <div id="slider-fill"></div>
            <div id="slider-handle"></div>
          </div>

          <p>{{ maxTimeToMake.toLocaleString() }} Minutes</p>
        </div>

        <button class="apply-filters-button" @click="applyFilters">
          Apply Filters
        </button>
      </aside>

      <section class="listings-panel">
        <div class="listings">
          <div v-if="filteredListings.length === 0" class="no-results">
            No listings found for those settings.
          </div>
          <div v-else v-for="listing in filteredListings" :key="listing.id" class="card" @click="openItem(listing)">
            <div class="thumb" :style="listing.image_url ? `background-image:url(${listing.image_url})` : ''">
              <div v-if="!listing.image_url" class="noimg">No image</div>
            </div>
            <div class="info">
              <div class="title">{{ listing.title }}</div>
              <div class="price" v-if="listing.price_per_serving">
                ${{ listing.price_per_serving }} / serving
              </div>
              <button class="hide-btn" @click.stop="hideListing($event, listing.id)">Hide</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'
import gsap from 'gsap'
import Draggable from 'gsap/Draggable'
import { useAuthStore } from '@/stores/authStore'


gsap.registerPlugin(Draggable)

const listings = ref([])
const maxTimeToMake = ref(60)
const maxSliderValue = 120
const searchQuery = ref('')

const filteredListings = computed(() => {
  const term = searchQuery.value.trim().toLowerCase()
  const sourceListings = Array.isArray(listings.value) ? listings.value : []

  return sourceListings.filter((listing) => {
    const matchesTime = Number(listing?.time_to_make ?? 0) <= maxTimeToMake.value
    const matchesSearch =
      !term ||
      (listing?.title || '').toLowerCase().includes(term) ||
      (listing?.description || '').toLowerCase().includes(term)

    return matchesTime && matchesSearch
  })
})

const applyFilters = () => {
  // The list is already filtered reactively from the search text and max price.
}

const router = useRouter()
const authStore = useAuthStore()
function goHome() {
  router.push({ name: 'home' }).catch(() => {})
}

function openItem(item) {
  if (!item?.id) return
  router.push({ name: 'listing-detail', params: { id: item.id } }).catch(() => {})
}

async function loadListings() {
  // fetch any listings the current user has hidden, then fetch listings and
  // exclude those locally so the hide action is per-user only
  const currentUserId = authStore.user?.id
  let hiddenIds = []
  if (currentUserId) {
    const { data: hidden, error: hiddenError } = await supabase
      .from('hidden_listings')
      .select('listing_id')
      .eq('user_id', currentUserId)

    if (!hiddenError && Array.isArray(hidden) && hidden.length) {
      hiddenIds = hidden.map((h) => h.listing_id)
    }
  }

  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false })

  const all = error ? [] : (data ?? [])
  listings.value = hiddenIds.length ? all.filter((l) => !hiddenIds.includes(l.id)) : all
}

async function hideListing(evt, listingId) {
  evt.stopPropagation()
  const userId = authStore.user?.id
  if (!userId) {
    // prompt to sign in
    alert('Please sign in to hide listings for yourself.')
    return
  }

  const { error } = await supabase.from('hidden_listings').insert([
    { user_id: userId, listing_id: listingId },
  ])

  if (error) {
    console.error('Failed to hide listing', error)
  } else {
    listings.value = listings.value.filter((l) => l.id !== listingId)
  }
}

onMounted(async () => {
  await loadListings()

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
  const width = track?.offsetWidth || 240
  const maxX = Math.max(width - 26, 0)

  const initialPercent = maxTimeToMake.value / maxSliderValue
  const initialX = Math.round(initialPercent * maxX)

  gsap.set(fill, { width: `${initialPercent * 100}%` })
  gsap.set(handle, { x: initialX })

  Draggable.create(handle, {
    type: 'x',
    bounds: { minX: 0, maxX },
    onDrag() {
      const percent = maxX > 0 ? this.x / maxX : 0
      maxTimeToMake.value = Math.round(percent * maxSliderValue)
      gsap.set(fill, { width: `${percent * 100}%` })
    },
  })

  gsap.from('.sidebar', { x: -200, duration: 1 })
  gsap.from('.listings-panel', { opacity: 0, duration: 1.2 })
})
</script>

<style scoped>
:root {
  --bg: #071027;
  --panel: #0f1724;
  --muted: #9aa6b2;
  --accent: #06b6d4;
}

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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #071027, #05060a);
  color: #e6eef6;
}

.top {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.brand {
  font-weight: 700;
  font-size: 18px;
  color: #fff;
  font-family: 'Arial Rounded MT Bold', 'Trebuchet MS', 'Segoe UI', sans-serif;
  background: transparent;
  border: none;
  cursor: pointer;
}

.search {
  flex: 1;
  display: flex;
  gap: 8px;
  align-items: center;
}

.search input {
  flex: 1;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.03);
  background: var(--panel);
  color: var(--muted);
}

.search button {
  background: var(--accent);
  border: none;
  padding: 8px 10px;
  border-radius: 8px;
  color: #022;
  cursor: pointer;
}

.content {
  flex: 1;
  display: flex;
}

.sidebar {
  width: 280px;
  background-color: #ffd7a3;
  color: #111;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
}

.apply-filters-button {
  width: 100%;
  padding: 12px 16px;
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

.listings-panel {
  flex: 1;
  background-color: #d35400;
  padding: 20px;
  overflow-y: auto;
}

.listings {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}

.no-results {
  color: white;
  font-weight: 700;
}

.card {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.02);
}

.thumb {
  height: 140px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #081022;
  color: var(--muted);
}

.noimg {
  padding: 8px;
  color: var(--muted);
}

.info {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.title {
  font-weight: 600;
  color: #fff;
}

.price {
  color: #7ef6d0;
  font-weight: 700;
}

.hide-btn {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.08);
  color: #fff;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
}

.hide-btn:hover {
  opacity: 0.9;
}
</style>
