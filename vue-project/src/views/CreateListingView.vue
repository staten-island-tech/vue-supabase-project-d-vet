<template>
  <div>
    <header class="top">
      <button type="button" class="brand" @click="goHome">Repertoire</button>
    </header>
    <main class="container">
      <h1>Create Listing</h1>

      <form @submit.prevent="createListing">
        <input v-model="title" type="text" placeholder="Title" />
        <input v-model="price" type="number" placeholder="Price" />
        <input v-model="location" type="text" placeholder="Location" />
        <input v-model="imageUrl" type="text" placeholder="Image URL" />
        <input v-model="createdAt" type="datetime-local" placeholder="Created at (optional)" />

        <textarea v-model="description" placeholder="Description"></textarea>
        <button type="submit">Create Listing</button>
      </form>
      <p v-if="errorMessage">{{ errorMessage }}</p>
    </main>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabase'
const router = useRouter()
function goHome() {
  router.push({ name: 'home' }).catch(() => {})
}
const title = ref('')
const price = ref('')
const location = ref('')
const imageUrl = ref('')
const createdAt = ref('')
const description = ref('')
const errorMessage = ref('')
async function createListing() {
  if (!title.value || !price.value) {
    errorMessage.value = 'Title and price required'
    return
  }
  try {
    const { data, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError

    const user = data?.user
    if (!user) {
      errorMessage.value = 'Please sign in before creating a listing.'
      return
    }

    const payload = {
      title: title.value,
      price: Number(price.value),
      location: location.value,
      image_url: imageUrl.value,
      description: description.value,
      user_id: user.id,
    }
    if (createdAt.value) {
      // convert datetime-local to ISO string
      payload.created_at = new Date(createdAt.value).toISOString()
    }
    if (user.email) {
      payload.poster_email = user.email
      payload.email = user.email
    }

    const { error } = await supabase.from('listings').insert([payload])
    if (error) {
      const fallbackPayload = { ...payload }
      delete fallbackPayload.poster_email
      delete fallbackPayload.email
      const { error: fallbackError } = await supabase.from('listings').insert([fallbackPayload])
      if (fallbackError) {
        throw fallbackError
      }
    }
    title.value = ''
    price.value = ''
    location.value = ''
    imageUrl.value = ''
    description.value = ''
  } catch (err) {
    errorMessage.value = err.message
  }
}
</script>

<style scoped>
.container {
  width: 500px;
  margin: auto;
}
form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

input,
textarea {
  padding: 10px;
}

.top {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
}
.brand {
  font-weight: 700;
  font-size: 18px;
  color: #fff;
  font-family: 'Arial Rounded MT Bold', 'Trebuchet MS', 'Segoe UI', sans-serif;
  background: transparent;
  border: none;
  cursor: pointer;
}
</style>
