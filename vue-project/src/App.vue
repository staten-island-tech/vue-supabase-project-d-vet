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
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
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
</style>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  background: #071027;
  color: #e6eef6;
}
</style>
