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
import { createClient } from "@supabase/supabase-js"
const supabaseUrl = "https://oxyotgdlkktbqwpkremj.supabase.co"
const supabaseKey = "YOUR_SUPABASE_ANON_KEY"
const supabase = createClient(supabaseUrl, supabaseKey)
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

.register-form {
  width: 100%;
  max-width: 420px;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.register-form h2 {
  text-align: center;
  margin-bottom: 1rem;
  color: #111827;
  font-size: 2rem;
}

.register-form input {
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 1rem;
  outline: none;
  transition: 0.2s;
}

.register-form input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.register-form button {
  padding: 1rem;
  border: none;
  border-radius: 10px;
  background: #3b82f6;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}

.register-form button:hover {
  background: #2563eb;
}

.register-form button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.message {
  text-align: center;
  color: #374151;
  font-size: 0.95rem;
}

@media (max-width: 500px) {
  .register-form {
    margin: 1rem;
    padding: 2rem;
  }
}
</style>