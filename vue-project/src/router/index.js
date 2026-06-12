import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Register from '@/components/Register.vue'
import Login from '@/components/Login.vue'
import CreateListing from '@/views/CreateListingView.vue'
import HumanListing from '@/views/HumanListingView.vue'

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
      component: Register,
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    }, {
      path: '/HumanListing',
      name: 'human-listing',
      component: HumanListing
    }
      , { 
        path: '/CreateListing',
        name: 'create-listing',
        component: CreateListing
       }
  ],
})

export default router
