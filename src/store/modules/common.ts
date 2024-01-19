import { ref } from "vue"
import store from "@/store"
import { defineStore } from "pinia"

export const useCommonStore = defineStore("common", () => {
  const storeList = ref(["全部分店", "復北店", "學府店"])
  const activeStore = ref("全部分店")

  return { storeList, activeStore }
})

/** 在 setup 外使用 */
export function useCommonStoreHook() {
  return useCommonStore(store)
}
