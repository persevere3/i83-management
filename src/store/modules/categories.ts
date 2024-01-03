import { ref } from "vue"
import store from "@/store"
import { defineStore } from "pinia"

import { type ReadResData } from "@/api/category-list/types/category"
import * as Category from "@/api/category-list/"

import Sortable from "sortablejs"

export const useCategoriesStore = defineStore("categories", () => {
  const loading = ref<boolean>(false)
  const categoryListData = ref<ReadResData>([])

  //#region sort
  const initSort = () => {
    const table: HTMLElement | null = document.querySelector(".el-table__body tbody")
    if (!table) return

    Sortable.create(table, {
      animation: 200, // 拖拽延时，效果更好看
      onEnd: (event: any) => {
        // 进行数据的处理，拖拽实际并不会改变绑定数据的顺序
        const { oldIndex, newIndex } = event
        const currentRow = categoryListData.value?.splice(oldIndex, 1)[0]
        categoryListData.value?.splice(newIndex, 0, currentRow)
      }
    })
  }
  //#endregion

  const getCategoryData = () => {
    loading.value = true
    Category.getDataApi()
      .then((res) => {
        categoryListData.value = res
        const f = false
        if (f) initSort()
      })
      .catch(() => {
        categoryListData.value = []
      })
      .finally(() => {
        loading.value = false
      })
  }

  return { loading, categoryListData, getCategoryData }
})

/** 在 setup 外使用 */
export function useCategoriesStoreHook() {
  return useCategoriesStore(store)
}
