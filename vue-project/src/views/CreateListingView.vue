<template>
  <div>
    <header class="top">
      <button type="button" class="brand" @click="goHome">Repertoire</button>
    </header>
    <main class="container">
      <h1>Create Listing</h1>

      <form @submit.prevent="createListing">
        <input v-model="title" type="text" placeholder="Recipe title" />
        <input v-model="pricePerServing" type="number" placeholder="Price per serving" />
        <input v-model="imageUrl" type="text" placeholder="Image URL" />
        <input v-model="createdAt" type="datetime-local" placeholder="Created at (optional)" />

        <textarea v-model="description" placeholder="Description / recipe notes"></textarea>
        <input v-model="kcalPerServing" type="number" placeholder="Kcal per serving (optional)" />
        <input v-model="proteinPerServing" type="number" placeholder="Protein per serving (g, optional)" />
        <input v-model="carbsPerServing" type="number" placeholder="Carbohydrates per serving (g, optional)" />
        <input v-model="fatPerServing" type="number" placeholder="Fat per serving (g, optional)" />
        <input v-model="fiberPerServing" type="number" placeholder="Fiber per serving (g, optional)" />
        <input v-model="sugarPerServing" type="number" placeholder="Sugar per serving (g, optional)" />
        <input v-model="sodiumPerServing" type="number" placeholder="Sodium per serving (mg, optional)" />
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
const pricePerServing = ref('')
const imageUrl = ref('')
const createdAt = ref('')
const description = ref('')
const kcalPerServing = ref('')
const proteinPerServing = ref('')
const carbsPerServing = ref('')
const fatPerServing = ref('')
const fiberPerServing = ref('')
const sugarPerServing = ref('')
const sodiumPerServing = ref('')
const errorMessage = ref('')
async function createListing() {
  if (!title.value || !pricePerServing.value) {
    errorMessage.value = 'Title and price per serving required'
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
      price_per_serving: Number(pricePerServing.value),
      image_url: imageUrl.value,
      description: description.value,
      user_id: user.id,
    }
    if (kcalPerServing.value) payload.kcal_per_serving = Number(kcalPerServing.value)
    if (proteinPerServing.value) payload.protein_per_serving = Number(proteinPerServing.value)
    if (carbsPerServing.value) payload.carbs_per_serving = Number(carbsPerServing.value)
    if (fatPerServing.value) payload.fat_per_serving = Number(fatPerServing.value)
    if (fiberPerServing.value) payload.fiber_per_serving = Number(fiberPerServing.value)
    if (sugarPerServing.value) payload.sugar_per_serving = Number(sugarPerServing.value)
    if (sodiumPerServing.value) payload.sodium_per_serving = Number(sodiumPerServing.value)
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
    pricePerServing.value = ''
    imageUrl.value = ''
    description.value = ''
    kcalPerServing.value = ''
    proteinPerServing.value = ''
    carbsPerServing.value = ''
    fatPerServing.value = ''
    fiberPerServing.value = ''
    sugarPerServing.value = ''
    sodiumPerServing.value = ''
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
