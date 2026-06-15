<template>
  <div class="home">
    <header class="top">
      <div class="brand">Thung Ho</div>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useWishlistStore } from '@/stores/wishlistStore'

const router = useRouter()
const authStore = useAuthStore()
const wishlistStore = useWishlistStore()
const q = ref('')
const loading = ref(false)

const wishlistListings = computed(() => wishlistStore.wishlistListings)
const wishlistLoading = computed(() => wishlistStore.loading)

async function fetchListings() {
  loading.value = true
  try {
    await wishlistStore.loadWishlist()
  } finally {
    loading.value = false
  }
}

function openItem(item) {
  if (!item?.id) return
  router.push({ name: 'listing-detail', params: { id: item.id } }).catch(() => {})
}

function removeFromWishlist(listingId) {
  wishlistStore.removeFromWishlist(listingId)
}

function goLogin() {
  router.push({ name: 'login' }).catch(() => {})
}
function goRegister() { router.push({ name: 'register' }).catch(() => {}) }
function goView() { router.push({ name: 'human-listing' }).catch(() => {}) }
function goCreate() { router.push({ name: 'create-listing' }).catch(() => {}) }

watch(() => authStore.user?.id, () => {
  wishlistStore.loadWishlist()
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
.brand { font-weight: 700; font-size: 18px; color: #fff; }
.search { flex: 1; display: flex; gap: 8px; align-items: center; }
.search input { flex: 1; padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.03); background: var(--panel); color: var(--muted); }
.search button, .login { background: var(--accent); border: none; padding: 8px 10px; border-radius: 8px; color: #022; cursor: pointer; }
.content { padding: 18px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
.card { background: rgba(255,255,255,0.02); border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.02); }
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
@media (max-width: 700px) { .grid { grid-template-columns: 1fr; } .button-grid { grid-template-columns: 1fr; } }
</style>