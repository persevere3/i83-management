<script lang="ts" setup>
import { reactive, ref, watch, computed } from "vue"

import { storeToRefs } from "pinia"

// import { createTableDataApi, deleteTableDataApi, updateTableDataApi, getTableDataApi } from "@/api/table"
import { type GetMealData } from "@/api/meal-list/types/meal"

import { useMealsStore } from "@/store/modules/meals"

import { type FormInstance, type FormRules, type TableInstance, ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, CirclePlus, Delete, RefreshRight, Plus } from "@element-plus/icons-vue"
// import { Search, Refresh, CirclePlus, Delete, Download, RefreshRight } from "@element-plus/icons-vue"

import { usePagination } from "@/hooks/usePagination"

defineOptions({
  // 命名当前组件
  name: "MealList"
})

const { loading } = storeToRefs(useMealsStore())

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 增
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const formData = reactive<{
  categoryList: string[]
  mealName: string
  origin: string
  mealTextList: string[]
  price: number
}>({
  categoryList: [],
  mealName: "",
  origin: "",
  mealTextList: [],
  price: 0
})
const formRules: FormRules = reactive({
  mealName: [{ required: true, trigger: "blur", message: "请输入餐點名稱" }],
  origin: [{ required: false, trigger: "blur", message: "请输入肉品來源" }],
  mealTextList: [{ required: false, trigger: "blur", message: "请输入餐點說明" }],
  price: [{ required: true, trigger: "blur", message: "请输入價錢" }]
})
const addFormDataMealText = () => {
  formData.mealTextList.push("")
}
const handleCreate = () => {
  formData.mealTextList = formData.mealTextList.filter((item) => item)
  // fields ???
  formRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      if (currentUpdateId.value === undefined) {
        mealListData.value.push(JSON.parse(JSON.stringify(formData)))
        ElMessage.success("新增成功")
        getMealData()
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
        const index = mealListData.value.findIndex((item) => item.mealName === currentUpdateId.value)
        index > -1 ? (mealListData.value[index] = JSON.parse(JSON.stringify(formData))) : null
        ElMessage.success("修改成功")
        getMealData()
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

const setForm = () => {
  // 新增餐點 && 選中某分類
  if (!currentUpdateId.value && activeCategory.value !== "全部") {
    formData.categoryList[0] = activeCategory.value
  }
}

const resetForm = () => {
  currentUpdateId.value = undefined
  formData.categoryList = []
  formData.mealName = ""
  formData.origin = ""
  formData.mealTextList = []
  formData.price = 0
  formRef.value?.resetFields()
}
//#endregion

//#region 删
const handleDelete = (row: GetMealData) => {
  const text = (activeCategory.value === "全部" ? "從全部中" : "從分類中") + `刪除餐點:${row.mealName}，確認刪除？`

  ElMessageBox.confirm(text, "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    if (activeCategory.value === "全部") {
      mealListData.value = mealListData.value.filter((item) => item.mealName !== row.mealName)
    } else {
      row.categoryList = row.categoryList.filter((item) => item !== activeCategory.value)
    }
    ElMessage.success("删除成功")
    getMealData()
  })
}

const tableRef = ref<TableInstance | null>(null)
const batchDelete = () => {
  const selections = tableRef.value?.getSelectionRows()
  if (!selections.length) return

  const text = (activeCategory.value === "全部" ? "從全部中" : "從分類中") + "批量刪除餐點，確認刪除？"

  ElMessageBox.confirm(text, "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    selections.forEach((element: GetMealData) => {
      const index = mealListData.value.findIndex((item) => item.mealName === element.mealName)
      if (index > -1) {
        if (activeCategory.value === "全部") {
          index > -1 ? mealListData.value.splice(index, 1) : null
        } else {
          mealListData.value[index].categoryList = mealListData.value[index].categoryList.filter(
            (item) => item !== activeCategory.value
          )
        }
      }
    })

    ElMessage.success("删除成功")
    getMealData()
  })
}
//#endregion

//#region 改
const currentUpdateId = ref<undefined | string>(undefined)
const handleUpdate = (row: GetMealData) => {
  currentUpdateId.value = row.mealName
  formData.categoryList = row.categoryList
  formData.mealName = row.mealName
  formData.origin = row.origin
  formData.mealTextList = JSON.parse(JSON.stringify(row.mealTextList))
  formData.price = row.price
  dialogVisible.value = true
}
//#endregion

