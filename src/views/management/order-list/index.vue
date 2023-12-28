<script lang="ts" setup>
import { reactive, ref, computed, watch } from "vue"

import { storeToRefs } from "pinia"

// import { createTableDataApi, deleteTableDataApi, updateTableDataApi, getTableDataApi } from "@/api/table"
import { type GetOrderData } from "@/api/order-list/types/order"

import { useOrdersStore } from "@/store/modules/orders"

import { type FormInstance, type TableInstance, ElMessage, ElMessageBox } from "element-plus"
// import { type FormInstance, type FormRules, type TableInstance, ElMessage, ElMessageBox } from "element-plus"
import { Refresh, Delete, RefreshRight } from "@element-plus/icons-vue"
// import { Search, Refresh, CirclePlus, Delete, Download, RefreshRight } from "@element-plus/icons-vue"

import { usePagination } from "@/hooks/usePagination"
import { useNumberFormat } from "@/hooks/useNumberFormat"

defineOptions({
  // 命名当前组件
  name: "OrderList"
})

// #region 日期
// 快捷鍵
const shortcuts = [
  {
    text: "Last 1 day",
    value: () => {
      const start = new Date()
      const end = new Date()
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

const activeDateRange = ref<Date[]>([])

const resetDateSearch = () => {
  activeDateRange.value = []
}
// #endregion

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const { thousandsSeparatorFormat } = useNumberFormat()

//#region 删
const handleDelete = (row: GetOrderData) => {
  ElMessageBox.confirm(`正在刪除訂單:${row.id}，確認刪除？`, "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    orderListData.value = orderListData.value.filter((item) => item.id !== row.id)
    ElMessage.success("删除成功")
    getOrderData()
  })
}

const tableRef = ref<TableInstance | null>(null)
const batchDelete = () => {
  const selections = tableRef.value?.getSelectionRows()
  if (!selections.length) return

  ElMessageBox.confirm(`正在批量刪除訂單，確認刪除？`, "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    selections.forEach((element: GetOrderData) => {
      const index = orderListData.value.findIndex((item) => item.id === element.id)
      index > -1 ? orderListData.value.splice(index, 1) : null
    })
    ElMessage.success("删除成功")
    getOrderData()
  })
}
//#endregion

//#region 查
const { orderListData } = storeToRefs(useOrdersStore())
const { getOrderData } = useOrdersStore()

getOrderData()

const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  id: ""
})

const handleSearch = () => {
  paginationData.currentPage === 1 ? getOrderData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

const storeList = reactive(["全部", "復北店", "學府店"])
const activeStore = ref("全部")

const filterOrderListData = computed<GetOrderData[]>(() => {
  const startTime = activeDateRange.value[0]
  const endTime = activeDateRange.value[1]
  let orderList: GetOrderData[] = JSON.parse(JSON.stringify(orderListData.value))
  if (startTime && endTime) {
    orderList = orderList.filter((order: GetOrderData) => {
      const createTime = new Date(order.createTime)
      return createTime >= startTime && createTime <= endTime
    })
  }
  return orderList.filter((item) => item.id.indexOf(searchData.id) > -1)
})
watch(
  filterOrderListData,
  () => {
    paginationData.total = filterOrderListData.value.length
    paginationData.currentPage = 1
  },
  { immediate: true }
)

// startIndex, endIndex => pagefilterOrderListData
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
const pagefilterOrderListData = computed<GetOrderData[]>(() => {
  return filterOrderListData.value.filter((order, index) => index >= startIndex.value && index <= endIndex.value)
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
          <el-input v-model="searchData.id" placeholder="請輸入訂單編號" />
        </el-form-item>
        <el-form-item>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="danger" :icon="Delete" @click="batchDelete()">批量刪除</el-button>
        </div>
        <div>
          <!-- <el-tooltip content="下载">
            <el-button type="primary" :icon="Download" circle />
          </el-tooltip> -->
          <el-tooltip content="刷新當前頁">
            <el-button type="primary" :icon="RefreshRight" circle @click="getOrderData" />
          </el-tooltip>
        </div>
      </div>
      <div class="toolbar-wrapper">
        <div>
          <el-button
            v-for="item in storeList"
            :key="item"
            :type="item === activeStore ? 'success' : 'info'"
            @click="activeStore = item"
          >
            {{ item }}
            (<template v-if="item === '全部'"> {{ orderListData.length }} </template>
            <template v-else> {{ orderListData.filter((item2) => item2.storeName === item).length }} </template>)
          </el-button>
        </div>
      </div>
      <div class="table-wrapper">
        <!-- 必須加 row-key hover sortable 才不會有bug -->
        <el-table ref="tableRef" :data="pagefilterOrderListData" row-key="id">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="id" label="訂單編號" width="200" align="center" />
          <el-table-column label="餐點" align="left">
            <template #default="scope">
              <el-table :data="scope.row.mealList" size="small">
                <el-table-column prop="mealName" label="名稱" width="120" align="center" />
                <el-table-column label="價錢" width="80" align="center">
                  <template #default="scope2"> {{ thousandsSeparatorFormat(scope2.row.price) }} </template>
                </el-table-column>
                <el-table-column prop="quantity" label="數量" width="80" align="center" />
                <el-table-column label="選擇" class="selectList">
                  <template #default="scope2">
                    <!-- {{ scope2.row.activeOptionList?.join("，") }} -->

                    <div v-for="(item, index) in scope2.row.activeOptionList" :key="index">- {{ item }}</div>
                  </template>
                </el-table-column>
                <el-table-column prop="note" label="備註" />
              </el-table>
            </template>
          </el-table-column>
          <el-table-column label="合計" width="100" align="center">
            <template #default="scope"> {{ thousandsSeparatorFormat(scope.row.totalPrice) }} </template>
          </el-table-column>
          <el-table-column prop="createTime" label="成立時間" width="180" align="center" />
          <el-table-column fixed="right" label="操作" width="80" align="center">
            <template #default="scope">
              <el-button type="danger" text bg size="small" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
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
}

.pager-wrapper {
  display: flex;
  justify-content: flex-end;
}
</style>
