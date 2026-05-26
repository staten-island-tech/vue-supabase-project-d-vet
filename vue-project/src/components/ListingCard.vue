<template>
  <div class="listing-card">

    <img
      :src="listing.image_url"
      alt="Listing image"
      class="listing-image"/>

    <div class="listing-info">
      <h2>{{ listing.title }}</h2>
      <p class="price">${{ listing.price }}</p>
      <p>{{ listing.location }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  listing: Object
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
