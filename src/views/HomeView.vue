<template>
  <div class="grid">
    <div class="grid_item">
      <button @click="createParty">create party</button>
    </div>
    <div class="grid_item">
      <details open>
        <summary>friends</summary>
        <ul>
          <li v-for="friend in friends">{{ friend.player_name }} <button @click="sendInvite(friend.player_id)"
              v-if="partycreated">invite</button> </li>
        </ul>
      </details>
      <details>
        <summary>outgoing invites</summary>
        <ul>
          <li v-if="outGoingFriends.length > 0" v-for="outgoing in outGoingFriends">
            {{ outgoing.player_name }}
          </li>
        </ul>
      </details>
      <details>
        <summary>incoming invites</summary>
        <ul>
          <li v-if="incomingFriends.length > 0" v-for="incoming in incomingFriends">
            {{ incoming.player_name }}
          </li>
        </ul>
      </details>

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

let friends = ref([])
let incomingFriends = ref([])
let outGoingFriends = ref([])
let invites = ref([])
let party = ref({})
let partycreated = false
async function createParty() {
  const { data, error } = await supabase
    .from('match')
    .insert()
    .select()
    .single()
  handleError(error)
  partycreated = true
  party.value = data
  subToMatch()
}
const subToMatch = () => {
  supabase.channel('match')
    .on("postgres_changes",
      {
        event: '*',
        schema: 'public',
        table: 'match',
        filter: `id.eq.${party.value.id}`
      },
      (payload) => { party.value = payload }
    )
}
const subToInvites = () => {
  supabase.channel('invite')
    .on("postgres_changes",
      {
        event: '*',
        schema: 'public',
        table: 'invite',
        filter: `receiver_id=eq.${userID}`
      },
      (payload) => { party.value = payload.new }
    )

}
async function sendInvite(id) {
  const { data, error } = await supabase
    .from('invite')
    .insert({
      sender_id: userID,
      receiver_id: id,
      match_id: party.value.id
    })
  handleError(error)

}


const defaultUrl = "https://www.google.com/url?sa=i&url=https%3A%2F%2Fpngtree.com%2Fso%2Fdefault-avatar&psig=AOvVaw1bV6qALq1_v6_brl0i4gxS&ust=1723851338900000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCIjowvmU-IcDFQAAAAAdAAAAABAE"


const getRelationIDs = async () => {

  const { data, error } = await supabase
    .from('relation')
    .select()
    .or(`receiver_id.eq.${userID},sender_id.eq.${userID}`)
  handleError(error)
  return data
}

const getPlayerData = async (id_data) => {

  const { error, data } = await supabase
    .from('player')
    .select()
    .in('player_id', id_data)

  handleError(error)
  return data

}

let userID = session.value.user.id
onMounted(async () => {
  const relations = await getRelationIDs()
  let outgoingIDs = []
  let incomingIDs = []
  let friendIDs = []

  relations.forEach(element => {
    if (element.request === false) {
      if (element.sender_id === userID) { friendIDs.push(element.receiver_id); }
      else friendIDs.push(element.sender_id)
    }
    else {
      if (element.sender_id === userID) outgoingIDs.push(element.receiver_id)
      else incomingIDs.push(element.sender_id)
    }
  });
  const bruh = friendIDs.concat(outgoingIDs, incomingIDs)
  let list = new Set(bruh)
  let playerData = await getPlayerData([...list])

  function resolvePlayers(list_id, to_list) {
    list_id.forEach(element => {
      const index = playerData.findIndex((l) => l.player_id === element)
      to_list.value.push(playerData[index])
    });
  }

  resolvePlayers(outgoingIDs, outGoingFriends)
  resolvePlayers(incomingIDs, incomingFriends)
  resolvePlayers(friendIDs, friends)




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

.player {
  display: block;
  width: 20%;
  height: 20%;
}
</style>