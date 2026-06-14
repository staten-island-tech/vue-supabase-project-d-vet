<template>
  <div class="page">
    <header class="top">
      <button type="button" class="brand" @click="goBack">← Back to listings</button>
    </header>

    <main v-if="listing" class="detail-card">
      <div class="image-wrap">
        <img
          v-if="listing.image_url"
          :src="listing.image_url"
          :alt="listing.title"
          class="listing-image"
        />
        <div v-else class="listing-image placeholder">No image available</div>
      </div>

      <div class="content">
        <h1 class="animate-in title">{{ listing.title }}</h1>
        <p class="animate-in price">${{ listing.price }}</p>
        <p class="animate-in description">{{ listing.description || 'No description provided.' }}</p>
        <p class="animate-in meta">Posted On {{ postedOn }}</p>
        <p class="animate-in meta">Pickup Location: {{ listing.location || 'Not specified' }}</p>
        <div class="animate-in email-block">
          <span class="meta">Poster Email:</span>
          <input class="email-input" :value="posterEmail" readonly @focus="$event.target.select()" />
        </div>
      </div>
    </main>

    <main v-else class="detail-card empty-state">
      <h1 class="animate-in title">Listing not found</h1>
      <p class="animate-in description">This listing could not be loaded.</p>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import gsap from 'gsap'
import { supabase } from '@/supabase'

const route = useRoute()
const router = useRouter()
const listing = ref(null)
const loading = ref(false)

const postedOn = computed(() => {
  if (!listing.value?.created_at) return 'Unknown'
  return new Date(listing.value.created_at).toLocaleDateString()
})

const posterEmail = computed(() => {
  const value = listing.value?.poster_email || listing.value?.email || listing.value?.user_email || ''
  return value || 'Email unavailable'
})

async function loadListing() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', route.params.id)
      .maybeSingle()

    if (!error) {
      listing.value = data
    }
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push({ name: 'human-listing' }).catch(() => {})
}

onMounted(async () => {
  await loadListing()

  gsap.from('.listing-image', {
    opacity: 0,
    scale: 0.95,
    duration: 0.8,
    ease: 'power3.out',
  })

  gsap.from('.animate-in', {
    opacity: 0,
    y: 28,
    duration: 0.7,
    stagger: 0.12,
    ease: 'back.out(1.2)',
  })
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #071027, #05060a);
  color: #e6eef6;
  padding: 20px;
  box-sizing: border-box;
}

.top {
  margin-bottom: 16px;
}

.brand {
  background: transparent;
  border: none;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  font-size: 16px;
}

.detail-card {
  max-width: 980px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 22px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.25);
}

.image-wrap {
  background: #081022;
  min-height: 420px;
}

.listing-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9aa6b2;
  font-size: 20px;
}

.content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.title {
  font-size: 28px;
  margin: 0;
}

.price {
  font-size: 24px;
  font-weight: 700;
  color: #7ef6d0;
  margin: 0;
}

.description {
  line-height: 1.6;
  color: #dfe8f2;
  margin: 0;
}

.meta {
  color: #9aa6b2;
  margin: 0;
}

.email-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.email-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.06);
  color: #fff;
  box-sizing: border-box;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
}

@media (max-width: 800px) {
  .detail-card {
    grid-template-columns: 1fr;
  }

  .image-wrap {
    min-height: 280px;
  }
}
</style>
