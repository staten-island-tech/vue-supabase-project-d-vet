import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/supabase'

function getWishlistStorageKey(userId) {
  return `wishlist:${userId || 'guest'}`
}

function readWishlistIds(userId) {
  if (!userId) return []
  try {
    const raw = localStorage.getItem(getWishlistStorageKey(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeWishlistIds(userId, ids) {
  if (!userId) return
  try {
    localStorage.setItem(getWishlistStorageKey(userId), JSON.stringify(ids))
  } catch {
    // Ignore storage issues so the app still runs.
  }
}

export const useWishlistStore = defineStore('wishlist', () => {
  const wishlistListings = ref([])
  const loading = ref(false)
  const error = ref('')

  const authStore = useAuthStore()

  async function resolveUserId() {
    const storeUserId = authStore.user?.id
    if (storeUserId) return storeUserId

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (!error && user?.id) return user.id
    return null
  }

  async function loadWishlist() {
    const userId = await resolveUserId()
    console.log('AUTH STORE USER', authStore.user)
    console.log('RESOLVED USER ID', userId)
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
      console.log('wishlistRows', wishlistRows)
      console.log('wishlistError', wishlistError)
      if (!wishlistError) {
        const listingIds = (wishlistRows || []).map((row) => row.listing_id).filter(Boolean)
        writeWishlistIds(userId, listingIds)

        if (listingIds.length === 0) {
          wishlistListings.value = []
          return
        }

        const { data: listings, error: listingsError } = await supabase
          .from('listings')
          .select('id,title,ingredients,price_per_serving,time_to_make,image_url,description,created_at,user_id,kcal_per_serving,protein_per_serving,carbs_per_serving,fat_per_serving,fiber_per_serving,sugar_per_serving,sodium_per_serving')
          .in('id', listingIds)
        console.log('listingIds', listingIds)
        console.log('listings', listings)
        console.log('listingsError', listingsError)
        if (!listingsError) {
          wishlistListings.value = listings || []
          return
        }
      }

      const fallbackIds = readWishlistIds(userId)
      if (fallbackIds.length === 0) {
        wishlistListings.value = []
        return
      }

      const { data: fallbackListings, error: fallbackError } = await supabase
        .from('listings')
        .select('id,title,ingredients,price_per_serving,time_to_make,image_url,description,created_at,user_id,kcal_per_serving,protein_per_serving,carbs_per_serving,fat_per_serving,fiber_per_serving,sugar_per_serving,sodium_per_serving')
        .in('id', fallbackIds)

      if (!fallbackError) {
        wishlistListings.value = fallbackListings || []
      } else {
        wishlistListings.value = []
      }
    } catch (err) {
      error.value = err?.message || 'Unable to load wishlist'
      wishlistListings.value = []
    } finally {
      loading.value = false
    }
  }
/*   async function loadWishlist() {
    console.log('LOAD WISHLIST CALLWS')
    const userId = await resolveUserId()

    if (!userId) {
      wishlistListings.value = []
      return
    }

    loading.value = true

    try {
      const { data: wishlistRows, error } = await supabase
        .from('wishlist')
        .select(
          `
        listing_id,
        listings (*)
      `,
        )
        .eq('user_id', userId)

      if (error) throw error

      wishlistListings.value = wishlistRows?.map((row) => row.listings).filter(Boolean) || []
    } catch (err) {
      console.error(err)
      wishlistListings.value = []
    } finally {
      loading.value = false
    }
  } */

  async function addToWishlist(listingId) {
    const userId = await resolveUserId()
    if (!userId || !listingId) return false

    try {
      const { error: insertError } = await supabase.from('wishlist').insert({
        user_id: userId,
        listing_id: listingId,
      })

      if (insertError && !/duplicate|already/i.test(insertError.message || '')) {
        throw insertError
      }

      await loadWishlist()
      return true
    } catch (err) {
      error.value = err?.message || 'Unable to add to wishlist'
      return false
    }
  }

/*   async function removeFromWishlist(listingId) {
    const userId = await resolveUserId()
    if (!userId || !listingId) return false

    try {
      const { error: deleteError } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('listing_id', listingId)

      if (deleteError) throw deleteError */
      async function removeFromWishlist(listingId) {
  const userId = await resolveUserId()

  if (!userId || !listingId) return false

  try {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .match({
        user_id: userId,
        listing_id: listingId,
      })

    if (error) {
      console.error(error)
      throw error
    }

    wishlistListings.value =
      wishlistListings.value.filter(
        item => item.id !== listingId
      )

    return true
  } catch (err) {
    console.error(err)
    error.value = err?.message || 'Unable to remove from wishlist'
    return false
  }
}

/*       await loadWishlist()
      return true
    } catch (err) {
      error.value = err?.message || 'Unable to remove from wishlist'
      return false
    }
  } */

  function hasListing(listingId) {
    return wishlistListings.value.some((item) => item.id === listingId)
  }

  watch(
    () => authStore.user?.id,
    async (userId) => {
      if (userId) {
        await loadWishlist()
      } else {
        wishlistListings.value = []
      }
    },
    { immediate: true },
  )

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
