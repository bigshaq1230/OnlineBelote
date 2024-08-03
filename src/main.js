import './assets/main.css'

import { createApp } from 'vue'
import { createPinia, storeToRefs } from 'pinia'
import vue3GoogleLogin from 'vue3-google-login'
import { supabase } from './supabase/supabase'
import App from './App.vue'
import router from './router'
import { useData } from './stores/data'


const app = createApp(App)
app.use(createPinia())
const store = useData()
const { session } = storeToRefs(store)

await supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
})
supabase.auth.onAuthStateChange((_, _session) => {
    session.value = _session
  })
app.use(router)
app.use(vue3GoogleLogin, {
    clientId: import.meta.env.VITE_GOOGLE_API_KEY
})
app.mount('#app')
