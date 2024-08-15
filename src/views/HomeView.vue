<template>
  <div class="grid">
    <div class="grid_item">match</div>
    <div class="grid_item">
      social
      <table>
        <tr>
          <td><RouterLink to="/home/">Friend list</RouterLink></td>
          <td><RouterLink to="search">Search</RouterLink></td>
          <td><RouterLink to="pending">Pending</RouterLink></td>
        </tr>
      </table>
      <!-- Render the active child component here -->
      <RouterView  />
    </div>
  </div>
</template>

<script setup>
import { supabase } from '@/supabase/supabase'
import { onMounted, ref } from 'vue'
import { useData } from '@/stores/data'
import { storeToRefs } from 'pinia'
import { handleError } from '@/func'

const store = useData()
const { session } = storeToRefs(store)
const Friends = ref([])
const incomingFriends = ref([])

const getFriends = async () => {
  const userId = session.value.user.id
  const { data:friends, error:friendsError } = await supabase
  .from('player')
  .select()
  .in('player_id',)
  const { data, error } = await supabase
  .from('relation')
  .select()
  .or(`receiver_id.eq.${userId},sender_id.eq.${userId}`)
  .eq('request',false)
  handleError(error)
  console.log(data)
  Friends.value = data
}


const getIncomingFriends = async () => {
  const { data, error } = await supabase
    .from('relation')
    .select('player:sender_id(*)')
    .eq('receiver_id', session.value.user.id)
    .eq('request', true)

  handleError(error)
  incomingFriends.value = data
}

onMounted(async () => {
  await getFriends()
})
</script>


<style scoped>
.grid {
    display: grid;
    grid-template-columns: 70% 30%;

}

.grid_item {
    display: block;
}
</style>