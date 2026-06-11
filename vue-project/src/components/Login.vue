<template>
  <div class="login-container">
    <header class="top">
      <button type="button" class="brand" @click="goHome">Thung Ho</button>
    </header>
    <form class="login-form" @submit.prevent="login">
      <h2>Sign In</h2>
      <input
        v-model="username"
        type="email"
        placeholder="Input Email"
        required
      />
      <input
        v-model="password"
        type="password"
        placeholder="Input Password"
        required
      />
      <button type="submit" :disabled="loading">
        {{ loading ? "Signing in..." : "Sign In" }}
      </button>
      <p v-if="message" class="message">
        {{ message }}
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from 'vue-router'
import { supabase } from "../supabase"

const router = useRouter()
function goHome() { router.push({ name: 'home' }).catch(() => {}) }

const username = ref("")
const password = ref("")
const loading = ref(false)
const message = ref("")

const login = async () => {
  loading.value = true
  message.value = ""

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username.value,
      password: password.value,
    })

    if (error) {
      message.value = error.message
    } else {
      if (data?.user || data?.session) {
        message.value = "Login successful"
        username.value = ""
        password.value = ""
      } else {
        message.value = "Check your email for a login link or confirm your account if required."
      }
    }
  } catch (err) {
    message.value = err?.message ?? String(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.top{ display:flex; justify-content:flex-end; padding:12px 16px; width:100%; position:fixed; top:0; left:0; }
.brand{ font-weight:700; font-size:18px; color:#fff; background:transparent; border:none; cursor:pointer; }
</style>