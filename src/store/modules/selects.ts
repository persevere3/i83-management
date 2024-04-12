import { ref } from "vue"
import store from "@/store"
import { defineStore } from "pinia"

import { type ReadData } from "@/api/select-list/types/select"
import * as Select from "@/api/select-list/"

import Sortable from "sortablejs"

export const useSelectsStore = defineStore("selects", () => {
  const loading = ref<boolean>(false)
  const selectListData = ref<ReadData[]>([])
  const selectOrderObj = ref<any>({})

  //#region sort
  const initSort = () => {
    const table: HTMLElement | null = document.querySelector(".select .el-table__body tbody")
    if (!table) return

    Sortable.create(table, {
      animation: 200, // 拖拽延时，效果更好看
      onEnd: (event: any) => {
        // 进行数据的处理，拖拽实际并不会改变绑定数据的顺序
        const { oldIndex, newIndex } = event
        const currentRow = selectListData.value?.splice(oldIndex, 1)[0]
        selectListData.value?.splice(newIndex, 0, currentRow)

        selectOrderObj.value = {}
        selectListData.value.forEach((item, index) => {
          selectOrderObj.value[item.id] = index
        })

        Select.updateSelectOrderApi(selectOrderObj.value).then((res) => {
          console.log(res)
        })
      }
    })
  }
  //#endregion

  const getSelectData = () => {
    loading.value = true
    Select.getDataApi()
      .then((res) => {
        selectListData.value = res
        selectListData.value.sort((a, b) => a.order - b.order)
        initSort()
      })
      .catch(() => {
        selectListData.value = []
      })
      .finally(() => {
        loading.value = false
      })
  }

  return { loading, selectListData, selectOrderObj, getSelectData }
})

/** 在 setup 外使用 */
export function useSelectsStoreHook() {
  return useSelectsStore(store)
}
