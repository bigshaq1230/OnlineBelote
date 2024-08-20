<template>
  <div class="grid">
    <div class="grid_item">
      <div class="flex">
        <div class="player">
          <span v-if="party.value?.p1">
            <p>p1:</p>
             {{ party.value.p1.player_name }}
            <img :src="party.value.p1.avatar_url" alt="">
          </span>
          <span v-else>
            <p>p1</p>
            <img :src="defaultAvatar" alt="">
          </span>
        </div>
      </div>


      <div class="flex" style="gap: 15%;">
        <div class="player">
          <span v-if="party.value?.p3">
          <p>p3:</p> {{ party.value.p3.player_name }}
          <img :src="party.value.p3.avatar_url" alt="">
        </span>
        <span v-else>
          <p>p3</p>
          <img :src="defaultAvatar" alt="">
        </span>
        </div>
        <div class="player">
          <span v-if="party.value?.p4">
          <p>p4:</p> {{ party.value.p4.player_name }}
          <img :src="party.value.p4.avatar_url" alt="">
        </span>
        <span v-else>
          <p>p4</p>
          <img :src="defaultAvatar" alt="">
        </span>
        </div>
      </div>
      <div class="flex">
        <div class="player">
          <span v-if="party.value?.p2">
          <p>p2:</p> {{ party.value.p2.player_name }}
          <img :src="party.value.p2.avatar_url" alt="">
        </span>
        <span v-else>
          <p>p2</p>
          <img :src="defaultAvatar" alt="">
        </span>
        </div>
      </div>
      <button @click="createParty" v-if="partycreated == false">create party</button>
    </div>
    <div class="grid_item">
      <details open>
        <summary>invites</summary>
        <ul>
          <li v-for="i in invites"> {{ i.player.player_name }} invite
            <button @click="handleAcceptInvite(i.match_id, i.invite_id)" v-if="partycreated == false">accept
              invite</button>
          </li>
        </ul>

      </details>
      <details open>
        <summary>friends</summary>
        <input type="text" v-model="inputID"> <button @click="handleAddFriend">Add!</button>
        <ul>
          <li v-for="friend in friends">
            {{ friend.player_name }} <button @click="sendInvite(friend.player_id)" v-if="partycreated">invite</button>
          </li>
        </ul>
      </details>
      <details open>
        <summary>outgoing invites</summary>
        <ul>
          <li v-if="outGoingFriends.length > 0" v-for="outgoing in outGoingFriends">
            {{ outgoing.player_name }}
          </li>
        </ul>
      </details>
      <details open>
        <summary>incoming invites</summary>
        <ul>
          <li v-if="incomingFriends.length > 0" v-for="incoming in incomingFriends">
            {{ incoming.player_name }} <button @click="handleAcceptFriend(incoming.player_id)">Accept!</button>
          </li>
        </ul>
      </details>

    </div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 70% 30%;

}

.grid_item {
  display: block;
}

.flex {
  display: flex;
  justify-content: center;
  gap: 1%;
}
.player img {
  width: 100%;
  height: 80%;
}
.player {
  display: block;
  width: 20%;
  height: 20%;
}
span {
  text-align: center;
}
</style>
<script setup>
import { supabase } from '@/supabase/supabase'
import { onMounted, ref, watch } from 'vue'
import { useData } from '@/stores/data'
import { storeToRefs } from 'pinia'
import { handleError } from '@/func'

const store = useData()
const { session } = storeToRefs(store)
const userID = ref(session.value.user.id)
const inputID = ref("")
const friends = ref([])
const incomingFriends = ref([])
const outGoingFriends = ref([])
const invites = ref([])
const party = ref({})
const partycreated = ref(false)
const defaultAvatar = "https://i.redd.it/i-got-bored-so-i-decided-to-draw-a-random-image-on-the-v0-4ig97vv85vjb1.png?width=1280&format=png&auto=webp&s=7177756d1f393b6e093596d06e1ba539f723264b"
// Add friend function
const handleAddFriend = async () => {
  const { data, error } = await supabase
    .from('relation')
    .insert({
      sender_id: userID.value,
      receiver_id: inputID.value
    })
  handleError(error)
  if (data) {
    console.log("Friend request sent:", data)
    // await getFriends() // Refresh friends list
  }
}

// Accept invite function
const handleAcceptInvite = async (match_id, invite_id) => {
  const { data, error } = await supabase
    .from('match')
    .select(`*,
    p1:player!p1(player_name)
    p2:player!p2(player_name)
    p3:player!p3(player_name)
    p4:player!p4(player_name)
    `)
    .eq('id', match_id)
    .single()
  handleError(error)

  if (data) {
    partycreated.value = true
    party.value = data

    const { error: deleteError } = await supabase
      .from('invite')
      .delete()
      .eq('invite_id', invite_id)
    handleError(deleteError)

    subToMatch()
  }
}

