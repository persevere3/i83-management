import { ref, onMounted } from "vue"
import store from "@/store"
import { defineStore } from "pinia"

import { type GetSelectData } from "@/api/select-list/types/select"

import Sortable from "sortablejs"

export const useSelectsStore = defineStore("selects", () => {
  const loading = ref<boolean>(false)
  const selectListData = ref<GetSelectData[]>([])

  //#region sort
  const initSort = () => {
    const table: HTMLElement | null = document.querySelector(".el-table__body tbody")
    if (!table) return

    Sortable.create(table, {
      animation: 200, // 拖拽延时，效果更好看
      onEnd: (event: any) => {
        // 进行数据的处理，拖拽实际并不会改变绑定数据的顺序
        const { oldIndex, newIndex } = event
        const currentRow = selectListData.value?.splice(oldIndex, 1)[0]
        selectListData.value?.splice(newIndex, 0, currentRow)
        // console.log(selectListData.value.map((item) => item.mealName))
      }
    })
  }

  onMounted(() => {
    initSort()
  })
  //#endregion

  const getSelectData = () => {
    loading.value = true
    !selectListData.value.length
      ? (selectListData.value = [
          {
            selectName: "醬料",
            optionList: ["黑胡椒醬", "蘑菇醬", "綜合醬", "不加醬"]
          },
          {
            selectName: "熟度",
            optionList: ["牛-三分熟", "牛-五分熟", "牛-七分熟", "牛-全熟"]
          },
          {
            selectName: "肉類",
            optionList: ["豬", "雞", "沙朗牛", "羊", "鱈魚"]
          },
          {
            selectName: "客製化",
            optionList: ["麵換蛋", "麵換菜"]
          }
        ])
      : null
    initSort()
    loading.value = false

    // loading.value = true
    // getTableDataApi({
    //   currentPage: paginationData.currentPage,
    //   size: paginationData.pageSize,
    //   username: searchData.name || undefined
    // })
    //   .then((res) => {
    //     paginationData.total = res.data.total
    //     tableData.value = res.data.list
    //   })
    //   .catch(() => {
    //     tableData.value = []
    //   })
    //   .finally(() => {
    //     loading.value = false
    //   })
  }

  return { loading, selectListData, getSelectData }
})

/** 在 setup 外使用 */
export function useSelectsStoreHook() {
  return useSelectsStore(store)
}
