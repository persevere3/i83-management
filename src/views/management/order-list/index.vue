<script lang="ts" setup>
import { ref, reactive, computed, watch } from "vue"
// import { useRouter } from "vue-router"

import { type OrderMeal, type ReadData } from "@/api/order-list/types/order"
import * as Order from "@/api/order-list/"

import { useRoute } from "vue-router"

import { storeToRefs } from "pinia"
import { useCommonStore } from "@/store/modules/common"
import { useMealsStore } from "@/store/modules/meals"
import { useTablesStore } from "@/store/modules/tables"
import { useOrdersStore } from "@/store/modules/orders"
import { useTagsViewStore } from "@/store/modules/tags-view"

import { type FormInstance, type TableInstance, ElMessage, ElMessageBox } from "element-plus"
// import { Refresh, Delete, RefreshRight } from "@element-plus/icons-vue"
import { Refresh, RefreshRight } from "@element-plus/icons-vue"

import { usePagination } from "@/hooks/usePagination"
import { useNumberFormat } from "@/hooks/useNumberFormat"

import OrderMealList from "@/components/OrderMealList/index.vue"

defineOptions({
  // 命名当前组件
  name: "OrderList"
})

const route = useRoute()

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const { thousandsSeparatorFormat } = useNumberFormat()

// const router = useRouter()

// #region 日期
// 快捷鍵
const shortcuts = ref<{ text: string; value: Function }[]>([])
const activeDateRange = ref<any>([])

const resetShortcuts = () => {
  shortcuts.value = [
    {
      text: "Last 1 day",
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 1)
        return [start, end]
      }
    },
    {
      text: "Last 7 days",
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
        return [start, end]
      }
    },
    {
      text: "Last 30 days",
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
        return [start, end]
      }
    },
    {
      text: "Last 90 days",
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
        return [start, end]
      }
    },
    {
      text: "Last 180 days",
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 180)
        return [start, end]
      }
    },
    {
      text: "Last 360 days",
      value: () => {
        const end = new Date()
        const start = new Date()
        start.setTime(start.getTime() - 3600 * 1000 * 24 * 365)
        return [start, end]
      }
    }
  ]

  activeDateRange.value = shortcuts.value[1].value()
}
resetShortcuts()

const resetDateSearch = () => {
  activeDateRange.value = []
}
// #endregion

//#region table
const tableRef = ref<TableInstance | null>(null)

const mealListDialogVisible = ref(false)
const activeMealList = ref()
const activeMealListIndex = ref()

//#endregion

//#region 新增 修改 訂單
const dialogVisible = ref(false)
const tableData = ref<OrderMeal[]>([])
const currentUpdateId = ref<string>()
const activeOrder = computed(() => {
  return orderListData.value.find((item) => item.orderId === currentUpdateId.value)
})

const dialogActiveDeliveryType = ref<string>("")
const dialogActiveStore = ref<string>("")
const dialogActiveTable = ref<string>("")
watch(dialogActiveStore, () => {
  dialogActiveTable.value = ""
})

const openDialog = (row?: ReadData) => {
  if (row) {
    currentUpdateId.value = row.orderId
    dialogActiveDeliveryType.value = deliveryTypeArr[row.deliveryType].label
    dialogActiveStore.value = row.storeName
    setTimeout(() => {
      dialogActiveTable.value = row.tableNumber
    }, 0)
    tableData.value = JSON.parse(JSON.stringify(row.mealList))
  } else {
    currentUpdateId.value = undefined
    if (activeStore.value && activeStore.value.id !== 0) {
      dialogActiveStore.value = activeStore.value.storeName
    } else {
      dialogActiveStore.value = ""
    }
    dialogActiveTable.value = ""
    tableData.value = []
  }
  dialogVisible.value = true
}
const handleConfirm = () => {
  tableData.value = tableData.value.filter((item) => item.id)
  if (!dialogValid.value) return

  if (currentUpdateId.value === undefined) handleCreate()
  else handleUpdate()
}

const addTableData = () => {
  tableData.value.push({
    id: "",
    mealName: "",
    originPrice: 0,
    price: 0,
    count: 1,
    selectList: [],
    note: "",
    mainMeal: false
  })
}

