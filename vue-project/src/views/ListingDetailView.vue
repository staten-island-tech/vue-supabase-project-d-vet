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
        <p class="animate-in price" v-if="listing.price_per_serving">
          ${{ listing.price_per_serving }} / serving
        </p>
        <p class="animate-in meta" v-if="listing.servings">Servings: {{ listing.servings }}</p>
        <p class="animate-in meta" v-if="listing.time_to_make">Time to make: {{ listing.time_to_make }} minutes</p>
        <p class="animate-in description">{{ listing.description || 'No description provided.' }}</p>
        <p class="animate-in meta">Posted On {{ postedOn }}</p>
        <div v-if="nutritionDetails.length" class="nutrition-grid animate-in">
          <div v-for="item in nutritionDetails" :key="item.key" class="nutrition-card">
            <span class="nutrition-label">{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
        <div v-if="ingredientLines.length" class="ingredients animate-in">
          <div class="section-title">Ingredients</div>
          <div class="ingredient-list">
            <p v-for="(line, index) in ingredientLines" :key="index">— {{ line }}</p>
          </div>
        </div>
        <div class="animate-in email-block">
          <span class="meta">Poster Email:</span>
          <input class="email-input" :value="posterEmail" readonly @focus="$event.target.select()" />
        </div>
        <button class="animate-in wishlist-btn" :disabled="!authStore.isSignedIn || isWishlisted" @click="addToWishlist">
          {{ isWishlisted ? 'Saved to Wishlist' : (authStore.isSignedIn ? 'Add to Wishlist' : 'Sign in to save') }}
        </button>
        <button class="animate-in hide-btn" :disabled="!authStore.isSignedIn" @click="hideListing">
          {{ authStore.isSignedIn ? 'Hide for me' : 'Sign in to hide' }}
        </button>
        <p v-if="wishlistMessage" class="animate-in wishlist-message">{{ wishlistMessage }}</p>
      </div>
    </main>

    <main v-else class="detail-card empty-state">
      <h1 class="animate-in title">Listing not found</h1>
      <p class="animate-in description">This listing could not be loaded.</p>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import gsap from 'gsap'
import { supabase } from '@/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useWishlistStore } from '@/stores/wishlistStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const wishlistStore = useWishlistStore()
const listing = ref(null)
const posterEmailValue = ref('')
const loading = ref(false)
const wishlistMessage = ref('')

const postedOn = computed(() => {
  if (!listing.value?.created_at) return 'Unknown'
  return new Date(listing.value.created_at).toLocaleDateString()
})

const posterEmail = computed(() => {
  return posterEmailValue.value || 'Email unavailable'
})

const nutritionDetails = computed(() => {
  const values = listing.value || {}
  const fields = [
    { key: 'kcal_per_serving', label: 'Kcal per serving' },
    { key: 'protein_per_serving', label: 'Protein per serving (g)' },
    { key: 'carbs_per_serving', label: 'Carbohydrates per serving (g)' },
    { key: 'fat_per_serving', label: 'Fat per serving (g)' },
    { key: 'fiber_per_serving', label: 'Fiber per serving (g)' },
    { key: 'sugar_per_serving', label: 'Sugar per serving (g)' },
    { key: 'sodium_per_serving', label: 'Sodium per serving (mg)' },
  ]

  return fields
    .filter((field) => values[field.key] != null && values[field.key] !== '')
    .map((field) => ({ key: field.key, label: field.label, value: values[field.key] }))
})

const ingredientLines = computed(() => {
  const raw = listing.value?.ingredients || ''
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length)
})

const isWishlisted = computed(() => Boolean(listing.value?.id && wishlistStore.hasListing(listing.value.id)))

async function loadListing() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', route.params.id)
      .maybeSingle()

    if (!error && data) {
      listing.value = data
      posterEmailValue.value = ''

      const ownerId = data.user_id
      const currentUserId = authStore.user?.id

      if (ownerId && currentUserId && ownerId === currentUserId && authStore.user?.email) {
        posterEmailValue.value = authStore.user.email
      } else if (ownerId) {
        const profileRequests = [
          supabase.from('profiles').select('email').eq('id', ownerId).maybeSingle(),
          supabase.from('profiles').select('email').eq('user_id', ownerId).maybeSingle(),
        ]

        const results = await Promise.all(profileRequests)
        const profileEmail = results.find((result) => !result.error && result.data?.email)?.data?.email

        posterEmailValue.value = profileEmail || data.poster_email || data.email || data.user_email || ''
      } else {
        posterEmailValue.value = data.poster_email || data.email || data.user_email || ''
      }
    }
  } finally {
    loading.value = false
  }
}

async function addToWishlist() {
  if (!listing.value?.id) return
  wishlistMessage.value = ''
  if (!authStore.isSignedIn) {
    wishlistMessage.value = 'Please sign in to save this listing.'
    return
  }

  const success = await wishlistStore.addToWishlist(listing.value.id)
  wishlistMessage.value = success ? 'Added to your wishlist.' : 'This listing is already in your wishlist.'
}

async function hideListing() {
  if (!listing.value?.id) return
  const userId = authStore.user?.id
  if (!userId) {
    alert('Please sign in to hide this listing for yourself.')
    return
  }

  const { error } = await supabase.from('hidden_listings').insert([
    { user_id: userId, listing_id: listing.value.id },
  ])

  if (error) {
    console.error('Failed to hide listing', error)
  } else {
    router.push({ name: 'human-listing' }).catch(() => {})
  }
}

function goBack() {
  router.push({ name: 'human-listing' }).catch(() => {})
}

watch(() => route.params.id, async () => {
  await loadListing()
}, { immediate: true })

watch(() => authStore.user?.id, async () => {
  await loadListing()
  await wishlistStore.loadWishlist()
})

onMounted(() => {
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

.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 10px;
}

.nutrition-card {
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.nutrition-label {
  display: block;
  font-size: 12px;
  color: #9aa6b2;
  margin-bottom: 4px;
}

.ingredients {
  padding: 16px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-top: 10px;
}

.ingredient-list {
  margin-top: 10px;
}

.ingredient-list p {
  margin: 0 0 8px;
  line-height: 1.5;
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

.wishlist-btn {
  margin-top: 6px;
  padding: 10px 12px;
  border: none;
  border-radius: 10px;
  background: #dc2626;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.wishlist-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.wishlist-message {
  color: #7ef6d0;
  margin: 0;
}

.hide-btn {
  margin-top: 8px;
  padding: 8px 12px;
  border: 1px solid rgba(255,255,255,0.08);
  background: transparent;
  color: #fff;
  border-radius: 10px;
  cursor: pointer;
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
