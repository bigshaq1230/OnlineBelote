<template>
    <div class="grid">
        <div class="grid_item">match</div>
        <div class="grid_item">frinds and request</div>
    </div>
</template>




<script setup>
import { supabase } from '@/supabase/supabase';
import { onMounted, ref } from 'vue';
import { useData } from '@/stores/data';
import { storeToRefs } from 'pinia';
import { handleError } from '@/func';
const store = useData()
const { player,session } = storeToRefs(store)
let Friends = ref([])
let outFriends = ref([])
let incomingFriends = ref([])
const getFriends = async () => {
    console.log(session.value)
    const { data: data, error } = await supabase
        .from('relation')
        .select(`player:player_id!inner(*)`)
        .or(`sender_id.eq.${session.value.user.id},receiver_id.eq.${session.value.user.id}`)
        .eq('request', false);

    handleError(error)

    Friends.value = data
}

const getOutGoingFriendRequest = async () => {
    const { data: data, error } = await supabase
        .from('relation')
        .select(`
    player:receiver_id(*)
  `)
        .eq('sender_id', session.value.user.id)
        .eq('request', true);

    handleError(error)
    outFriends.value = data
}

const getIncomingFriends = async () => {
    const { data: data, error } = await supabase
        .from('relation')
        .select(`
    player:sender_id(*)
  `)
        .eq('receiver_id', session.value.user.id)
        .eq('request', true);

    handleError(error)
    incomingFriends = data

}

onMounted ( async() => {
    setTimeout(() => {
  console.log("Delayed for 1 second.");
}, 1000);
    await getFriends()
} )
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