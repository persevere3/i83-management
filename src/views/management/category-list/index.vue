<script lang="ts" setup>
import { ref, reactive, computed, watch } from "vue"

import { type ReadData } from "@/api/category-list/types/category"
import * as Category from "@/api/category-list/"

import { storeToRefs } from "pinia"
import { useCategoriesStore } from "@/store/modules/categories"
import { useMealsStore } from "@/store/modules/meals"

import { type FormInstance, type FormRules, type TableInstance, ElMessage, ElMessageBox } from "element-plus"
import { Refresh, CirclePlus, Delete, RefreshRight } from "@element-plus/icons-vue"

import { usePagination } from "@/hooks/usePagination"

defineOptions({
  // 命名当前组件
  name: "CategoryList"
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
  name: string
  text: string
  mealList: number[]
}>({
  name: "",
  text: "",
  mealList: []
})
const formRules: FormRules = reactive({
  name: [{ required: true, trigger: "blur", message: "請輸入類別名稱" }],
  text: [{ required: false, trigger: "blur", message: "請輸入類別說明" }]
})

const openDialog = (row?: ReadData) => {
  if (row) {
    currentUpdateId.value = row.id
    formData.name = row.name
    formData.text = row.text
    formData.mealList = row.products.map((item) => item.id)
  } else {
    formRef.value?.resetFields()
    currentUpdateId.value = undefined
    formData.name = ""
    formData.text = ""
    formData.mealList = []
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
  Category.createDataApi({
    id: 0,
    name: formData.name,
    text: formData.text,
    products: formData.mealList
  })
    .then(() => {
      ElMessage.success("新增成功")
      resetData()
    })
    .finally(() => {
      dialogVisible.value = false
    })
}
//#endregion

//#region 删
const handleDelete = (row?: ReadData) => {
  let text = ""
  let ids: number[]
  if (row) {
    text = `正在刪除分類:${row.name}，確認刪除？`
    ids = [row.id]
  } else {
    text = `正在批量刪除分類，確認刪除？`
    const selections = tableRef.value?.getSelectionRows()
    if (!selections.length) return
    ids = selections.map((item: ReadData) => item.id)
  }

  ElMessageBox.confirm(text, "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    Category.deleteDataApi(ids)
      .then(() => {
        ElMessage.success("删除成功")
        resetData()
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
  Category.updateDataApi({
    id: currentUpdateId.value,
    name: formData.name,
    text: formData.text,
    products: formData.mealList
  })
    .then(() => {
      ElMessage.success("修改成功")
      resetData()
    })
    .finally(() => {
      dialogVisible.value = false
    })
}
//#endregion

//#region 查
const { loading, categoryListData } = storeToRefs(useCategoriesStore())
const { getCategoryData } = useCategoriesStore()
getCategoryData()

const { mealListData } = storeToRefs(useMealsStore())
const { getMealData } = useMealsStore()
getMealData()

const resetData = () => {
  getCategoryData()
  getMealData()
}
//#endregion

//#region 過濾
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  name: ""
})
const resetSearch = () => {
  searchData.name = ""
}

const filterListData = computed<ReadData[]>(() => {
  return categoryListData.value.filter((item) => item.name.indexOf(searchData.name) > -1)
})
watch(
  filterListData,
  () => {
    paginationData.total = filterListData.value.length
    paginationData.currentPage = 1
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
//#endregion
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="name" label="分類名稱">
          <el-input v-model="searchData.name" placeholder="請輸入分類名稱" />
        </el-form-item>
        <el-form-item>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="openDialog()">新增分類</el-button>
          <el-button type="danger" :icon="Delete" @click="handleDelete()">批量刪除</el-button>
        </div>
        <div>
          <!-- <el-tooltip content="下载">
            <el-button type="primary" :icon="Download" circle />
          </el-tooltip> -->
          <el-tooltip content="刷新當前頁">
            <el-button type="primary" :icon="RefreshRight" circle @click="resetData()" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <!-- 必須加 row-key hover sortable 才不會有bug -->
        <el-table ref="tableRef" :data="pagefilterListData" row-key="id">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="name" label="分類名稱" align="center" />
          <el-table-column prop="text" label="分類說明" align="left" />
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
    <el-dialog v-model="dialogVisible" :title="currentUpdateId === undefined ? '新增分類' : '修改分類'" width="35%">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item prop="name" label="分類名稱">
          <el-input v-model="formData.name" placeholder="請輸入分類名稱" />
        </el-form-item>
        <el-form-item prop="text" label="分類說明">
          <el-input v-model="formData.text" placeholder="請輸入分類說明" />
        </el-form-item>
        <el-form-item prop="" label="分類餐點">
          <el-select v-model="formData.mealList" multiple placeholder="分類餐點" style="width: 100%">
            <el-option v-for="item in mealListData" :key="item.id" :label="item.mealName" :value="item.id" />
          </el-select>
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
</style>
