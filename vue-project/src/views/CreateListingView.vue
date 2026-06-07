<template>
  <main class="container">
    <h1>Create Listing</h1>

    <form @submit.prevent="createListing">
        <input v-model="title" type="text" placeholder="Title" />
        <input v-model="price" type="number" placeholder="Price" />
        <input v-model="location" type="text" placeholder="Location"/>
        <input v-model="imageUrl" type="text" placeholder="Image URL"/>
        <input v-model="createdAt" type="datetime-local" placeholder="Created at (optional)" />

        <textarea v-model="description" placeholder="Description"></textarea>
        <button type="submit">Create Listing</button>
      </form>
    <p v-if="errorMessage">{{ errorMessage }}</p>

  </main>

</template>
<script setup>
import { ref }
from 'vue'
import { supabase }
from '@/supabase'
const title = ref('')
const price = ref('')
const location = ref('')
const imageUrl = ref('')
const createdAt = ref('')
const description = ref('')
const errorMessage = ref('')
async function createListing() {

  if (!title.value || !price.value ) {
    errorMessage.value ='Title and price required'
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

    const { error } = await supabase
      .from('listings')
      .insert([payload])
    if (error) {
      throw error
    }
    title.value = ''
    price.value = ''
    location.value = ''
    imageUrl.value = ''
    description.value = ''
  }
  catch(err) {
    errorMessage.value =
    err.message
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

</style>