const selectMeal = (index: number) => {
  const meal = mealListData.value.find((item) => item.id === tableData.value[index].id)
  if (!meal) return
  tableData.value[index].mealName = meal.mealName
  tableData.value[index].originPrice = meal.price
  tableData.value[index].price = meal.price
  const selectList = meal.selectList.map((item) => {
    item.showOptionList.sort((a: any, b: any) => a.order - b.order)
    return {
      ...item,
      activeOptionList: []
    }
  })
  tableData.value[index].selectList = JSON.parse(JSON.stringify(selectList))
  tableData.value[index].note = ""
  tableData.value[index].mainMeal = !!meal.mainMeal
}

// const selectOption = (select: any, activeOptionList: string[], option: string) => {
//   const index = activeOptionList.indexOf(option)
//   // +
//   if (index < 0) {
//     activeOptionList.push(option)
//     while (activeOptionList.length > select.max) {
//       activeOptionList.shift()
//     }
//   }
//   // -
//   else activeOptionList.splice(index, 1)
// }

const deleteTableData = (index: number) => {
  tableData.value.splice(index, 1)
}

// dialog 驗證
const selectValidList = computed(() => {
  const mealList: boolean[][] = []
  tableData.value.forEach((item, index: number) => {
    const selectList: boolean[] = []
    item.selectList.forEach((item2, index2: number) => {
      const length = item2.activeOptionList.length
      if (length <= item2.max && length >= item2.min) {
        selectList[index2] = true
      } else {
        selectList[index2] = false
      }
    })
    mealList[index] = selectList
  })
  return mealList
})
const dialogValid = computed(() => {
  let isValid = true

  if (!dialogActiveStore.value || (dialogActiveDeliveryType.value === "內用" && !dialogActiveTable.value)) {
    isValid = false
  }

  if (tableData.value.length < 1) isValid = false

  selectValidList.value.forEach((item) => {
    item.forEach((item2) => {
      if (!item2) isValid = false
    })
  })

  return isValid
})

const handleDeliveryMealList = (mealList: OrderMeal[]) => {
  mealList.forEach((item) => {
    item.price = item.deliveryPrice
    item.selectList.forEach((item2) => {
      item2.activeOptionList.forEach((item3) => {
        item3.price = item3.deliverPrice
      })
    })
  })
}

const computeTotal = (mealList: OrderMeal[]) => {
  let total = 0
  mealList.forEach((item) => {
    item.selectList.forEach((select) => {
      select.activeOptionList.forEach((option) => {
        if (option.price && option.price > 0) {
          total += option.price * Number(item.count)
        }
      })
    })
    total += item.price * Number(item.count)
  })

  return total
}

// 新增訂單
const handleCreate = () => {
  if (dialogActiveDeliveryType.value === "外送") handleDeliveryMealList(tableData.value)

  const reqOrder = {
    storeName: dialogActiveStore.value,
    tableNumber: dialogActiveTable.value,
    deliveryType: deliveryTypeArr.findIndex((item) => item.label === dialogActiveDeliveryType.value),
    birthdayAmount: 0,
    discountAmount: 0,
    birthdayBonus: 0,
    payMethod: String(0),
    total: computeTotal(tableData.value),
    mealList: tableData.value
  }
  ElMessageBox.confirm(`正在新增訂單，確認新增？`, "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      Order.createDataApi(reqOrder).then(() => {
        ElMessage.success("新增成功")
        location.reload()
      })
    })
    .catch(() => {
      ElMessage.error("新增失敗")
    })
    .finally(() => {
      dialogVisible.value = false
    })
}
// 修改訂單
const handleUpdate = () => {
  const resOrder = orderListData.value.find((item) => item.orderId === currentUpdateId.value)
  if (!resOrder) return

  if (dialogActiveDeliveryType.value === "外送") handleDeliveryMealList(tableData.value)

  const reqOrder = {
    orderId: resOrder.orderId,
    storeName: dialogActiveStore.value,
    tableNumber: dialogActiveTable.value,
    deliveryType: deliveryTypeArr.findIndex((item) => item.label === dialogActiveDeliveryType.value),
    birthdayAmount: resOrder.birthdayAmount,
    discountAmount: resOrder.discountAmount,
    birthdayBonus: resOrder.birthdayBonus,
    payMethod: String(resOrder.payMethod),
    total: computeTotal(tableData.value) - resOrder.birthdayAmount - resOrder.discountAmount,
    mealList: tableData.value
  }
  ElMessageBox.confirm(`正在修改訂單:${reqOrder.orderId}，確認修改？`, "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      Order.updateDataApi(reqOrder).then(() => {
        ElMessage.success("修改成功")
        getOrderData()
      })
    })
    .catch(() => {
      ElMessage.error("修改失敗")
    })
    .finally(() => {
      dialogVisible.value = false
    })
}
//#endregion

