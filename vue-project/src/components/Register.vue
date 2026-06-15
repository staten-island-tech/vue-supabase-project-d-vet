<template>
  <div class="register-container">
    <header class="top">
      <button type="button" class="brand" @click="goHome">Thung Ho</button>
    </header>
    <form class="register-form" @submit.prevent="register">
      <h2>Create Account</h2>
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="username" type="text" placeholder="Username" required />
      <input v-model="profilePicture" type="url" placeholder="Profile Picture URL" />
      <input v-model="password" type="password" placeholder="Password" required />
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
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'

const email = ref("")
const username = ref("")
const profilePicture = ref("")
const password = ref("")
const loading = ref(false)
const message = ref("")

const register = async () => {
  loading.value = true
  message.value = ""

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          username: username.value,
          pfp_url: profilePicture.value,
        },
      },
    })

    if (error) {
      message.value = error.message
      console.log(data)
      console.log(error)
      return
    }

    message.value = "Registration successful"
    email.value = ""
    username.value = ""
    profilePicture.value = ""
    password.value = ""
  } finally {
    loading.value = false
  }
}

const router = useRouter()
function goHome() { router.push({ name: 'home' }).catch(() => {}) }
</script>

<style scoped>
.register-container {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.top{ display:flex; justify-content:flex-end; padding:12px 16px; width:100%; position:fixed; top:0; left:0; }
.brand{ font-weight:700; font-size:18px; color:#fff; background:transparent; border:none; cursor:pointer; }

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