<template>
    <GoogleLogin :callback="callback" />
</template>
<script setup>
import { useData } from '@/stores/data';
import { storeToRefs } from 'pinia';
import { supabase } from '@/supabase/supabase';
import router from '@/router';
import { handleError } from '../func';
const store = useData()
const { session, player } = storeToRefs(store)
async function callback(response) {
    try {
        const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: response.credential,
        })
        handleError(error)
        supabase.auth.onAuthStateChange((_, _session) => {
            session.value = _session
        })
        const { error: playerError, data: PlayerData, count } = await supabase.from('player').select('*', { count: 'exact' }).eq('player_id', session.value.user.id)
        handleError(playerError)

        // justs get own player Data
        player.value = PlayerData[0]
        router.replace('/')


    } catch (error) {
        console.error(error.message)
    }

}
</script>