//#region 删
const handleDelete = (row?: ReadData) => {
  let text = ""
  let ids: string[]
  if (row) {
    text = `正在刪除訂單:${row.orderId}，確認刪除？`
    ids = [row.orderId]
  } else {
    text = `正在批量刪除訂單，確認刪除？`
    const selections = tableRef.value?.getSelectionRows()
    if (!selections.length) return
    ids = selections.map((item: ReadData) => item.orderId)
  }

  ElMessageBox.confirm(text, "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    Order.deleteDataApi(ids).then(() => {
      ElMessage.success("删除成功")
      getOrderData()
    })
  })
}
//#endregion

//#region  狀態
const payMethodArr = [
  {
    label: "現金支付"
  },
  {
    label: "LINEPAY"
  },
  {
    label: "街口支付"
  },
  {
    label: "全支付"
  },
  {
    label: "悠遊卡"
  }
]
const payStatusArr = [
  {
    label: "待付款"
  },
  {
    label: "已付款"
  },
  {
    label: "取消"
  }
]
const orderStatusArr = [
  {
    label: "待付款"
  },
  {
    label: "待確認"
  },
  {
    label: "準備中"
  },
  {
    label: "取消"
  },
  {
    label: "已完成"
  }
]
const deliveryTypeArr = [
  {
    // InHouse
    label: "內用"
  },
  {
    // TakeOut
    label: "外帶"
  },
  {
    // Delivery
    label: "外送"
  }
]

const activeOrderStatus = ref<number>(-1)

const delVisitedView = () => {
  const index = visitedViews.value.findIndex((v) => v.path === route.path)
  if (index !== -1) visitedViews.value.splice(index, 1)
}
const handleConfirmPay = (row: ReadData) => {
  if (!row) return
  ElMessageBox.confirm(`正在修改訂單:${row.orderId}的狀態為已付款，確認修改？`, "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    Order.confirmPayApi(row.orderId).then(() => {
      ElMessage.success("修改成功")
      getOrderData()
      delVisitedView()
    })
  })
}
const handleCancel = (row: ReadData) => {
  if (!row) return

  let text = ""
  let confirmButtonText = ""
  let cancelButtonText = ""

  if (row.payStatus === 0) {
    text = `正在取消訂單:${row.orderId}，確認取消？`
    confirmButtonText = "確定"
    cancelButtonText = "取消"
  } else {
    text = `請先向內場人員確認餐點:${row.orderId}是否開始製作`
    confirmButtonText = "尚未開始製作，確定作廢"
    cancelButtonText = "已經開始製作，取消"
  }
  ElMessageBox.confirm(text, "提示", {
    confirmButtonText,
    cancelButtonText,
    type: "warning"
  }).then(() => {
    Order.cancelDataApi(row.orderId).then(() => {
      ElMessage.success("取消成功")
      getOrderData()
      delVisitedView()
    })
  })
}
//#endregion

//#region 折價券
const handleDiscountCoupon = (row: ReadData) => {
  ElMessageBox.prompt("請輸入金額", "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    inputPattern: /[0-9]*/,
    inputErrorMessage: "Invalid"
  }).then(({ value }) => {
    if (row.payStatus === 0) {
      // 付款前
      updateDiscountCoupon(row, Number(value))
    } else if (row.payStatus === 1) {
      // 付款後
      discountCouponRefund(row.orderId, row.birthdayBonus, Number(value), `折價券: ${value}`)
    }
  })
}

// 付款前，修改訂單
const updateDiscountCoupon = (row: ReadData, bonus: number) => {
  const order: ReadData = JSON.parse(JSON.stringify(row))

  order.payMethod = String(order.payMethod)
  order.discountAmount = bonus
  if (order.originTotal !== order.total) {
    order.mealList.forEach((item) => {
      item.price = item.originPrice
    })
  }
  order.total = computeTotal(order.mealList) - bonus - order.birthdayAmount
  Order.updateDataApi(order)
    .then(() => {
      ElMessage.success("使用折價券成功")
      getOrderData()
    })
    .catch(() => {
      ElMessage.error("使用折價券失敗")
    })
}

