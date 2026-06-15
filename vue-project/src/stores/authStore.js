import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const profile = ref(null)
  const loading = ref(false)

  const isSignedIn = computed(() => Boolean(user.value))
  const displayName = computed(() => profile.value?.username || user.value?.user_metadata?.username || user.value?.email || 'Guest')
  const profilePicture = computed(() => profile.value?.pfp_url || user.value?.user_metadata?.pfp_url || 'https://i.pinimg.com/236x/71/11/82/711182648b79d448117c2a990c9c9ec9.jpg')

  function syncProfileFromUser(authUser) {
    const metadata = authUser?.user_metadata || {}
    profile.value = {
      username: metadata.username || authUser?.email?.split('@')[0] || 'Guest',
      pfp_url: metadata.pfp_url || 'https://i.pinimg.com/236x/71/11/82/711182648b79d448117c2a990c9c9ec9.jpg',
    }
  }

  async function loadSession() {
    loading.value = true
    try {
      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user ?? null
      if (user.value) {
        syncProfileFromUser(user.value)
      } else {
        profile.value = null
      }
    } finally {
      loading.value = false
    }
  }

  async function loadProfile(userId) {
    if (!userId) {
      profile.value = null
      return
    }

    const authUser = user.value || null
    if (authUser) {
      syncProfileFromUser(authUser)
      return
    }

    profile.value = null
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    user.value = data?.user ?? null
    if (user.value) {
      syncProfileFromUser(user.value)
    }
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
  }

  async function initialize() {
    await loadSession()
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
      if (user.value) {
        syncProfileFromUser(user.value)
      } else {
        profile.value = null
      }
    })
  }

  return {
    user,
    profile,
    loading,
    isSignedIn,
    displayName,
    profilePicture,
    loadSession,
    loadProfile,
    signIn,
    signOut,
    initialize,
  }
})
