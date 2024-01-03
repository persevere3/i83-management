<script lang="ts" setup>
import { ref, reactive, computed, watch } from "vue"

import { type ReadResData } from "@/api/category-list/types/category"
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

const currentUpdateId = ref<number>(null)

const formRef = ref<FormInstance | null>(null)
const formData = reactive<{
  categoryName: string
  categoryText: string
  categoryMeals: ReadCategoryData[]
}>({
  categoryName: "",
  categoryText: "",
  categoryMeals: []
})
const formRules: FormRules = reactive({
  categoryName: [{ required: true, trigger: "blur", message: "請輸入類別名稱" }],
  categoryText: [{ required: false, trigger: "blur", message: "請輸入類別說明" }]
})

const openDialog = (category?: GetCategoryData) => {
  if (category) {
    currentUpdateId.value = category.id
    formData.categoryName = category.name
    formData.categoryText = category.text
    formData.categoryMeals = category.products
  } else {
    currentUpdateId.value = undefined
    formData.categoryName = ""
    formData.categoryText = ""
    formData.categoryMeals = []
    formRef.value?.resetFields()
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
    name: formData.categoryName,
    text: formData.categoryText
  })
    .then(() => {
      ElMessage.success("新增成功")
      getCategoryData()
    })
    .finally(() => {
      dialogVisible.value = false
    })
}
//#endregion

//#region 删
const handleDelete = (row: Category.ReadData) => {
  let text = ""
  let ids: string[]
  if (row) {
    text = `正在刪除分類:${row.name}，確認刪除？`
    ids = [row.id]
  } else {
    text = `正在批量刪除分類，確認刪除？`
    const selections = tableRef.value?.getSelectionRows()
    if (!selections.length) return
    ids = selections.map((item) => item.id)
  }

  ElMessageBox.confirm(text, "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    Category.deleteDataApi(ids)
      .then(() => {
        ElMessage.success("删除成功")
        getCategoryData()
      })
      .finally(() => {
        dialogVisible.value = false
      })
  })
}
//#endregion

//#region 改
const handleUpdate = () => {
  Category.updateDataApi({
    id: currentUpdateId.value,
    name: formData.categoryName,
    text: formData.categoryText
  })
    .then(() => {
      ElMessage.success("修改成功")
      getCategoryData()
    })
    .finally(() => {
      dialogVisible.value = false
    })
}
//#endregion

//#region 查
const { loading: categoryLoading, categoryListData } = storeToRefs(useCategoriesStore())
const { getCategoryData } = useCategoriesStore()
getCategoryData()

const { mealListData } = storeToRefs(useMealsStore())
const { getMealData } = useMealsStore()
getMealData()
//#endregion

//#region 過濾
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  categoryName: ""
})
const resetSearch = () => {
  searchData.categoryName = ""
  // searchFormRef.value?.resetFields()
}

const filterCategoryListData = computed<Category.ReadResData>(() => {
  return categoryListData.value.filter((item) => item.name.indexOf(searchData.categoryName) > -1)
})
watch(
  filterCategoryListData,
  () => {
    paginationData.total = filterCategoryListData.value.length
    paginationData.currentPage = 1
  },
  { immediate: true }
)

// startIndex, endIndex => pagefilterCategoryListData
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
const pagefilterCategoryListData = computed<ReadResData>(() => {
  return filterCategoryListData.value.filter((category, index) => index >= startIndex.value && index <= endIndex.value)
})
//#endregion
</script>

<template>
  <div class="app-container">
    <el-card v-loading="categoryLoading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="name" label="分類名稱">
          <el-input v-model="searchData.categoryName" placeholder="請輸入分類名稱" />
        </el-form-item>
        <el-form-item>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="categoryLoading" shadow="never">
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
            <el-button type="primary" :icon="RefreshRight" circle @click="getCategoryData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <!-- 必須加 row-key hover sortable 才不會有bug -->
        <el-table ref="tableRef" :data="pagefilterCategoryListData" row-key="id">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="name" label="分類名稱" align="center" />
          <el-table-column prop="text" label="分類說明" align="left" />
          <!-- <el-table-column prop="status" label="狀態" align="center">
            <template #default="scope">
              <el-tag v-if="!scope.row.isShow" type="success" effect="plain">啟用</el-tag>
              <el-tag v-else type="danger" effect="plain">禁用</el-tag>
            </template>
          </el-table-column> -->
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
        <el-form-item prop="categoryName" label="分類名稱">
          <el-input v-model="formData.categoryName" placeholder="請輸入分類名稱" />
        </el-form-item>
        <el-form-item prop="categoryText" label="分類說明">
          <el-input v-model="formData.categoryText" placeholder="請輸入分類說明" />
        </el-form-item>
        <el-form-item prop="" label="分類餐點">
          <el-select v-model="formData.categoryMeals" multiple placeholder="分類餐點" style="width: 100%">
            <el-option v-for="item in mealListData" :key="item.id" :label="item.mealName" :value="item" />
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
