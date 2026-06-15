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

  /* async function loadWishlist() {
    const userId = await resolveUserId()
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

      if (!wishlistError) {
        const listingIds = (wishlistRows || []).map((row) => row.listing_id).filter(Boolean)
        writeWishlistIds(userId, listingIds)

        if (listingIds.length === 0) {
          wishlistListings.value = []
          return
        }

        const { data: listings, error: listingsError } = await supabase
          .from('listings')
          .select('id,title,price,image_url,description,location,created_at,user_id')
          .in('id', listingIds)

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
        .select('id,title,price,image_url,description,location,created_at,user_id')
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
  } */
  async function loadWishlist() {
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
  }

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

  async function removeFromWishlist(listingId) {
    const userId = await resolveUserId()
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