// Accept friend request function
const handleAcceptFriend = async (id) => {
  const { data, error } = await supabase
    .from('relation')
    .update({ request: false })
    .match({
      receiver_id: userID.value,
      sender_id: id
    })
  handleError(error)
  if (data) {
    console.log("Friend request accepted:", data)
    // await getFriends() // Refresh friends list
  }
}

// Create party function
async function createParty() {
  const { data, error } = await supabase
    .from('match')
    .insert({})
    .select()
    .single()
  handleError(error)
  if (data) {
    partycreated.value = true
    party.value = data
    subToMatch()
  }
}

// Subscribe to match changes
const subToMatch = () => {
  const channel = supabase.channel('match')
    .on("postgres_changes",
      {
        event: '*',
        schema: 'public',
        table: 'match',
        filter: `id=eq.${party.value.id}`
      },
      (payload) => {
        console.log("Match update:", payload)
        party.value = payload.new
      }
    )
    .subscribe()
}

// Subscribe to invites
const subToInvites = () => {
  const channel = supabase.channel('invite')
    .on("postgres_changes",
      {
        event: '*',
        schema: 'public',
        table: 'invite',
        filter: `receiver_id=eq.${userID.value}`
      },
      (payload) => {

        console.log("Invite update:", payload)
        if (payload.eventType === 'INSERT') {
          const index = friends.value.findIndex((l) => l.player_id === payload.new.sender_id)
          if (index !== -1) {
            payload.new.player = friends.value[index]
            invites.value.push(payload.new)
          }
          else {
            console.log("bug here 100% tf ??")
            console.log("accepted a match invite but not friends !")
          }
        } else if (payload.eventType === 'DELETE') {
          invites.value = invites.value.filter(invite => invite.invite_id !== payload.old.invite_id)
        } else if (payload.eventType === 'UPDATE') {
          const index = invites.value.findIndex(invite => invite.invite_id === payload.new.invite_id)
          if (index !== -1) {
            invites.value[index] = payload.new
          }
        }
      }
    )
    .subscribe()
}

// Get invites
const getInvites = async () => {
  const { data, error } = await supabase
    .from('invite')
    .select(`
      *,
      player!sender_id(player_name)
    `)
    .eq('receiver_id', userID.value)

  handleError(error)
  console.log(data)
  if (data) {
    invites.value = data
    console.log("get invites: ", data)
  }
}

// Send invite function
async function sendInvite(id) {
  if (!party.value) {
    console.error("No party created yet")
    return
  }
  const { data, error } = await supabase
    .from('invite')
    .insert({
      sender_id: userID.value,
      receiver_id: id,
      match_id: party.value.id
    })
  handleError(error)
  if (data) {
    console.log("Invite sent:", data)
  }
}

// Get relation IDs
const getRelationIDs = async () => {
  const { data, error } = await supabase
    .from('relation')
    .select()
    .or(`receiver_id.eq.${userID.value},sender_id.eq.${userID.value}`)
  handleError(error)
  return data || []
}

// Get player data
const getPlayerData = async (id_data) => {
  const { data, error } = await supabase
    .from('player')
    .select()
    .in('player_id', id_data)
  handleError(error)
  return data || []
}

// Get friends function
const getFriends = async () => {
  const relations = await getRelationIDs()
  let outgoingIDs = []
  let incomingIDs = []
  let friendIDs = []
  relations.forEach(element => {
    if (element.request === false) {
      if (element.sender_id === userID.value) { friendIDs.push(element.receiver_id) }
      else friendIDs.push(element.sender_id)
    }
    else {
      if (element.sender_id === userID.value) outgoingIDs.push(element.receiver_id)
      else incomingIDs.push(element.sender_id)
    }
  })
  const allIDs = [...new Set([...friendIDs, ...outgoingIDs, ...incomingIDs])]
  let playerData = await getPlayerData(allIDs)

  friends.value = playerData.filter(player => friendIDs.includes(player.player_id))
  outGoingFriends.value = playerData.filter(player => outgoingIDs.includes(player.player_id))
  incomingFriends.value = playerData.filter(player => incomingIDs.includes(player.player_id))
}

onMounted(async () => {
  await getFriends()
  await getInvites()
  subToInvites()
})

// Watch for changes in userID
/* NAH
watch(userID, async (newUserID, oldUserID) => {
  if (newUserID !== oldUserID) {
    await getFriends()
    await getInvites()
    subToInvites()
  }
})
*/
</script>

