<template>
  <main>
    <h1>Thung Ho</h1>
    <section class="listing-grid">
      <ListingCard
        v-for="listing in listingStore.listings"
        :key="listing.id"
        :listing="listing"/>

    </section>
  </main>
</template>

<script setup>

import { onMounted }
from 'vue'
import ListingCard
from '@/components/ListingCard.vue'
import { useListingStore }
from '@/stores/listingStore'

const listingStore = useListingStore()
onMounted(() => {
  listingStore.fetchListings()
})

</script>

<style scoped>
.listing-grid {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
</style>