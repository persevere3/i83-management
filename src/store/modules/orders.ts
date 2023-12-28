import { ref } from "vue"
import store from "@/store"
import { defineStore } from "pinia"

import { type GetOrderData } from "@/api/order-list/types/order"
// import { getOrderDataApi } from "@/api/order-list/"

export const useOrdersStore = defineStore("orders", () => {
  const loading = ref<boolean>(false)
  const orderListData = ref<GetOrderData[]>([])

  const getOrderData = () => {
    loading.value = true
    !orderListData.value.length
      ? (orderListData.value = [
          {
            id: "AE1695368516314274",
            storeName: "復北店",
            mealList: [
              {
                mealName: "海陸雙拼",
                price: 300,
                quantity: 1,
                activeOptionList: ["綜合醬", "沙朗牛", "豬", "牛-五分熟", "麵換蛋"],
                note: "菜加量"
              },
              {
                mealName: "厚切里肌豬排",
                price: 200,
                quantity: 2,
                activeOptionList: ["黑胡椒醬", "麵換菜"],
                note: "菜加量"
              },
              {
                mealName: "沙朗牛排5oz",
                price: 200,
                quantity: 3,
                activeOptionList: ["蘑菇醬", "牛-五分熟"],
                note: "麵加量"
              }
            ],
            totalPrice: 1300,
            createTime: "2023-12-20 15:41:56"
          },
          {
            id: "2",
            storeName: "學府店",
            mealList: [
              {
                mealName: "沙朗牛排5oz",
                price: 300,
                quantity: 1,
                activeOptionList: ["黑胡椒醬", "牛-五分熟", "麵換蛋"],
                note: "qaz"
              },
              {
                mealName: "厚切里肌豬排",
                price: 200,
                quantity: 2,
                note: "wsx"
              },
              {
                mealName: "黃金雞腿排",
                price: 200,
                quantity: 3,
                activeOptionList: ["蘑菇醬", "麵換蛋"],
                note: "edc"
              }
            ],
            totalPrice: 1300,
            createTime: "2023-12-16 15:41:56"
          },
          {
            id: "3",
            storeName: "復北店",
            mealList: [
              {
                mealName: "沙朗牛排5oz",
                price: 300,
                quantity: 1,
                activeOptionList: ["蘑菇醬", "牛-五分熟", "麵換蛋"],
                note: ""
              },
              {
                mealName: "厚切里肌豬排",
                price: 200,
                quantity: 2,
                activeOptionList: ["黑胡椒醬", "麵換蛋"],
                note: ""
              },
              {
                mealName: "黃金雞腿排",
                price: 200,
                quantity: 3,
                note: ""
              }
            ],
            totalPrice: 1300,
            createTime: "2023-11-29 15:41:56"
          },
          {
            id: "4",
            storeName: "學府店",
            mealList: [
              {
                mealName: "雪花沙朗8oz",
                price: 250,
                quantity: 1,
                note: ""
              }
            ],
            totalPrice: 250,
            createTime: "2023-09-29 15:41:56"
          },
          {
            id: "5",
            storeName: "復北店",
            mealList: [
              {
                mealName: "鮭魚排",
                price: 300,
                quantity: 1,
                note: ""
              }
            ],
            totalPrice: 300,
            createTime: "2023-06-29 15:41:56"
          },
          {
            id: "6",
            storeName: "學府店",
            mealList: [
              {
                mealName: "法式羊排",
                price: 200,
                quantity: 1,
                note: ""
              }
            ],
            totalPrice: 200,
            createTime: "2023-01-29 15:41:56"
          }
        ])
      : null
    loading.value = false
  }

  return { loading, orderListData, getOrderData }
})

/** 在 setup 外使用 */
export function useOrdersStoreHook() {
  return useOrdersStore(store)
}
