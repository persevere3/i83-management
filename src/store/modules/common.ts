import { ref } from "vue"
import store from "@/store"
import { defineStore } from "pinia"

import { type ReadData } from "@/api/store-list/types/store"

export const useCommonStore = defineStore("common", () => {
  const roleList = ref(["super-admin", "branch-admin", "branch-backstage"])
  const role = ref("")

  const storeList = ref<ReadData[]>([])
  const activeStore = ref<{
    id: number
    storeName: string
  }>()

  return { roleList, role, storeList, activeStore }
})

/** 在 setup 外使用 */
export function useCommonStoreHook() {
  return useCommonStore(store)
}
