import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useData = defineStore('data', () => {

  let p1 = ref()
  let p2 = ref()
  let p3 = ref()
  let p4 = ref()
  let session = ref()
  let player = ref({
    player_id: "",
    player_name: " ",
    player_birthday: "1-1-2000",
    avatar_url: ""
  })
  let players = ref()
  let matches = ref()



  return {  players, session, matches, player, p1, p2, p3, p4 }
})
