import { ref } from "vue"
import store from "@/store"
import { defineStore } from "pinia"

import { type ReadData } from "@/api/meal-list/types/meal"
import * as Meal from "@/api/meal-list/"

import Sortable from "sortablejs"

export const useMealsStore = defineStore("meals", () => {
  const loading = ref<boolean>(false)
  const mealListData = ref<ReadData[]>([])

  //#region sort
  const initSort = () => {
    const table: HTMLElement | null = document.querySelector(".el-table__body tbody")
    if (!table) return

    Sortable.create(table, {
      animation: 200, // 拖拽延时，效果更好看
      onEnd: (event: any) => {
        // 进行数据的处理，拖拽实际并不会改变绑定数据的顺序
        const { oldIndex, newIndex } = event
        const currentRow = mealListData.value?.splice(oldIndex, 1)[0]
        mealListData.value?.splice(newIndex, 0, currentRow)
      }
    })
  }
  //#endregion

  const getMealData = () => {
    loading.value = true
    Meal.getDataApi()
      .then((res) => {
        if (process.env.NODE_ENV === "development") {
          res.forEach((item) => {
            item.image = "https://preview.uniqcarttest.com" + item.image
          })
        } else {
          res.forEach((item) => {
            item.image = "https://preview.uniqcarttest.com" + item.image
          })
        }
        mealListData.value = res

        const f = false
        if (f) initSort()
      })
      .catch(() => {
        mealListData.value = []
      })
      .finally(() => {
        loading.value = false
      })
  }

  return { loading, mealListData, getMealData }
})

/** 在 setup 外使用 */
export function useMealsStoreHook() {
  return useMealsStore(store)
}
