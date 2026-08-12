<template>
  <div>
    <header class="app-header">
      <router-link class="brand" :to="{ name: 'home' }">Repertoire</router-link>
      <div class="user-pill">
        <img :src="authStore.profilePicture" alt="Profile" class="avatar" />
        <span>{{ authStore.displayName }}</span>
      </div>
    </header>
    <router-view />

    <div v-if="showHomeReveal" class="home-reveal" :class="{ collapse: transitionPhase === 'collapse' }">
      <div class="repertoire-word">Repertoire</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const router = useRouter()
const showHomeReveal = ref(false)
const transitionPhase = ref('idle') // 'expand' | 'collapse' | 'idle'
let pendingNext = null
const EXPAND_MS = 700
const COLLAPSE_MS = 700

// When navigating to home, we delay calling next() until the overlay has expanded
router.beforeEach((to, from, next) => {
  if (to.name === 'home' && from.name !== 'home') {
    showHomeReveal.value = true
    transitionPhase.value = 'expand'

    // wait for the expand animation to finish, then proceed with navigation
    setTimeout(async () => {
      // allow the route change
      next()

      // give Vue a tick to render the new page underneath
      await nextTick()

      // start collapsing the overlay with the same easing
      transitionPhase.value = 'collapse'

      // hide overlay after collapse finishes
      setTimeout(() => {
        showHomeReveal.value = false
        transitionPhase.value = 'idle'
      }, COLLAPSE_MS)
    }, EXPAND_MS)

    // hold navigation for now
    return
  }

  next()
})

onBeforeUnmount(() => {
  // nothing to cleanup currently
})
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(7, 16, 39, 0.92);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.brand {
  color: #fff;
  font-weight: 700;
  font-size: 18px;
  font-family: 'Arial Rounded MT Bold', 'Trebuchet MS', 'Segoe UI', sans-serif;
  text-decoration: none;
}
.user-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e6eef6;
  font-size: 14px;
}
.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(255,255,255,0.16);
}
.home-reveal {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  background: #071027; /* solid background while revealing */
  opacity: 1;
}
.repertoire-word {
  color: #f4f7fb;
  font-weight: 900;
  letter-spacing: 0.08em;
  font-family: 'Arial Rounded MT Bold', 'Trebuchet MS', 'Segoe UI', sans-serif;
  text-transform: none;
  position: fixed;
  top: 18px;
  left: 18px;
  font-size: 18px;
  transform: translate(0, 0) scale(0.7);
  transition: transform 700ms cubic-bezier(0.4, 0, 0.2, 1), font-size 700ms cubic-bezier(0.4, 0, 0.2, 1), top 700ms cubic-bezier(0.4, 0, 0.2, 1), left 700ms cubic-bezier(0.4, 0, 0.2, 1);
}
.home-reveal:not(.collapse) .repertoire-word {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1);
  font-size: clamp(4rem, 18vw, 18rem);
}
.home-reveal.collapse {
  opacity: 1;
  background: #071027;
}
.home-reveal.collapse .repertoire-word {
  top: 18px;
  left: 18px;
  font-size: 18px;
  transform: translate(0, 0) scale(0.7);
}
</style>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  background: #071027;
  color: #e6eef6;
}
</style>
