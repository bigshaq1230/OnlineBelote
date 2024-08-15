import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Account from '@/views/Account.vue'
import Authenticate from '@/views/Authenticate.vue'
import Match from '@/views/Match.vue'
import SearchList from '@/components/SearchList.vue'
import PendingList from '@/components/PendingList.vue'
import FriendList from '@/components/FriendList.vue'

const routes = [
  {
    path: '/home',
    component: HomeView,
    children: [
      {
        path: '',
        component: FriendList
      },
      {
        path: 'search',
        component: SearchList
      },
      {
        path: 'pending',
        component: PendingList
      }
    ]
  },
  {
    path: '/account',
    component: Account
  },
  {
    path: '/auth',
    component: Authenticate
  },
  {
    path: '/match/:id',
    name: 'match',
    component: Match
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
