import { createRouter, createWebHistory } from 'vue-router'
import CreateListing from '../views/CreateListing.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/createListing',
      name: 'create-listing',
      component: CreateListing,
    },
  ],
})

export default router
