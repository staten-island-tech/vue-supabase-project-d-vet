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
      <section class="grid">
        <div v-if="loading" class="empty">Loading...</div>
        <div v-else-if="filtered.length === 0" class="empty">No items found.</div>
        <div v-else v-for="it in filtered" :key="it.id" class="card" @click="openItem(it)">
          <div class="thumb" :style="it.image_url ? `background-image:url(${it.image_url})` : ''">
            <div v-if="!it.image_url" class="noimg">No image</div>
          </div>
          <div class="info">
            <div class="title">{{ it.title }}</div>
            <div class="price" v-if="it.price">${{ it.price }}</div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
const router = useRouter()
const q = ref('')
const listings = ref([])
const loading = ref(false)
async function fetchListings() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('id,title,price,image_url')
      .order('created_at', { ascending: false })
    if (error || !data) {
      listings.value = []
    } else {
      listings.value = data
    }
  } catch (e) {
    listings.value = [
      { id: 'm1', title: 'TEST CARD', price: 999, image_url: '' }
    ]
  } finally {
    loading.value = false
  }
}
const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return listings.value
  return listings.value.filter((it) => (it.title || '').toLowerCase().includes(term))
})
function openItem(item) {
  if (!item?.id) return
  router.push({ name: 'Listing', params: { id: item.id } }).catch(() => {})
}
function goLogin() {
  router.push({ name: 'Login' }).catch(() => {})
}
onMounted(fetchListings)
</script>

<style scoped>
:root{
  --bg:#071027;
  --panel:#0f1724;
  --muted:#9aa6b2;
  --accent:#06b6d4;
}
.home{ min-height:100vh; background:linear-gradient(180deg,var(--bg),#05060a); color:#e6eef6; font-family:Inter,system-ui,Arial; }
.top{ display:flex; gap:12px; align-items:center; padding:12px 16px; background:rgba(255,255,255,0.02); border-bottom:1px solid rgba(255,255,255,0.03); }
.brand{ font-weight:700; font-size:18px; color:#fff; }
.search{ flex:1; display:flex; gap:8px; align-items:center; }
.search input{ flex:1; padding:8px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.03); background:var(--panel); color:var(--muted); }
.search button, .login{ background:var(--accent); border:none; padding:8px 10px; border-radius:8px; color:#022; cursor:pointer; }
.content{ padding:18px; }
.grid{ display:grid; grid-template-columns: repeat(auto-fill,minmax(200px,1fr)); gap:14px; }
.card{ background:rgba(255,255,255,0.02); border-radius:10px; overflow:hidden; cursor:pointer; border:1px solid rgba(255,255,255,0.02); }
.thumb{ height:120px; background-size:cover; background-position:center; display:flex; align-items:center; justify-content:center; background:#081022; color:var(--muted); }
.noimg{ padding:8px; color:var(--muted); }
.info{ padding:10px; display:flex; justify-content:space-between; align-items:center; gap:8px; }
.title{ font-weight:600; color:#fff; }
.price{ color:#7ef6d0; font-weight:700; }
.empty{ text-align:center; color:var(--muted); padding:24px; }
@media (max-width:700px){ .grid{ grid-template-columns:1fr; } }
</style>