// 付款後，折價券退款
const discountCouponRefund = (orderId: string, count: number, bonus: number, remark: string) => {
  Order.birthRefund(orderId, count, bonus, remark)
    .then(() => {
      ElMessage.success("使用折價券成功")
      getOrderData()
      delVisitedView()
    })
    .catch(() => {
      ElMessage.error("使用折價券失敗")
    })
}
//#endregion

//#region 生日優惠
const handleBirthBonus = (row: ReadData) => {
  ElMessageBox.prompt("請輸入生日優惠人數", "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    inputPattern: /[0-9]*/,
    inputErrorMessage: "Invalid"
  }).then(({ value }) => {
    // 取得優惠金額
    Order.getBirthBonusPrice(row.orderId, Number(value))
      .then((res: any) => {
        const count = Number(value)
        const { birthdayBonus: bonus, orderHistoryRemark: remark } = res
        if (row.payStatus === 0) {
          // 付款前
          updateBirthBonus(row, count, bonus)
        } else if (row.payStatus === 1) {
          // 付款後，取得退款金額，再退款
          birthBonusRefund(row.orderId, count, bonus, remark)
        }
      })
      .catch(() => {
        ElMessage.error("4份主餐以上才能使用生日優惠")
      })
  })
}

// 付款前，修改birthdayBonus
const updateBirthBonus = (row: ReadData, count: number, bonus: number) => {
  const order: ReadData = JSON.parse(JSON.stringify(row))

  order.payMethod = String(order.payMethod)
  order.birthdayBonus = count
  console.log(bonus)
  // order.birthdayAmount = bonus
  if (order.originTotal !== order.total) {
    order.mealList.forEach((item) => {
      item.price = item.originPrice
    })
  }
  order.total = computeTotal(order.mealList) - order.discountAmount - bonus

  Order.updateDataApi(order)
    .then(() => {
      ElMessage.success("使用生日優惠成功")
      getOrderData()
    })
    .catch(() => {
      ElMessage.error("使用生日優惠失敗")
    })
}

// 付款後，生日優惠退款
const birthBonusRefund = (orderId: string, count: number, bonus: number, remark: string) => {
  Order.birthRefund(orderId, count, bonus, remark)
    .then(() => {
      ElMessage.success("新增生日優惠成功")
      getOrderData()
      delVisitedView()
    })
    .catch(() => {
      ElMessage.error("新增生日優惠失敗")
    })
}
//#endregion

//#region 查
const { role, storeList, activeStore } = storeToRefs(useCommonStore())

const { mealListData } = storeToRefs(useMealsStore())
const { getMealData } = useMealsStore()
getMealData()

const { tableListData } = storeToRefs(useTablesStore())
const { getTableData } = useTablesStore()
getTableData()

const { loading, orderListData } = storeToRefs(useOrdersStore())
const { getOrderData } = useOrdersStore()
getOrderData()

const { visitedViews } = storeToRefs(useTagsViewStore())

const refresh = () => {
  getOrderData()
  resetShortcuts()
}
//#endregion

//#region 過濾
const searchFormRef = ref<FormInstance>()
const searchData = reactive({
  orderId: ""
})
const resetSearch = () => {
  searchData.orderId = ""
}

const filterListData = computed<ReadData[]>(() => {
  const [startTime, endTime] = activeDateRange.value
  let orderList: ReadData[] = JSON.parse(JSON.stringify(orderListData.value))
  if (startTime) {
    if (endTime)
      orderList = orderList.filter((order: ReadData) => {
        const createTime = new Date(order.orderTime)
        return createTime >= startTime && createTime <= endTime
      })
  }

  return orderList
    .filter((item) => item.orderId.indexOf(searchData.orderId) > -1)
    .filter((item) => activeStore.value?.id === 0 || item.storeName === activeStore.value?.storeName)
    .filter((item) => activeOrderStatus.value === -1 || item.orderStatus === activeOrderStatus.value)
})
watch(
  filterListData,
  () => {
    paginationData.total = filterListData.value.length
    paginationData.currentPage = paginationData.currentPage > paginationData.total ? 1 : paginationData.currentPage
  },
  { immediate: true }
)

