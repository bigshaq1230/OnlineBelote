<template>
    <form @submit.prevent="">
        <label>first name :</label>
        <input type="text" name="" id="" v-model="player.player_name" >
        <br>
        <img :src="player.avatar_url" alt="">
        <br>
        <label for="avatar url">avatar url::: -> </label>
        <input type="text" name="" id="avatar url" v-model="player.avatar_url">
        <br>
        <button @click="updateInfo">update info!</button>
    </form>
</template>



<script setup>
// the user player should have it's own variable
import { supabase } from '@/supabase/supabase';
import { useData } from '@/stores/data';
import { storeToRefs } from 'pinia';
import { handleError } from '../func';
import { ref } from 'vue';
import router from '@/router';
const store = useData()
const { session, player } = storeToRefs(store)
let files = ref([]);

async function updateInfo() {

    player.value.player_id = session.value.user.id
    const { error } = await supabase.from('player').upsert(player.value)
    handleError(error)

    router.replace('/home')
}

</script>
<style>
img {
    width: 100px;
    height: 100px;
}

form {
    border: 2px rgb(79, 52, 52) solid;
}
</style>