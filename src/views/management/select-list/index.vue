<script lang="ts" setup>
import { reactive, ref, watch } from "vue"

import { storeToRefs } from "pinia"

// import { createTableDataApi, deleteTableDataApi, updateTableDataApi, getTableDataApi } from "@/api/table"
import { type GetSelectData } from "@/api/select-list/types/select"

import { useSelectsStore } from "@/store/modules/selects"

import { type FormInstance, type FormRules, type TableInstance, ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, CirclePlus, Delete, RefreshRight, Plus } from "@element-plus/icons-vue"
// import { Search, Refresh, CirclePlus, Delete, Download, RefreshRight } from "@element-plus/icons-vue"

import { usePagination } from "@/hooks/usePagination"

defineOptions({
  // 命名当前组件
  name: "SelectList"
})

const { selectListData } = storeToRefs(useSelectsStore())
const { getSelectData } = useSelectsStore()

getSelectData()

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 增
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const formData = reactive<{
  selectName: string
  optionList: string[]
}>({
  selectName: "",
  optionList: []
})
const formRules: FormRules = reactive({
  selectName: [{ required: true, trigger: "blur", message: "请输入選擇名稱" }],
  optionList: [{ required: false, trigger: "blur", message: "请输入選項" }]
})
const addFormDataOption = () => {
  formData.optionList.push("")
}
const handleCreate = () => {
  formData.optionList = formData.optionList.filter((item) => item)
  // fields ???
  formRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      if (currentUpdateId.value === undefined) {
        selectListData.value.push(JSON.parse(JSON.stringify(formData)))

        ElMessage.success("新增成功")
        getSelectData()
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
        const index = selectListData.value.findIndex((item) => item.selectName === currentUpdateId.value)
        index > -1 ? (selectListData.value[index] = JSON.parse(JSON.stringify(formData))) : null

        ElMessage.success("修改成功")
        getSelectData()
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
  // 新增餐點
  if (!currentUpdateId.value) {
    formData.selectName = ""
    formData.optionList = []
  }
}
const resetForm = () => {
  currentUpdateId.value = undefined
  formRef.value?.resetFields()
}
//#endregion

//#region 删
const handleDelete = (row: GetSelectData) => {
  ElMessageBox.confirm(`正在刪除選擇:${row.selectName}，確認刪除？`, "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    selectListData.value = selectListData.value.filter((item) => item.selectName !== row.selectName)
    ElMessage.success("删除成功")
    getSelectData()
  })
}

const tableRef = ref<TableInstance | null>(null)
const batchDelete = () => {
  const selections = tableRef.value?.getSelectionRows()
  if (!selections.length) return

  ElMessageBox.confirm(`正在批量刪除選擇，確認刪除？`, "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    selections.forEach((element: GetSelectData) => {
      const index = selectListData.value.findIndex((item) => item.selectName === element.selectName)
      index > -1 ? selectListData.value.splice(index, 1) : null
    })
    ElMessage.success("删除成功")
    getSelectData()
  })
}
//#endregion

//#region 改
const currentUpdateId = ref<undefined | string>(undefined)
const handleUpdate = (row: GetSelectData) => {
  currentUpdateId.value = row.selectName
  formData.selectName = row.selectName
  formData.optionList = JSON.parse(JSON.stringify(row.optionList))
  dialogVisible.value = true
}
//#endregion

//#region 查
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  selectName: ""
})

const handleSearch = () => {
  paginationData.currentPage === 1 ? getSelectData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}
//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getSelectData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="name" label="選擇名稱">
          <el-input v-model="searchData.selectName" placeholder="請輸入選擇名稱" />
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
          <el-button type="primary" :icon="CirclePlus" @click="dialogVisible = true">新增選擇</el-button>
          <el-button type="danger" :icon="Delete" @click="batchDelete()">批量刪除</el-button>
        </div>
        <div>
          <!-- <el-tooltip content="下载">
            <el-button type="primary" :icon="Download" circle />
          </el-tooltip> -->
          <el-tooltip content="刷新當前頁">
            <el-button type="primary" :icon="RefreshRight" circle @click="getSelectData" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <!-- 必須加 row-key hover sortable 才不會有bug -->
        <el-table ref="tableRef" :data="selectListData" row-key="selectName">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="selectName" label="選擇名稱" align="center" />
          <el-table-column label="選項" align="left">
            <template #default="scope">
              <span v-for="(item, index) in scope.row.optionList" :key="item"
                >{{ index != 0 ? "，" : "" }} {{ item }}</span
              >
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
      :title="currentUpdateId === undefined ? '新增選擇' : '修改選擇'"
      @open="setForm"
      @close="resetForm"
      width="35%"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item prop="selectName" label="選擇名稱">
          <el-input v-model="formData.selectName" placeholder="请输入選擇名稱" />
        </el-form-item>
        <el-form-item prop="" label="選項">
          <template v-for="(item, index) in formData.optionList" :key="index">
            <el-input class="mealText" v-model="formData.optionList[index]" placeholder="请输入選項" />
          </template>
          <el-tooltip content="新增說明">
            <el-button type="primary" :icon="Plus" circle @click="addFormDataOption" />
          </el-tooltip>
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

.el-form-item__content {
  div + button {
    margin-top: 5px;
  }
}
</style>
