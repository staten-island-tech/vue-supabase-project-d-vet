<template>
  <RouterView />
  <p v-if="error">Error: {{ error }}</p>
    <ul v-else>
      <li v-for="listing in listings" :key="listing.id">
        ID: {{ listing.id }} | User: {{ listing.user_id }} | ...
      </li>
    </ul>  
</template>

<script setup >
import { ref, onMounted } from 'vue'
import { supabase } from './supabase'

const listings = ref([])
const error = ref(null)

onMounted(async () => {
  let { data: listingData, error: err } = await supabase
    .from('listings')
    .select('*')
  if (err) {
    error.value = err.message
  } else {
    listings.value = listingData
  }
})

</script>

<!-- <template>
  <ul>
    <li v-for="todo in todos" :key="todo.id">{{ todo.name }}</li>
  </ul>
</template>
 -->