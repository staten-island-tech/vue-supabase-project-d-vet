<template>
  <div class="register-container">
    <form class="register-form" @submit.prevent="register">
      <h2>Create Account</h2>
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
        {{ loading ? "Creating..." : "Register" }}
      </button>
      <p v-if="message" class="message">
        {{ message }}
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { supabase } from "../supabase"

const username = ref("")
const password = ref("")
const loading = ref(false)
const message = ref("")
const register = async () => {
  loading.value = true
  message.value = ""

  const { error } = await supabase.auth.signUp({
    email: username.value,
    password: password.value,
  })

  if (error) {
    message.value = error.message
  } else {
    message.value = "Registration successful"
    username.value = ""
    password.value = ""
  }

  loading.value = false
}
</script>

<style scoped>
.register-container {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>