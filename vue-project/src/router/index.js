import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Register from '@/components/Register.vue'
import CreateListing from '@/views/CreateListingView.vue'
import HumanListingView from '@/views/HumanListingView.vue'
/* import Login from '@/components/Login.vue' */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/register',
      name: 'register',
      component: Register, },
      {
      path: '/createListing',
      name: 'create-listing',
      component: CreateListing,
    },
    {
      path: '/HumanListings',
      name: 'human-listings',
      component: HumanListingView,
    }
  ],
})

export default router
