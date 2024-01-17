import { ref } from "vue"
import store from "@/store"
import { defineStore } from "pinia"

import { type ReadData } from "@/api/table-list/types/table"
import * as Table from "@/api/table-list/"

export const useTablesStore = defineStore("tables", () => {
  const loading = ref<boolean>(false)
  const tableListData = ref<ReadData[]>([])

  const getTableData = () => {
    Table.getDataApi()
      .then((res) => {
        tableListData.value = res
      })
      .catch(() => {
        tableListData.value = []
      })
      .finally(() => {
        loading.value = false
      })
  }

  return { loading, tableListData, getTableData }
})

/** 在 setup 外使用 */
export function useTablesStoreHook() {
  return useTablesStore(store)
}
