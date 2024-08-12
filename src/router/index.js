import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Account from '@/views/Account.vue'
import Authenticate from '@/views/Authenticate.vue'
import Match from '@/views/Match.vue'
import App from '@/App.vue'
import SearchList from '@/components/SearchList.vue'
import PendingList from '@/components/PendingList.vue'
import FriendList from '@/components/FriendList.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      children: [
        {
          path: 'search',
          component: SearchList

        },
        {
          path: 'pending',
          component: PendingList
        },
        {
          path: '',
          component: FriendList
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
      component: Match,
    }
  ]
})

export default router