//#region 查
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  mealName: ""
})
const { mealListData } = storeToRefs(useMealsStore())
const { getMealData } = useMealsStore()
const handleSearch = () => {
  paginationData.currentPage === 1 ? getMealData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

const categoryList = reactive(["全部", "人氣精選", "單打獨鬥區", "咖哩飯", "分進合擊區", "米食區", "游擊區"])
const activeCategory = ref("全部")
const filterMealListData = computed<GetMealData[]>(() => {
  if (activeCategory.value === "全部") return mealListData.value
  else return mealListData.value.filter((item) => item.categoryList.find((item2) => item2 === activeCategory.value))
})
//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getMealData, { immediate: true })

watch(mealListData, () => {
  paginationData.total = mealListData.value.length
})
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="mealName" label="餐點名稱">
          <el-input v-model="searchData.mealName" placeholder="請輸入餐點名稱" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查詢</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="dialogVisible = true">新增餐點</el-button>
          <el-button type="danger" :icon="Delete" @click="batchDelete()">批量刪除</el-button>
        </div>
        <div>
          <!-- <el-tooltip content="下载">
            <el-button type="primary" :icon="Download" circle />
          </el-tooltip> -->
          <el-tooltip content="刷新當前頁">
            <el-button type="primary" :icon="RefreshRight" circle @click="getMealData" />
          </el-tooltip>
        </div>
      </div>
      <div class="toolbar-wrapper">
        <div>
          <el-button
            v-for="item in categoryList"
            :key="item"
            :type="item === activeCategory ? 'success' : 'info'"
            @click="activeCategory = item"
          >
            {{ item }}
            (<template v-if="item === '全部'"> {{ mealListData.length }} </template>
            <template v-else>
              {{ mealListData.filter((item2) => item2.categoryList.find((item3) => item3 === item)).length }} </template
            >)
          </el-button>
        </div>
      </div>
      <div class="table-wrapper">
        <!-- 必須加 row-key hover sortable 才不會有bug -->
        <el-table ref="tableRef" :data="filterMealListData" row-key="mealName">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="餐點圖片" width="80" align="center" class="mealImg">
            <template #default="scope">
              <div class="mealImg" :style="{ 'background-image': `url(/img/meals/${scope.row.mealName}.jpg)` }" />
            </template>
          </el-table-column>
          <el-table-column prop="mealName" label="餐點名稱" align="center" />
          <el-table-column prop="origin" label="肉品來源" align="center" />
          <el-table-column label="餐點說明" align="left">
            <template #default="scope">
              <div v-for="item in scope.row.mealTextList" :key="item">{{ item }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="price" label="價錢" align="center" />
          <el-table-column prop="status" label="狀態" width="80" align="center">
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
      :title="currentUpdateId === undefined ? '新增餐點' : '修改餐點'"
      @open="setForm"
      @close="resetForm"
      width="35%"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item prop="" label="餐點分類">
          <el-select v-model="formData.categoryList" multiple placeholder="餐點分類" style="width: 100%">
            <el-option v-for="item in categoryList" :key="item" v-show="item !== '全部'" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item prop="mealName" label="餐點名稱">
          <el-input v-model="formData.mealName" placeholder="请输入餐點名稱" />
        </el-form-item>
        <el-form-item prop="origin" label="肉品來源">
          <el-input v-model="formData.origin" placeholder="请输入肉品來源" />
        </el-form-item>
        <el-form-item prop="" label="餐點說明">
          <template v-for="(item, index) in formData.mealTextList" :key="index">
            <el-input class="mealText" v-model="formData.mealTextList[index]" placeholder="请输入餐點說明" />
          </template>
          <el-tooltip content="新增說明">
            <el-button type="primary" :icon="Plus" circle @click="addFormDataMealText" />
          </el-tooltip>
        </el-form-item>
        <el-form-item prop="price" label="價錢">
          <el-input v-model="formData.price" placeholder="请输入價錢" />
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

.mealImg {
  width: 50px;
  height: 50px;
  margin: 0 auto;
  background-size: cover;
  background-position: center;
}
</style>
