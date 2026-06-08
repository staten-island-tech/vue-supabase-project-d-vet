<template>
  <div class="login-container">
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
import { supabase } from "./supabase"

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
</style>