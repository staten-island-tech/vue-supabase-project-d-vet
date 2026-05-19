<template>
  <p v-if="error">Error: {{ error }}</p>
    <ul v-else>
      <li v-for="transaction in transactions" :key="transaction.id">
        ID: {{ transaction.id }} | User: {{ transaction.user_id }} | ...
      </li>
    </ul>  
</template>

<script setup >
import { ref, onMounted } from 'vue'
import { supabase } from './supabase'

const transactions = ref([])
const error = ref(null)

onMounted(async () => {
  let { data: transactionData, error: err } = await supabase
    .from('transactions')
    .select('*')
  if (err) {
    error.value = err.message
  } else {
    transactions.value = transactionData
  }
})

</script>

<style scoped>

</style>
