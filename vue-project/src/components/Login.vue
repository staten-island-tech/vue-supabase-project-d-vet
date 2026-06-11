<template>
  <div class="login-wrap">
    <form class="card" @submit.prevent="login">
      <h2>Sign in</h2>
      <input v-model="email" type="email" placeholder="Email" required autocomplete="username" />
      <input v-model="password" type="password" placeholder="Password" required autocomplete="current-password" />
      <button type="submit" :disabled="loading">{{ loading ? 'Signing in...' : 'Sign in' }}</button>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="info" class="info">{{ info }}</p>
      <div class="row">
        <button type="button" class="link" @click="sendSignInLink" :disabled="sendingLink">
          {{ sendingLink ? 'Sending link...' : 'Send sign-in link' }}
        </button>
        <router-link to="/register">Create account</router-link>
      </div>
    </form>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const sendingLink = ref(false)
const error = ref('')
const info = ref('')
async function login() {
  error.value = ''
  info.value = ''
  loading.value = true
  try {
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (signInError) {
      const msg = signInError.message || ''
      if (/confirm|confirmed|not confirmed/i.test(msg)) {
        error.value = 'Email not confirmed. You can send a sign-in link below.'
        info.value = ''
        loading.value = false
        return
      }
      error.value = msg || 'Sign in failed'
      return
    }
    info.value = 'Signed in'
    email.value = ''
    password.value = ''
    await router.push('/').catch(() => {})
  } catch (err) {
    error.value = err?.message ?? String(err)
  } finally {
    loading.value = false
  }
}
async function sendSignInLink() {
  error.value = ''
  info.value = ''
  if (!email.value) {
    error.value = 'Enter your email to receive a sign-in link.'
    return
  }
  sendingLink.value = true
  try {
    const { error: otpError } = await supabase.auth.signInWithOtp({ email: email.value })
    if (otpError) {
      error.value = otpError.message || 'Unable to send link'
    } else {
      info.value = 'Check your email for a sign-in link (also check spam).'
    }
  } catch (err) {
    error.value = err?.message ?? String(err)
  } finally {
    sendingLink.value = false
  }
}
</script>
<style scoped>
.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg,#071023,#05060a);
  color: #e6eef6;
  padding: 20px;
}
.card {
  width: 100%;
  max-width: 420px;
  padding: 20px;
  border-radius: 12px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.03);
  display:flex;
  flex-direction:column;
  gap:12px;
}
.card h2 { margin:0 0 6px 0; }
input {
  padding:10px 12px;
  border-radius:8px;
  border:1px solid rgba(255,255,255,0.04);
  background:#0f1724;
  color:#e6eef6;
}
button {
  padding:10px 12px;
  border-radius:8px;
  border:none;
  background:#06b6d4;
  color:#042;
  font-weight:600;
  cursor:pointer;
}
button[disabled]{ opacity:0.7; cursor:default; }
.row{ display:flex; justify-content:space-between; align-items:center; gap:8px; font-size:0.9rem; color:#94a3b8; }
</style>