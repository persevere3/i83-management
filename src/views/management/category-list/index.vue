<script lang="ts" setup>
import { reactive, ref, computed, watch, onMounted } from "vue"

import { storeToRefs } from "pinia"

// import { createTableDataApi, deleteTableDataApi, updateTableDataApi, getTableDataApi } from "@/api/table"
import { type GetCategoryData } from "@/api/category-list/types/category"

import { useMealsStore } from "@/store/modules/meals"

import { type FormInstance, type FormRules, type TableInstance, ElMessage, ElMessageBox } from "element-plus"
import { Refresh, CirclePlus, Delete, RefreshRight } from "@element-plus/icons-vue"
// import { Search, Refresh, CirclePlus, Delete, Download, RefreshRight } from "@element-plus/icons-vue"

import { usePagination } from "@/hooks/usePagination"

import Sortable from "sortablejs"

defineOptions({
  // 命名当前组件
  name: "CategoryList"
})

const { mealListData } = storeToRefs(useMealsStore())
const { getMealData } = useMealsStore()

getMealData()

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 增
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const formData = reactive<{
  categoryName: string
  categoryText: string
  categoryMeals: string[]
}>({
  categoryName: "",
  categoryText: "",
  categoryMeals: []
})
const formRules: FormRules = reactive({
  categoryName: [{ required: true, trigger: "blur", message: "请输入類別名稱" }],
  categoryText: [{ required: true, trigger: "blur", message: "请输入類別說明" }]
})
const handleCreate = () => {
  // fields ???
  formRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      if (currentUpdateId.value === undefined) {
        categoryListData.value.push(JSON.parse(JSON.stringify(formData)))

        mealListData.value.forEach((meal) => {
          const formDataIndex = formData.categoryMeals.indexOf(meal.mealName)
          // 餐點在分類中
          if (formDataIndex > -1) {
            meal.categoryList.push(formData.categoryName)
          }
        })

        ElMessage.success("新增成功")
        getCategoryData()
        dialogVisible.value = false

        // createTableDataApi(formData)
        //   .then(() => {
        //     ElMessage.success("新增成功")
        //     getTableData()
        //   })
        //   .finally(() => {
        //     dialogVisible.value = false
        //   })
      } else {
        const index = categoryListData.value.findIndex((item) => item.categoryName === currentUpdateId.value)
        index > -1 ? (categoryListData.value[index] = JSON.parse(JSON.stringify(formData))) : null

        mealListData.value.forEach((meal) => {
          const formDataIndex = formData.categoryMeals.indexOf(meal.mealName)
          const mealIndex = meal.categoryList.indexOf(formData.categoryName)
          // 餐點在分類中
          if (formDataIndex > -1) {
            // 餐點沒有標記此分類
            if (mealIndex < 0) {
              meal.categoryList.push(formData.categoryName)
            }
          } else {
            if (mealIndex > -1) {
              meal.categoryList.splice(mealIndex, 1)
            }
          }
        })
        ElMessage.success("修改成功")
        getCategoryData()
        dialogVisible.value = false

        // updateTableDataApi({
        //   id: currentUpdateId.value,
        //   username: formData.username
        // })
        //   .then(() => {
        //     ElMessage.success("修改成功")
        //     getTableData()
        //   })
        //   .finally(() => {
        //     dialogVisible.value = false
        //   })
      }
    } else {
      console.error("表單校驗不通過", fields)
    }
  })
}
const resetForm = () => {
  currentUpdateId.value = undefined
  formData.categoryName = ""
  formData.categoryText = ""
  formData.categoryMeals = []
  formRef.value?.resetFields()
}
//#endregion

//#region 删
const handleDelete = (row: GetCategoryData) => {
  ElMessageBox.confirm(`正在刪除分類:${row.categoryName}，確認刪除？`, "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    categoryListData.value = categoryListData.value.filter((item) => item.categoryName !== row.categoryName)
    ElMessage.success("删除成功")
    getCategoryData()
  })
}

const tableRef = ref<TableInstance | null>(null)
const batchDelete = () => {
  const selections = tableRef.value?.getSelectionRows()
  if (!selections.length) return

  ElMessageBox.confirm(`正在批量刪除分類，確認刪除？`, "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    selections.forEach((element: GetCategoryData) => {
      const index = categoryListData.value.findIndex((item) => item.categoryName === element.categoryName)
      index > -1 ? categoryListData.value.splice(index, 1) : null
    })
    ElMessage.success("删除成功")
    getCategoryData()
  })
}
//#endregion

