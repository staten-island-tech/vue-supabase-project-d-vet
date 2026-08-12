<template>
  <div class="home">
    <header class="top">
      <div class="brand">Repertoire</div>
      <div class="search">
        <input v-model="q" @keyup.enter="fetchListings" placeholder="Search items..." />
        <button @click="fetchListings">Search</button>
      </div>
      <button class="login" @click="goLogin">Sign in</button>
    </header>

    <main class="content">
      <section class="big-buttons">
        <div class="button-grid">
          <button class="big-btn" @click="goRegister">Sign Up</button>
          <button class="big-btn" @click="goLogin">Login</button>
          <button class="big-btn" @click="goView">View</button>
          <button class="big-btn" @click="goCreate">Post</button>
        </div>
      </section>
      <div class="hidden-toggle-row">
        <button class="show-hidden-btn" @click="toggleShowHidden">
          {{ showHidden ? 'Hide hidden' : 'Show hidden' }}
        </button>
      </div>
      <p>Wishlist count: {{ wishlistListings.length }}</p>
      <section v-if="showHidden" class="wishlist-section">
        <div class="section-title">Your Hidden Listings</div>
        <div v-if="!authStore.isSignedIn" class="empty">Sign in to see your hidden listings.</div>
        <div v-else-if="hiddenLoading" class="empty">Loading hidden listings...</div>
        <div v-else-if="hiddenListings.length === 0" class="empty">No hidden listings yet.</div>
        <div v-else class="grid">
          <div v-for="it in hiddenListings" :key="it.id" class="card">
            <div class="thumb" :style="it.image_url ? `background-image:url(${it.image_url})` : ''" @click="openItem(it)">
              <div v-if="!it.image_url" class="noimg">No image</div>
            </div>
            <div class="info">
              <div class="title" @click="openItem(it)">{{ it.title }}</div>
              <button class="remove-btn" @click.stop="removeFromHidden(it.id)">Unhide</button>
            </div>
          </div>
        </div>
      </section>
      <section class="wishlist-section">
        <div class="section-title">Your Wishlist</div>
        <div v-if="!authStore.isSignedIn" class="empty">Sign in to see your saved listings.</div>
        <div v-else-if="wishlistLoading" class="empty">Loading wishlist...</div>
        <div v-else-if="wishlistListings.length === 0" class="empty">No saved listings yet.</div>
        <div v-else class="grid">
          <div v-for="it in wishlistListings" :key="it.id" class="card">
            <div class="thumb" :style="it.image_url ? `background-image:url(${it.image_url})` : ''" @click="openItem(it)">
              <div v-if="!it.image_url" class="noimg">No image</div>
            </div>
            <div class="info">
              <div class="title" @click="openItem(it)">{{ it.title }}</div>
              <button class="remove-btn" @click.stop="removeFromWishlist(it.id)">Remove</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { storeToRefs } from 'pinia'
import { supabase } from '@/supabase'

const router = useRouter()
const authStore = useAuthStore()
const wishlistStore = useWishlistStore()
const q = ref('')
const loading = ref(false)
const showHidden = ref(false)
const hiddenListings = ref([])
const hiddenLoading = ref(false)
const { wishlistListings, loading: wishlistLoading } =
  storeToRefs(wishlistStore)
// const wishlistListings = wishlistStore.wishlistListings
// /* const wishlistListings = computed(() => wishlistStore.wishlistListings) */
// const wishlistLoading = computed(() => wishlistStore.loading)

async function fetchListings() {
  loading.value = true
  try {
    await wishlistStore.loadWishlist()
    if (showHidden.value) {
      await loadHiddenListings()
    }
  } finally {
    loading.value = false
  }
}

async function loadHiddenListings() {
  if (!authStore.user?.id) {
    hiddenListings.value = []
    return
  }

  hiddenLoading.value = true

  try {
    const { data: hiddenRows, error: hiddenRowsError } = await supabase
      .from('hidden_listings')
      .select('listing_id')
      .eq('user_id', authStore.user.id)

    if (hiddenRowsError) throw hiddenRowsError

    const listingIds = (hiddenRows || []).map((row) => row.listing_id).filter(Boolean)

    if (!listingIds.length) {
      hiddenListings.value = []
      return
    }

    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('id,title,ingredients,price_per_serving,time_to_make,image_url,description,created_at,user_id,kcal_per_serving,protein_per_serving,carbs_per_serving,fat_per_serving,fiber_per_serving,sugar_per_serving,sodium_per_serving')
      .in('id', listingIds)

    if (listingsError) throw listingsError
    hiddenListings.value = listings || []
  } catch (err) {
    console.error('Unable to load hidden listings', err)
    hiddenListings.value = []
  } finally {
    hiddenLoading.value = false
  }
}

