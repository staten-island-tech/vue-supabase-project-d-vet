<template>
  <div class="login-card">
    <h2>{{ isSignUp ? 'Create Account' : 'Sign In' }}</h2>

    <form @submit.prevent="submit" class="form">
      <label>
        Email
        <input
          v-model="email"
          type="email"
          required
          autocomplete="username"
        />
      </label>

      <label>
        Password
        <input
          v-model="password"
          type="password"
          required
          :autocomplete="isSignUp ? 'new-password' : 'current-password'"
        />
      </label>

      <button type="submit" :disabled="loading">
        {{
          loading
            ? isSignUp
              ? 'Creating...'
              : 'Signing in...'
            : isSignUp
            ? 'Create Account'
            : 'Sign In'
        }}
      </button>
    </form>

    <p v-if="info" class="success">{{ info }}</p>
    <p v-if="error" class="error">{{ error }}</p>

    <button
      type="button"
      class="link-btn"
      @click="toggleMode"
    >
      {{
        isSignUp
          ? 'Already have an account? Sign In'
          : "Don't have an account? Sign Up"
      }}
    </button>
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
const error = ref('')
const info = ref('')
const isSignUp = ref(false)

function toggleMode() {
  isSignUp.value = !isSignUp.value
  error.value = ''
  info.value = ''
}

async function submit() {
  error.value = ''
  info.value = ''
  loading.value = true

  try {
    if (isSignUp.value) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.value,
        password: password.value
      })

      if (signUpError) throw signUpError

      if (data.user && !data.session) {
        info.value =
          'Account created. Check your email for a confirmation link.'
      } else {
        info.value = 'Account created successfully.'
      }
    } else {
      const { error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.value,
          password: password.value
        })

      if (signInError) throw signInError

      await router.push('/')
      // or:
      // await router.push({ name: 'Home' })
    }
  } catch (err) {
    error.value = err.message || 'Something went wrong.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-card {
  max-width: 400px;
  margin: 50px auto;
  padding: 24px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 20px;
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

label {
  display: flex;
  flex-direction: column;
  font-size: 14px;
}

input {
  margin-top: 5px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

button[type='submit'] {
  padding: 10px;
  border: none;
  border-radius: 6px;
  background: #2563eb;
  color: white;
  cursor: pointer;
}

button[type='submit']:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.link-btn {
  margin-top: 15px;
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  width: 100%;
}

.success {
  color: green;
  margin-top: 10px;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>