<script lang="ts" setup>
import { ref, reactive, computed, watch } from "vue"

import { type ReadData } from "@/api/store-list/types/store"
import * as Store from "@/api/store-list/"

import { storeToRefs } from "pinia"
import { useUserStore } from "@/store/modules/user"
import { useCommonStore } from "@/store/modules/common"

import { type FormInstance, type FormRules, type TableInstance, ElMessage, ElMessageBox } from "element-plus"
import { Refresh, CirclePlus, RefreshRight } from "@element-plus/icons-vue"

import { usePagination } from "@/hooks/usePagination"

defineOptions({
  // 命名当前组件
  name: "StoreList"
})

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region table
const tableRef = ref<TableInstance | null>(null)
//#endregion

//#region 新增/修改 dialog form
const dialogVisible = ref<boolean>(false)

const currentUpdateId = ref<number>()

const formRef = ref<FormInstance>()
const formData = reactive<{
  id: number
  storeName: string
}>({
  id: 0,
  storeName: ""
})
const formRules: FormRules = reactive({
  storeName: [{ required: true, trigger: "blur", message: "請輸入分店名稱" }]
})

const openDialog = (row?: ReadData) => {
  if (row) {
    currentUpdateId.value = row.id
    formData.id = row.id
    formData.storeName = row.storeName
  } else {
    formRef.value?.resetFields()
    currentUpdateId.value = undefined
    formData.id = 0
    formData.storeName = ""
  }
  dialogVisible.value = true
}

const handleConfirm = () => {
  formRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      if (currentUpdateId.value === undefined) handleCreate()
      else handleUpdate()
    } else {
      console.error("表單校驗不通過", fields)
    }
  })
}
//#endregion

//#region 增
const handleCreate = () => {
  Store.createDataApi(formData)
    .then(() => {
      ElMessage.success("新增成功")
      getStoreData()
    })
    .finally(() => {
      dialogVisible.value = false
    })
}
//#endregion

//#region 删
const handleDelete = (row: ReadData) => {
  if (!row.id) return

  ElMessageBox.confirm(`正在刪除分店:${row.storeName}，確認刪除？`, "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    Store.deleteDataApi(row.id)
      .then(() => {
        ElMessage.success("删除成功")
        getStoreData()
      })
      .finally(() => {
        dialogVisible.value = false
      })
  })
}
//#endregion

//#region 改
const handleUpdate = () => {
  if (!currentUpdateId.value) return
  Store.updateDataApi(formData)
    .then(() => {
      ElMessage.success("修改成功")
      getStoreData()
    })
    .finally(() => {
      dialogVisible.value = false
    })
}
//#endregion

//#region 查
const { setSuperAdminStoreList } = useUserStore()
const { storeList } = storeToRefs(useCommonStore())
const loading = ref<boolean>(false)

const getStoreData = () => {
  Store.getDataApi().then((res) => {
    const info = JSON.parse(localStorage.getItem("info") || "")
    info.storeList = res
    localStorage.setItem("info", JSON.stringify(info))
    setSuperAdminStoreList(res)
  })
}
//#endregion

//#region 過濾
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  storeName: ""
})
const resetSearch = () => {
  searchData.storeName = ""
}

const filterListData = computed(() => {
  return storeList.value?.filter((item: ReadData) => item.id !== 0 && item.storeName.indexOf(searchData.storeName) > -1)
})
watch(
  filterListData,
  () => {
    paginationData.total = filterListData.value.length
    paginationData.currentPage = 1
  },
  { immediate: true }
)

// startIndex, endIndex => pagefilterSelectListData
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
const pagefilterListData = computed(() => {
  return filterListData.value?.filter((item, index) => index >= startIndex.value && index <= endIndex.value)
})
//#endregion
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="storeName" label="分店名稱">
          <el-input v-model="searchData.storeName" placeholder="請輸入分店名稱" />
        </el-form-item>
        <el-form-item>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="openDialog()">新增分店</el-button>
          <!-- <el-button type="danger" :icon="Delete" @click="handleDelete()">批量刪除</el-button> -->
        </div>
        <div>
          <!-- <el-tooltip content="下载">
            <el-button type="primary" :icon="Download" circle />
          </el-tooltip> -->
          <el-tooltip content="刷新當前頁">
            <el-button type="primary" :icon="RefreshRight" circle @click="getStoreData()" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <!-- 必須加 row-key hover sortable 才不會有bug -->
        <el-table ref="tableRef" :data="pagefilterListData" row-key="id">
          <!-- <el-table-column type="selection" width="50" align="center" /> -->
          <el-table-column prop="storeName" label="分店名稱" align="center" />
          <el-table-column fixed="right" label="操作" width="150" align="center">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="openDialog(scope.row)">修改</el-button>
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
    <!-- 新增/修改 -->
    <el-dialog v-model="dialogVisible" :title="currentUpdateId === undefined ? '新增分店' : '修改分店'" width="35%">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item prop="name" label="分店名稱">
          <el-input v-model="formData.storeName" placeholder="請輸入分店名稱" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">確認</el-button>
      </template>
    </el-dialog>
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

// .el-form-item__content {
//   div + button {
//     margin-top: 5px;
//   }
// }

.el-input__inner {
  width: 50%;
}
</style>