// startIndex, endIndex => pagefilterListData
const startIndex = ref(0)
const endIndex = ref(0)
watch(
  [() => paginationData.currentPage, () => paginationData.pageSize],
  () => {
    const current = paginationData.currentPage
    const size = paginationData.pageSize
    startIndex.value = current * size - size
    endIndex.value = startIndex.value + size - 1
  },
  { immediate: true }
)
const pagefilterListData = computed<ReadData[]>(() => {
  return filterListData.value.filter((item, index) => index >= startIndex.value && index <= endIndex.value)
})

const ordersMealsUnitPriceList = ref<number[][]>([])
watch(pagefilterListData, () => {
  ordersMealsUnitPriceList.value = []
  pagefilterListData.value.forEach((order, index) => {
    ordersMealsUnitPriceList.value[index] = []
    order.mealList.forEach((meal, index2) => {
      ordersMealsUnitPriceList.value[index][index2] = 0
      meal.selectList.forEach((select) => {
        select.activeOptionList.forEach((option) => {
          if (option.price && option.price > 0) {
            ordersMealsUnitPriceList.value[index][index2] += option.price
          }
        })
      })
      ordersMealsUnitPriceList.value[index][index2] += meal.price
    })
  })
})
//#endregion
</script>

<template>
  <div class="app-container">
    <el-card class="dateRange">
      <el-form :inline="true">
        <el-form-item prop="mealName" label="日期範圍">
          <el-date-picker
            v-model="activeDateRange"
            type="daterange"
            range-separator="To"
            start-placeholder="Start Date"
            end-placeholder="End Date"
            :shortcuts="shortcuts"
          />
        </el-form-item>
        <el-form-item>
          <el-button :icon="Refresh" @click="resetDateSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="id" label="訂單編號">
          <el-input v-model="searchData.orderId" placeholder="請輸入訂單編號" />
        </el-form-item>
        <el-form-item>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <template v-if="role === 'super-admin'">
            <el-button type="primary" @click="openDialog()">新增訂單</el-button>
          </template>
        </div>
        <div>
          <!-- <el-tooltip content="下载">
            <el-button type="primary" :icon="Download" circle />
          </el-tooltip> -->
          <el-tooltip content="刷新當前頁">
            <el-button type="primary" :icon="RefreshRight" circle @click="refresh" />
          </el-tooltip>
        </div>
      </div>
      <div class="toolbar-wrapper">
        <div>
          <el-button :type="activeOrderStatus === -1 ? 'success' : 'info'" @click="activeOrderStatus = -1">
            全部
          </el-button>
          <el-button
            v-for="(item, index) in orderStatusArr"
            v-show="index !== 2"
            :key="item.label"
            :type="index === activeOrderStatus ? 'success' : 'info'"
            @click="activeOrderStatus = index"
          >
            {{ item.label }}
          </el-button>
        </div>
      </div>
      <div class="table-wrapper">
        <!-- 必須加 row-key hover sortable 才不會有bug -->
        <template v-if="['super-admin', 'branch-admin'].includes(role)">
          <el-table ref="tableRef" :data="pagefilterListData" row-key="orderId">
            <el-table-column label="訂單編號 / 分店桌號" width="120" align="center">
              <template #default="scope">
                <div>{{ scope.row.orderId }}</div>
                <div class="mt-5">{{ scope.row.storeName }} - {{ scope.row.tableNumber }}</div>
              </template>
            </el-table-column>
            <el-table-column label="餐點" align="left">
              <template #default="scope">
                <OrderMealList
                  :mealList="scope.row.mealList"
                  :orderListIndex="scope.$index"
                  :ordersMealsUnitPriceList="ordersMealsUnitPriceList"
                />
              </template>
            </el-table-column>
            <el-table-column label="合計" width="100" align="center">
              <template #default="scope">
                <div>{{ thousandsSeparatorFormat(scope.row.total) }}</div>
                <template v-if="scope.row.discountAmount">
                  <div>折價券優惠({{ thousandsSeparatorFormat(scope.row.discountAmount) }})</div>
                </template>
                <template v-if="scope.row.birthdayAmount">
                  <div>生日優惠({{ thousandsSeparatorFormat(scope.row.birthdayAmount) }})</div>
                </template>
              </template>
            </el-table-column>
            <el-table-column label="訂單狀態" width="100" align="center">
              <template #default="scope">
                <div>成立時間</div>
                <div>{{ scope.row.orderTime }}</div>
                <div class="mt-5">
                  <el-tag
                    :type="
                      scope.row.orderStatus === 0
                        ? 'danger'
                        : scope.row.orderStatus === 3
                        ? 'info'
                        : scope.row.orderStatus === 4
                        ? 'success'
                        : ''
                    "
                    effect="plain"
                    >{{ orderStatusArr[scope.row.orderStatus].label }}</el-tag
                  >
                </div>
              </template>
            </el-table-column>

            <el-table-column label="付款狀態" width="100" align="center">
              <template #default="scope">
                <div>{{ payMethodArr[scope.row.payMethod].label }}</div>
                <div class="mt-5">
                  <el-tag
                    :type="scope.row.payStatus === 0 ? 'danger' : scope.row.payStatus === 1 ? 'success' : 'info'"
                    effect="plain"
                    >{{ payStatusArr[scope.row.payStatus].label }}</el-tag
                  >
                </div>
                <div v-if="scope.row.payOrderId">{{ scope.row.payOrderId }}</div>
                <div v-if="scope.row.payTime">{{ scope.row.payTime }}</div>
              </template>
            </el-table-column>

            <el-table-column fixed="right" label="操作" width="100" align="center">
              <template #default="scope">
                <el-button
                  type="primary"
                  text
                  bg
                  size="small"
                  @click="
                    (activeMealList = scope.row.mealList),
                      (activeMealListIndex = scope.$index),
                      (mealListDialogVisible = true),
                      console.log(scope.row)
                  "
                  >餐點詳情</el-button
                >
                <el-button
                  class="mb-1 mt-5"
                  type="warning"
                  text
                  bg
                  size="small"
                  @click="handleDiscountCoupon(scope.row)"
                  >折價券</el-button
                >
                <el-button
                  v-if="scope.row.birthdayBonus < 1"
                  class="mb-1 mt-5"
                  type="warning"
                  text
                  bg
                  size="small"
                  @click="handleBirthBonus(scope.row)"
                  >生日優惠</el-button
                >
                <el-button
                  v-if="scope.row.payStatus === 0"
                  class="mb-1"
                  type="warning"
                  text
                  bg
                  size="small"
                  @click="openDialog(scope.row)"
                  >修改訂單</el-button
                >
                <el-button
                  v-if="scope.row.payMethod === 0 && scope.row.payStatus === 0"
                  class="mb-1"
                  type="primary"
                  text
                  bg
                  size="small"
                  @click="handleConfirmPay(scope.row)"
                  >確認付款</el-button
                >
                <el-button
                  v-if="scope.row.payStatus === 0"
                  type="info"
                  text
                  bg
                  size="small"
                  @click="handleCancel(scope.row)"
                  >取消</el-button
                >
                <el-button
                  v-if="scope.row.payStatus === 1"
                  type="info"
                  text
                  bg
                  size="small"
                  @click="handleCancel(scope.row)"
                  >作廢</el-button
                >
                <el-button
                  v-if="scope.row.payStatus === 1 || scope.row.payStatus === 2"
                  type="danger"
                  text
                  bg
                  size="small"
                  @click="handleDelete(scope.row)"
                  >刪除(test用)</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </template>
      </div>
      <div class="pager-wrapper">
        <el-pagination
          background
          :layout="paginationData.layout"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.total"
          :page-size="paginationData.pageSize"
          :currentPage="paginationData.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/修改 訂單 -->
    <el-dialog v-model="dialogVisible" :title="currentUpdateId ? '修改訂單' : '新增訂單'" width="70%">
      <div class="toolbar-wrapper">
        <div>
          <el-select v-model="dialogActiveDeliveryType" key-value="label" placeholder="請選擇類型" style="width: 33%">
            <el-option v-for="item in deliveryTypeArr" :key="item.label" :label="item.label" :value="item.label" />
          </el-select>
          <el-select v-model="dialogActiveStore" key-value="id" placeholder="請選擇分店" style="width: 33%">
            <el-option
              v-for="item in storeList"
              :key="item.id"
              v-show="item.id !== 0"
              :label="item.storeName"
              :value="item.storeName"
            />
          </el-select>
          <el-select
            v-if="dialogActiveDeliveryType === '內用'"
            v-model="dialogActiveTable"
            placeholder="請選擇桌號"
            style="width: 33%"
          >
            <el-option
              v-for="item in tableListData"
              :key="item.id"
              v-show="
                item.storeName === dialogActiveStore &&
                (item.enable === 0 ||
                  (item.storeName === activeOrder?.storeName && item.number === activeOrder.tableNumber))
              "
              :label="item.number"
              :value="item.number"
            />
          </el-select>
          <el-input
            v-if="dialogActiveDeliveryType === '外送'"
            v-model="dialogActiveTable"
            placeholder="請輸入外送訂單編號"
            style="width: 33%"
          />

          <span class="selectValid" :class="{ false: !dialogActiveDeliveryType }">請選擇類型</span>
          <span class="selectValid" :class="{ false: !dialogActiveStore }">請選擇分店</span>
          <span class="selectValid" :class="{ false: dialogActiveDeliveryType === '內用' && !dialogActiveTable }"
            >請選擇桌號</span
          >
        </div>
      </div>
      <div class="toolbar-wrapper">
        <div />
        <div>
          <el-button class="mb-1" type="primary" text bg @click="addTableData()">新增餐點</el-button>
        </div>
      </div>

      <!-- 必須加 row-key hover sortable 才不會有bug -->
      <el-table :data="tableData" size="small">
        <el-table-column label="餐點名稱" width="150" align="center">
          <template #default="scope2">
            <el-select v-model="scope2.row.id" placeholder="餐點名稱" @change="selectMeal(scope2.$index)">
              <el-option v-for="item in mealListData" :key="item.id" :label="item.mealName" :value="item.id" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="count" label="數量" width="180" align="center">
          <template #default="scope2">
            <el-input-number v-model="scope2.row.count" :min="1" />
          </template>
        </el-table-column>
        <el-table-column label="選擇" class="selectList">
          <template #default="scope2">
            <template v-for="(item, index) in scope2.row.selectList" :key="item.id">
              <div class="selectName">{{ item.selectName }} (max: {{ item.max }}, min: {{ item.min }})</div>
              <el-checkbox-group v-model="item.activeOptionList">
                <!-- @click="selectOption(item, item.activeOptionList, option)" -->
                <el-checkbox v-for="option in item.showOptionList" :key="option" :label="option" size="small">
                  {{ option.title }} <span v-if="option.price > 0"> (+{{ option.price }}) </span>
                </el-checkbox>
              </el-checkbox-group>
              <div class="selectValid" :class="{ false: !selectValidList[scope2.$index][index] }" type="danger">
                最少選擇 {{ item.min }}，最多選擇 {{ item.max }}
              </div>
            </template>
          </template>
        </el-table-column>
        <el-table-column width="120" label="備註">
          <template #default="scope2"> <el-input v-model="scope2.row.note" type="textarea" /></template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="80" align="center">
          <template #default="scope">
            <el-button class="mb-1" type="danger" text bg size="small" @click="deleteTableData(scope.$index)"
              >刪除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm()">確認</el-button>
      </template>
    </el-dialog>

    <!-- 餐點詳情 -->
    <el-dialog v-model="mealListDialogVisible" title="餐點詳情" width="70%">
      <OrderMealList
        :mealList="activeMealList"
        :orderListIndex="activeMealListIndex"
        :ordersMealsUnitPriceList="ordersMealsUnitPriceList"
      />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.dateRange {
  margin-bottom: 20px;

  .el-form-item {
    margin-bottom: 0;
  }
}

.search-wrapper {
  margin-bottom: 20px;
  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.toolbar-wrapper {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-wrapper {
  margin-bottom: 20px;

  .el-button + .el-button {
    margin-left: 0;
  }
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}

.selectName {
  padding: 0 5px;
  background: #eee;
  color: #555;
}
.selectValid {
  padding: 0 5px;
  color: #f56c6c;
  transition: 0.3s;
  display: none;
  &.false {
    display: block;
  }
}

.mt-5 {
  margin-top: 5px;
}
</style>