function toggleShowHidden() {
  showHidden.value = !showHidden.value
  if (showHidden.value && authStore.isSignedIn) {
    loadHiddenListings()
  }
}

function openItem(item) {
  if (!item?.id) return
  router.push({ name: 'listing-detail', params: { id: item.id } }).catch(() => {})
}

/* function removeFromWishlist(listingId) {
  wishlistStore.removeFromWishlist(listingId)
} */
async function removeFromWishlist(listingId) {
  const success = await wishlistStore.removeFromWishlist(listingId)

  console.log('REMOVE SUCCESS', success)
}

async function removeFromHidden(listingId) {
  if (!authStore.user?.id || !listingId) return

  const { error } = await supabase
    .from('hidden_listings')
    .delete()
    .match({
      user_id: authStore.user.id,
      listing_id: listingId,
    })

  if (!error) {
    hiddenListings.value = hiddenListings.value.filter((item) => item.id !== listingId)
  }
}

function goLogin() {
  router.push({ name: 'login' }).catch(() => {})
}
function goRegister() { router.push({ name: 'register' }).catch(() => {}) }
function goView() { router.push({ name: 'human-listing' }).catch(() => {}) }
function goCreate() { router.push({ name: 'create-listing' }).catch(() => {}) }

watch(() => authStore.user?.id, async () => {
  await wishlistStore.loadWishlist()
  if (showHidden.value) {
    await loadHiddenListings()
  }
}, { immediate: true })

onMounted(() => {
  fetchListings()
})
</script>

<style scoped>
:root {
  --bg: #071027;
  --panel: #0f1724;
  --muted: #9aa6b2;
  --accent: #06b6d4;
}
.home { min-height: 100vh; background: linear-gradient(180deg, var(--bg), #05060a); color: #e6eef6; font-family: Inter, system-ui, Arial; }
.top { display: flex; gap: 12px; align-items: center; padding: 12px 16px; background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.03); }
.brand { font-weight: 700; font-size: 18px; color: #fff; font-family: 'Arial Rounded MT Bold', 'Trebuchet MS', 'Segoe UI', sans-serif; }
.search { flex: 1; display: flex; gap: 8px; align-items: center; }
.search input { flex: 1; padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.03); background: var(--panel); color: var(--muted); }
.search button, .login { background: var(--accent); border: none; padding: 8px 10px; border-radius: 8px; color: #022; cursor: pointer; }
.content { padding: 18px; }
.hidden-toggle-row { margin: 8px 0 12px; }
.show-hidden-btn { background: #f59e0b; color: #111827; border: none; padding: 8px 12px; border-radius: 8px; font-weight: 700; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; }
.show-hidden-btn:hover, .remove-btn:hover, .big-btn:hover, .login:hover, .search button:hover { transform: translateY(-2px) scale(1.01); box-shadow: 0 10px 22px rgba(0,0,0,0.18); }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
.card { background: rgba(255,255,255,0.02); border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.02); animation: fadeUp 0.45s ease both; }
.thumb { height: 120px; background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; background: #081022; color: var(--muted); cursor: pointer; }
.noimg { padding: 8px; color: var(--muted); }
.info { padding: 10px; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.title { font-weight: 600; color: #fff; cursor: pointer; }
.price { color: #7ef6d0; font-weight: 700; }
.empty { text-align: center; color: var(--muted); padding: 24px; }
.remove-btn { background: #dc2626; color: white; border: none; padding: 8px 10px; border-radius: 8px; cursor: pointer; }
.wishlist-section { margin-top: 8px; }
.section-title { font-size: 20px; font-weight: 700; margin-bottom: 12px; }
.big-buttons { padding: 18px; }
.button-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; max-width: 900px; margin: 0 auto 18px; }
.big-btn { background: #d35400; color: #fff; padding: 36px 12px; font-size: 20px; font-weight: 800; border-radius: 12px; border: none; cursor: pointer; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (max-width: 700px) { .grid { grid-template-columns: 1fr; } .button-grid { grid-template-columns: 1fr; } }
</style>