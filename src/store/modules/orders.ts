import { ref } from "vue"
import store from "@/store"
import { defineStore, storeToRefs } from "pinia"
import { useCommonStore } from "@/store/modules/common"

import * as Order from "@/api/order-list/"
import { type ReadData } from "@/api/order-list/types/order"

import useWebSocket from "@/hooks/useWebSocket"
import { formatDateTime } from "@/utils"

export const useOrdersStore = defineStore("orders", () => {
  const loading = ref<boolean>(false)
  const orderListData = ref<ReadData[]>([])

  const { role, activeStore } = storeToRefs(useCommonStore())

  const receiveOrderNotification = (res: any) => {
    console.log("收到新訂單通知:")
    res.mealList = handleMealListRes(res.mealList)
    res.orderTime = formatDateTime(res.orderTime)
    res.payTime = formatDateTime(res.payTime)

    orderListData.value.unshift(JSON.parse(JSON.stringify(res)))
  }
  const cancelOrderNotification = (res: any) => {
    console.log("取消訂單通知:")
    const index = orderListData.value.findIndex((item) => item.orderId === res.orderId)
    if (index > -1) orderListData.value.splice(index, 1)
  }
  useWebSocket(activeStore.value?.storeName, receiveOrderNotification, cancelOrderNotification)

  const handleMealListRes = (res: any) => {
    return JSON.parse(res).map((item2: any) => {
      return {
        id: item2.Id,
        mealName: item2.MealName,
        price: item2.Price,
        originPrice: item2.OriginPrice,
        mainMeal: item2.MainMeal,
        count: item2.Count,
        selectList: item2.SelectList.map((item3: any) => {
          return {
            id: item3.Id,
            selectName: item3.SelectName,
            showOptionList: item3.ShowOptionList.map((item4: any) => {
              return {
                title: item4.Title,
                price: item4.Price,
                codeName: item4.CodeName
              }
            }),
            activeOptionList: item3.ActiveOptionList.map((item4: any) => {
              return {
                title: item4.Title,
                price: item4.Price,
                codeName: item4.CodeName
              }
            }),
            max: item3.Max,
            min: item3.Min
          }
        }),
        note: item2.Note
      }
    })
  }

  const handleOrderListRes = (res: any) => {
    res.sort((a: any, b: any) => {
      const dateA = new Date(a.orderTime)
      const dateB = new Date(b.orderTime)
      return dateB.getTime() - dateA.getTime()
    })
    res.forEach((item: any) => {
      item.mealList = handleMealListRes(item.mealList)
      item.orderTime = formatDateTime(item.orderTime)
      item.payTime = item.payTime ? formatDateTime(item.payTime) : item.payTime
    })
    return res
  }

  const getOrderData = () => {
    const api = role.value === "branch-backstage" ? Order.getBackstageDataApi : Order.getDataApi
    api()
      .then((res) => {
        orderListData.value = handleOrderListRes(res)
      })
      .catch(() => {
        orderListData.value = []
      })
      .finally(() => {
        loading.value = false
      })
  }

  return { loading, orderListData, getOrderData }
})

/** 在 setup 外使用 */
export function useOrdersStoreHook() {
  return useOrdersStore(store)
}
