<template>
  <div class="listing-card">

    <img
      :src="listing.image_url"
      alt="Listing image"
      class="listing-image"/>

    <div class="listing-info">
      <h2>{{ listing.title }}</h2>
      <p class="price" v-if="listing.price_per_serving">
        ${{ listing.price_per_serving }} / serving
      </p>
      <p v-if="listing.time_to_make" class="meta">Time: {{ listing.time_to_make }} minutes</p>
      <p class="created" v-if="createdAt">Added: {{ createdAt }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ listing: Object })

const createdAt = computed(() => {
  const val = props.listing?.created_at
  return val ? new Date(val).toLocaleString() : ''
})

</script>

<style scoped>

.listing-card {
  width: 280px;
  border: 1px solid #ccc;
  border-radius: 10px;
  overflow: hidden;
  background: white;
}

.listing-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
}

.listing-info {
  padding: 12px;
}

.price {
  font-weight: bold;
  font-size: 18px;
}

</style>