//#region 改
const currentUpdateId = ref<undefined | string>(undefined)
const handleUpdate = (row: GetCategoryData) => {
  currentUpdateId.value = row.categoryName
  formData.categoryName = row.categoryName
  formData.categoryText = row.categoryText
  formData.categoryMeals = mealListData.value
    .filter((item) => item.categoryList.includes(formData.categoryName))
    .map((item) => item.mealName)
  dialogVisible.value = true
}
//#endregion

//#region sort
const initSort = () => {
  const table: HTMLElement | null = document.querySelector(".el-table__body tbody")
  if (!table) return

  Sortable.create(table, {
    animation: 200, // 拖拽延时，效果更好看
    onEnd: (event: any) => {
      // 进行数据的处理，拖拽实际并不会改变绑定数据的顺序
      const { oldIndex, newIndex } = event
      const currentRow = categoryListData.value?.splice(oldIndex, 1)[0]
      categoryListData.value?.splice(newIndex, 0, currentRow)
    }
  })
}

onMounted(() => {
  initSort()
})
//#endregion

//#region 查
const categoryListData = ref<GetCategoryData[]>([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  categoryName: ""
})
const getCategoryData = () => {
  loading.value = true
  !categoryListData.value.length
    ? (categoryListData.value = [
        {
          categoryName: "人氣精選",
          categoryText: "大家都點這些。金賀呷！手刀點起來"
        },
        {
          categoryName: "單打獨鬥區",
          categoryText: "附義大利麵、蛋、蔬菜"
        },
        {
          categoryName: "咖哩飯",
          categoryText: "附飯、蔬菜、獨家特調醬料"
        },
        {
          categoryName: "分進合擊區",
          categoryText: "附義大利麵、蛋、蔬菜"
        },
        {
          categoryName: "米食區",
          categoryText: "附飯、蛋、黃金泡菜、蔬菜、獨家特調醬料"
        },
        {
          categoryName: "游擊區",
          categoryText: "附飯、蛋、黃金泡菜、蔬菜"
        }
      ])
    : null
  paginationData.total = categoryListData.value.length
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
getCategoryData()
const handleSearch = () => {
  paginationData.currentPage === 1 ? getCategoryData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  // searchFormRef.value?.resetFields()
  searchData.categoryName = ""
  handleSearch()
}

const filterCategoryListData = computed<GetCategoryData[]>(() => {
  return categoryListData.value.filter((item) => item.categoryName.indexOf(searchData.categoryName) > -1)
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
const pagefilterCategoryListData = computed<GetCategoryData[]>(() => {
  return filterCategoryListData.value.filter((category, index) => index >= startIndex.value && index <= endIndex.value)
})
//#endregion
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="name" label="分類名稱">
          <el-input v-model="searchData.categoryName" placeholder="請輸入分類名稱" />
        </el-form-item>
        <el-form-item>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="dialogVisible = true">新增分類</el-button>
          <el-button type="danger" :icon="Delete" @click="batchDelete()">批量刪除</el-button>
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
        <el-table ref="tableRef" :data="pagefilterCategoryListData" row-key="categoryName">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="categoryName" label="分類名稱" align="center" />
          <el-table-column prop="categoryText" label="分類說明" align="left" />
          <el-table-column prop="status" label="狀態" align="center">
            <template #default="scope">
              <el-tag v-if="!scope.row.isShow" type="success" effect="plain">啟用</el-tag>
              <el-tag v-else type="danger" effect="plain">禁用</el-tag>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="150" align="center">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="handleUpdate(scope.row)">修改</el-button>
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
    <el-dialog
      v-model="dialogVisible"
      :title="currentUpdateId === undefined ? '新增分類' : '修改分類'"
      @close="resetForm"
      width="35%"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item prop="categoryName" label="分類名稱">
          <el-input v-model="formData.categoryName" placeholder="请输入分類名稱" />
        </el-form-item>
        <el-form-item prop="categoryText" label="分類說明">
          <el-input v-model="formData.categoryText" placeholder="请输入分類說明" />
        </el-form-item>
        <el-form-item prop="" label="分類餐點">
          <el-select v-model="formData.categoryMeals" multiple placeholder="分類餐點" style="width: 100%">
            <el-option
              v-for="item in mealListData"
              :key="item.mealName"
              :label="item.mealName"
              :value="item.mealName"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">確認</el-button>
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
