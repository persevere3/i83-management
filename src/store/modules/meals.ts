import { ref, onMounted } from "vue"
import store from "@/store"
import { defineStore } from "pinia"

import { type GetMealData } from "@/api/meal-list/types/meal"

import Sortable from "sortablejs"

export const useMealsStore = defineStore("meals", () => {
  const loading = ref<boolean>(false)
  const mealListData = ref<GetMealData[]>([])

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
        // console.log(mealListData.value.map((item) => item.mealName))
      }
    })
  }

  onMounted(() => {
    initSort()
  })
  //#endregion

  const getMealData = () => {
    loading.value = true
    !mealListData.value.length
      ? (mealListData.value = [
          //#region 單打獨鬥
          {
            categoryList: ["單打獨鬥區"],
            mealName: "沙朗牛排5oz",
            origin: "巴拉圭",
            mealTextList: ["醬料擇一", "含義大利麵、蛋、蔬菜"],
            selectList: [
              {
                selectName: "醬料",
                showOptionList: ["黑胡椒醬", "蘑菇醬", "綜合醬"],
                max: 1,
                min: 1
              },
              {
                selectName: "熟度",
                showOptionList: ["牛-五分熟", "牛-七分熟", "牛-全熟"],
                max: 1,
                min: 1
              },
              {
                selectName: "肉類",
                showOptionList: ["豬", "雞"],
                max: 1,
                min: 1
              },
              {
                selectName: "客製化",
                showOptionList: ["麵換蛋", "麵換菜"],
                max: 1,
                min: 0
              }
            ],
            price: 200
          },
          {
            categoryList: ["單打獨鬥區"],
            mealName: "厚切里肌豬排",
            origin: "台灣豬",
            mealTextList: ["醬料擇一", "含義大利麵、蛋、蔬菜"],
            price: 220
          },
          {
            categoryList: ["單打獨鬥區", "分進合擊區"],
            mealName: "海陸雙拼",
            origin: "",
            mealTextList: ["【沙朗牛/豬/雞/羊/鱈魚】擇二", "醬料擇一", "含義大利麵、蛋、蔬菜"],
            price: 300
          },
          {
            categoryList: ["單打獨鬥區"],
            mealName: "黃金雞腿排",
            origin: "美國",
            mealTextList: ["醬料擇一", "含義大利麵、蛋、蔬菜"],
            price: 220
          },
          {
            categoryList: ["單打獨鬥區"],
            mealName: "大比目魚排",
            origin: "冰島",
            mealTextList: ["醬料擇一", "含義大利麵、蛋、蔬菜"],
            price: 220
          },
          {
            categoryList: ["單打獨鬥區"],
            mealName: "厚切沙朗6oz",
            origin: "巴拉圭",
            mealTextList: ["醬料擇一", "含義大利麵、蛋、蔬菜"],
            price: 240
          },
          {
            categoryList: ["單打獨鬥區"],
            mealName: "鮭魚排",
            origin: "智利",
            mealTextList: ["醬料擇一", "含義大利麵、蛋、蔬菜"],
            price: 280
          },
          {
            categoryList: ["單打獨鬥區"],
            mealName: "雪花沙朗8oz",
            origin: "紐西蘭",
            mealTextList: ["醬料擇一", "含義大利麵、蛋、蔬菜"],
            price: 280
          },
          {
            categoryList: ["單打獨鬥區"],
            mealName: "安格斯牛排10oz",
            origin: "紐西蘭",
            mealTextList: ["醬料擇一", "含義大利麵、蛋、蔬菜"],
            price: 350
          },
          {
            categoryList: ["單打獨鬥區"],
            mealName: "菲力牛排8oz",
            origin: "紐西蘭",
            mealTextList: ["醬料擇一", "含義大利麵、蛋、蔬菜"],
            price: 380
          },
          {
            categoryList: ["單打獨鬥區"],
            mealName: "帶骨牛小排8oz",
            origin: "紐西蘭",
            mealTextList: ["醬料擇一", "含義大利麵、蛋、蔬菜"],
            price: 480
          },
          {
            categoryList: ["單打獨鬥區"],
            mealName: "法式羊排",
            origin: "",
            mealTextList: ["醬料擇一", "含義大利麵、蛋、蔬菜"],
            price: 260
          },
          {
            categoryList: ["單打獨鬥區"],
            mealName: "歡樂自助吧",
            origin: "",
            mealTextList: ["濃湯、飲料、麵包、冰淇淋等"],
            price: 100
          },
          //#endregion

          //#region 咖哩飯
          {
            categoryList: ["咖哩飯"],
            mealName: "炸豬排咖哩飯",
            origin: "",
            mealTextList: ["淋上咖哩醬汁的豬排飯，彼此交織著美味的饗宴。(此描述僅供參考)", "含飯、蔬菜、小菜"],
            price: 240
          },
          {
            categoryList: ["咖哩飯"],
            mealName: "炸雞排咖哩飯",
            origin: "",
            mealTextList: ["外酥內嫩的雞排，搭配香氣十足的咖哩醬，美味無比！(此描述僅供參考)", "含飯、蔬菜、小菜"],
            price: 240
          },
          {
            categoryList: ["咖哩飯"],
            mealName: "唐揚雞咖哩飯",
            origin: "",
            mealTextList: ["濃郁的咖哩醬汁，搭配香酥脆的雞肉，必吃的美味料理。(此描述僅供參考)", "含飯、蔬菜、小菜"],
            price: 250
          },
          {
            categoryList: ["咖哩飯"],
            mealName: "起司可樂餅咖哩飯",
            origin: "",
            mealTextList: ["含飯、蔬菜、小菜"],
            price: 260
          },
          {
            categoryList: ["咖哩飯"],
            mealName: "鮮蝦可樂餅咖哩飯",
            origin: "",
            mealTextList: ["含飯、蔬菜、小菜"],
            price: 260
          },
          //#endregion

          //#region 分進合擊
          {
            categoryList: ["分進合擊區"],
            mealName: "厚切沙朗雙拼",
            origin: "",
            mealTextList: ["厚切沙朗、【豬/雞/羊/鱈魚】擇一", "醬料擇一", "含義大利麵、蛋、蔬菜"],
            price: 340
          },
          {
            categoryList: ["分進合擊區"],
            mealName: "帶骨牛小排雙拼",
            origin: "",
            mealTextList: [
              "帶骨牛小排(4盎司，1片，建議全熟)、【豬/雞/羊/鱈魚】擇一",
              "醬料擇一",
              "含義大利麵、蛋、蔬菜"
            ],
            price: 420
          },
          {
            categoryList: ["分進合擊區"],
            mealName: "頂級沙朗16oz",
            origin: "紐西蘭",
            mealTextList: ["醬料擇一", "含義大利麵、蛋、蔬菜"],
            price: 500
          },
          //#endregion

          //#region 米食
          {
            categoryList: ["米食區"],
            mealName: "照燒牛肉飯",
            origin: "美國",
            mealTextList: ["含溏心蛋、蔬菜、小菜"],
            price: 220
          },
          {
            categoryList: ["米食區"],
            mealName: "照燒豬肉飯",
            origin: "台灣-豬五花，西班牙-梅花豬",
            mealTextList: ["含溏心蛋、蔬菜、小菜"],
            price: 200
          },
          {
            categoryList: ["米食區"],
            mealName: "照燒牛排飯",
            origin: "巴拉圭",
            mealTextList: ["含溏心蛋、蔬菜、小菜"],
            price: 200
          },
          {
            categoryList: ["米食區"],
            mealName: "照燒豬排飯",
            origin: "台灣",
            mealTextList: ["含溏心蛋、蔬菜、小菜"],
            price: 220
          },
          {
            categoryList: ["米食區"],
            mealName: "照燒雞腿飯",
            origin: "美國",
            mealTextList: ["含溏心蛋、蔬菜、小菜"],
            price: 220
          },
          //#endregion

          //#region 游擊
          {
            categoryList: ["游擊區"],
            mealName: "酥炸脆薯",
            origin: "",
            mealTextList: ["外皮黃金酥脆、內裡紮實綿密，令人無法抗拒的美妙小點。(此描述僅供參考)"],
            price: 90
          },
          {
            categoryList: ["游擊區"],
            mealName: "檸檬雞柳條",
            origin: "",
            mealTextList: ["口感柔軟，肉質細嫩，每一口都能感受到食材的細膩。(此描述僅供參考)"],
            price: 90
          },
          {
            categoryList: ["游擊區"],
            mealName: "洋蔥圈",
            origin: "",
            mealTextList: ["外皮酥脆、內裡洋蔥的香甜多汁，絕對滿足您的味蕾！(此描述僅供參考)"],
            price: 90
          },
          {
            categoryList: ["游擊區"],
            mealName: "炸雞塊",
            origin: "",
            mealTextList: ["穿上黃金外衣就知道大事不妙了，香酥口感直接征服您。(此描述僅供參考)"],
            price: 90
          },
          {
            categoryList: ["游擊區"],
            mealName: "魷魚圈",
            origin: "",
            mealTextList: ["魷魚的嚼勁十足，搭配著微鹹的風味，十分開胃。(此描述僅供參考)"],
            price: 90
          },
          {
            categoryList: ["游擊區"],
            mealName: "小拼盤",
            origin: "",
            mealTextList: [],
            price: 150
          },
          {
            categoryList: ["游擊區"],
            mealName: "大拼盤",
            origin: "",
            mealTextList: [],
            price: 250
          }
          //#endregion
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

  return { loading, mealListData, getMealData }
})

/** 在 setup 外使用 */
export function useMealsStoreHook() {
  return useMealsStore(store)
}
