import { defineStore }
from 'pinia'
import { ref }
from 'vue'
import { supabase }
from '@/services/supabase'
export const useListingStore =
defineStore('listingStore', () => {
  const listings = ref([])
  async function fetchListings() {

    const { data, error } =
    await supabase
      .from('listings')
      .select('*')

    if (!error) {
      listings.value = data
    }
  }
  return {
    listings,
    fetchListings }
})