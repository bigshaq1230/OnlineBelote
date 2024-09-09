<script setup>
import {  onMounted, ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { supabase } from './supabase/supabase'
import { useData } from './stores/data'
import { storeToRefs } from 'pinia'
import router from './router'
import { handleError } from './func'

const store = useData()
const { session, player } = storeToRefs(store)

const getownplayer = async() => {
  const { data , error } = await supabase
  .from('player')
  .select()
  .eq('player_id',session.value.user.id).single()
  handleError(error)
  player.value = data
}



onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  session.value = data.session

  supabase.auth.onAuthStateChange((_, _session) => {
    session.value = _session
  })

  if (!session.value) {

    router.push('/auth')
  } else {
    router.push('/home')
  }
  await getownplayer()
})

const signOut = async () => {
  await supabase.auth.signOut()
  localStorage.clear()
  session.value = null
  router.push('/auth')
}
</script>

<template>
  <div v-if="session">
    <ul>
      <li>
        <RouterLink to="/account">Account</RouterLink>
      </li>
      <li>
        <RouterLink to="/home">Home</RouterLink>
      </li>
      <li @click="signOut">
        <RouterLink to="home/">Sign Out!</RouterLink>
      </li>
    </ul>
  </div>
  <RouterView />
</template>

<style scoped>
ul {
  display: flex;
  gap: 5%;
  list-style-type: none;
}

</style>
