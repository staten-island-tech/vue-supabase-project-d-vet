import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/supabase'

export const useWishlistStore = defineStore('wishlist', () => {
  const wishlistListings = ref([])
  const loading = ref(false)
  const error = ref('')

  const authStore = useAuthStore()

  async function loadWishlist() {
    const userId = authStore.user?.id
    if (!userId) {
      wishlistListings.value = []
      return
    }

    loading.value = true
    error.value = ''

    try {
      const { data: wishlistRows, error: wishlistError } = await supabase
        .from('wishlist')
        .select('listing_id')
        .eq('user_id', userId)

      if (wishlistError) {
        throw wishlistError
      }

      const listingIds = (wishlistRows || []).map((row) => row.listing_id).filter(Boolean)

      if (listingIds.length === 0) {
        wishlistListings.value = []
        return
      }

      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('id,title,price,image_url,description,location,created_at,poster_email,email,user_id')
        .in('id', listingIds)

      if (listingsError) {
        throw listingsError
      }

      wishlistListings.value = listings || []
    } catch (err) {
      error.value = err?.message || 'Unable to load wishlist'
      wishlistListings.value = []
    } finally {
      loading.value = false
    }
  }

  async function addToWishlist(listingId) {
    const userId = authStore.user?.id
    if (!userId || !listingId) return false

    try {
      const { error: insertError } = await supabase.from('wishlist').insert({
        user_id: userId,
        listing_id: listingId,
      })

      if (insertError) {
        if (/duplicate|already/i.test(insertError.message || '')) {
          return false
        }
        throw insertError
      }

      await loadWishlist()
      return true
    } catch (err) {
      error.value = err?.message || 'Unable to add to wishlist'
      return false
    }
  }

  async function removeFromWishlist(listingId) {
    const userId = authStore.user?.id
    if (!userId || !listingId) return false

    try {
      const { error: deleteError } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('listing_id', listingId)

      if (deleteError) throw deleteError

      await loadWishlist()
      return true
    } catch (err) {
      error.value = err?.message || 'Unable to remove from wishlist'
      return false
    }
  }

  function hasListing(listingId) {
    return wishlistListings.value.some((item) => item.id === listingId)
  }

  return {
    wishlistListings,
    loading,
    error,
    loadWishlist,
    addToWishlist,
    removeFromWishlist,
    hasListing,
  }
})
