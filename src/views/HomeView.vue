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
const { player, session } = storeToRefs(store)
let Friends = ref([])
let outFriends = ref([])
let incomingFriends = ref([])

async function getFriends() {
    const userId = session.value.user.id
    const { data: friends, error } = await supabase
        .from('relation')
        .select(`
    sender:sender_id(*),
    receiver:receiver_id(*)
  `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .eq('request', false);

    if (error) {
        console.error('Error fetching friends:', error);
    } else {
        // Map over the data to extract the friend player details
        const friendDetails = friends.map(relation => {
            // If the user is the sender, the friend is the receiver, and vice versa
            return relation.sender_id === userId ? relation.receiver : relation.sender;
        });
        Friends.value = friendDetails
    }
}

// Usage

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
onMounted(async () => {
    getFriends()
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