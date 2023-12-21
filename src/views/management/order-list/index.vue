<script lang="ts" setup>
import { reactive, ref, watch } from "vue"

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
//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getOrderData, { immediate: true })

watch(orderListData, () => {
  paginationData.total = orderListData.value.length
})
</script>

<template>
  <div class="app-container">
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
      <div class="table-wrapper">
        <!-- 必須加 row-key hover sortable 才不會有bug -->
        <el-table ref="tableRef" :data="orderListData" row-key="id">
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
