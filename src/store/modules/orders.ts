import { ref } from "vue"
import store from "@/store"
import { defineStore } from "pinia"

import { type OrderSelect, type OrderMeal, type ReadData } from "@/api/order-list/types/order"
import * as Order from "@/api/order-list/"

export const useOrdersStore = defineStore("orders", () => {
  const loading = ref<boolean>(false)
  const orderListData = ref<ReadData[]>([])

  const getOrderData = () => {
    Order.getDataApi()
      .then((res) => {
        res.forEach((item) => {
          item.mealList = JSON.parse(item.mealList).map((item2: OrderMeal) => {
            return {
              id: item2.Id,
              mealName: item2.MealName,
              price: item2.Price,
              count: item2.Count,
              selectList: item2.SelectList.map((item3: OrderSelect) => {
                return {
                  id: item3.Id,
                  selectName: item3.SelectName,
                  showOptionList: item3.ShowOptionList,
                  activeOptionList: item3.ActiveOptionList,
                  max: item3.Max,
                  min: item3.Min
                }
              }),
              note: item2.Note
            }
          })
          const orderTime = new Date(item.orderTime)
          const orderTimeObj: any = {
            year: orderTime.getFullYear(),
            month: orderTime.getMonth() + 1,
            date: orderTime.getDate(),
            hour: orderTime.getHours(),
            minute: orderTime.getMinutes(),
            second: orderTime.getSeconds()
          }
          for (const key in orderTimeObj) {
            if (orderTimeObj[key] < 10) orderTimeObj[key] = "0" + orderTimeObj[key]
          }
          item.orderTime = `${orderTimeObj.year}-${orderTimeObj.month}-${orderTimeObj.date} ${orderTimeObj.hour}:${orderTimeObj.minute}:${orderTimeObj.second}`
        })
        orderListData.value = res.reverse()
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
