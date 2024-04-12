<script lang="ts" setup>
import { ref, reactive, computed, watch } from "vue"

import { type ReadData, type Option } from "@/api/select-list/types/select"
import * as Select from "@/api/select-list/"

import { storeToRefs } from "pinia"
import { useCommonStore } from "@/store/modules/common"
import { useSelectsStore } from "@/store/modules/selects"

import { type FormInstance, type FormRules, type TableInstance, ElMessage, ElMessageBox } from "element-plus"
import { Refresh, CirclePlus, Delete, RefreshRight, Plus } from "@element-plus/icons-vue"

import { usePagination } from "@/hooks/usePagination"

defineOptions({
  // 命名当前组件
  name: "SelectList"
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
  optionList: Option[]
  relation: { [key: string]: number[] }
}>({
  name: "",
  optionList: [],
  relation: {}
})
const formRules: FormRules = reactive({
  name: [{ required: true, trigger: "blur", message: "請輸入選擇名稱" }],
  optionList: [{ required: false, trigger: "blur", message: "請輸入選項" }]
})
const addFormDataOption = () => {
  formData.optionList.push({
    title: "",
    deliverPrice: undefined,
    price: undefined,
    codeName: ""
  })
}

const openDialog = (row?: ReadData) => {
  if (row) {
    currentUpdateId.value = row.id
    formData.name = row.title
    formData.optionList = JSON.parse(JSON.stringify(row.optionList))
    // formData.relation = row.relation
  } else {
    formRef.value?.resetFields()
    currentUpdateId.value = undefined
    formData.name = ""
    formData.optionList = []
    formData.relation = {}
  }
  dialogVisible.value = true
}

const handleConfirm = () => {
  formData.optionList = formData.optionList.filter((item) => item.title)

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
  formData.optionList.forEach((item, index) => {
    item.order = index
  })
  Select.createDataApi({
    id: 0,
    title: formData.name,
    optionList: formData.optionList,
    // relation: JSON.stringify(formData.relation),
    // 這兩個不需要
    max: 1,
    min: 1
  })
    .then(() => {
      ElMessage.success("新增成功")
      getSelectData()
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
    text = `正在刪除選擇:${row.title}，確認刪除？`
    ids = [row.id]
  } else {
    text = `正在批量刪除選擇，確認刪除？`
    const selections = tableRef.value?.getSelectionRows()
    if (!selections.length) return
    ids = selections.map((item: ReadData) => item.id)
  }

  ElMessageBox.confirm(text, "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    Select.deleteDataApi(ids)
      .then(() => {
        ElMessage.success("删除成功")
        getSelectData()
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
  const select = selectListData.value.find((item) => item.id === currentUpdateId.value)
  if (!select) return
  formData.optionList.forEach((item, index) => {
    if (!item.codeName) item.codeName = ""
    item.order = index
  })
  Select.updateDataApi({
    id: currentUpdateId.value,
    title: formData.name,
    optionList: formData.optionList,
    // relation: JSON.stringify(formData.relation),
    // 這兩個不需要
    max: select.max,
    min: select.min
  })
    .then(() => {
      ElMessage.success("修改成功")
      getSelectData()
    })
    .finally(() => {
      dialogVisible.value = false
    })
}
//#endregion

//#region 查
const { role } = storeToRefs(useCommonStore())

const { loading, selectListData } = storeToRefs(useSelectsStore())
const { getSelectData } = useSelectsStore()
getSelectData()
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
  return selectListData.value.filter((item) => item.title.indexOf(searchData.name) > -1)
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
const pagefilterListData = computed<ReadData[]>(() => {
  return filterListData.value.filter((item, index) => index >= startIndex.value && index <= endIndex.value)
})
//#endregion
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="name" label="選擇名稱">
          <el-input v-model="searchData.name" placeholder="請輸入選擇名稱" />
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
            <el-button type="primary" :icon="CirclePlus" @click="openDialog()">新增選擇</el-button>
            <el-button type="danger" :icon="Delete" @click="handleDelete()">批量刪除</el-button>
          </template>
        </div>
        <div>
          <!-- <el-tooltip content="下载">
            <el-button type="primary" :icon="Download" circle />
          </el-tooltip> -->
          <el-tooltip content="刷新當前頁">
            <el-button type="primary" :icon="RefreshRight" circle @click="getSelectData()" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper select">
        <!-- 必須加 row-key hover sortable 才不會有bug -->
        <el-table class="selectTable" ref="tableRef" :data="pagefilterListData" row-key="id">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="title" width="150" label="選擇名稱" align="center" />
          <el-table-column label="選項" align="left">
            <template #default="scope">
              <el-table :data="scope.row.optionList" row-key="title">
                <el-table-column prop="title" label="名稱" align="center" />
                <el-table-column label="價格 / 外送價格" align="center">
                  <template #default="scope2">
                    <div>{{ scope2.row.price }} / {{ scope2.row.deliverPrice }}</div>
                  </template>
                </el-table-column>
                <el-table-column prop="codeName" label="代號" align="center" />
              </el-table>
            </template>
          </el-table-column>
          <el-table-column v-if="role === 'super-admin'" fixed="right" label="操作" width="150" align="center">
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
    <el-dialog v-model="dialogVisible" :title="currentUpdateId === undefined ? '新增選擇' : '修改選擇'" width="35%">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item prop="name" label="選擇名稱">
          <el-input v-model="formData.name" placeholder="請輸入選擇名稱" />
        </el-form-item>
        <el-form-item label="選項內容">
          <template v-for="(item, index) in formData.optionList" :key="index">
            <div class="mb-2">
              <el-input
                class="mealText"
                v-model="formData.optionList[index].title"
                placeholder="請輸入選項名稱"
                style="width: 50%"
              />
              <el-input
                type="number"
                class="mealText"
                v-model.number="formData.optionList[index].deliverPrice"
                placeholder="請輸入外送價錢"
                style="width: 50%"
              />
              <el-input
                type="number"
                class="mealText"
                v-model.number="formData.optionList[index].price"
                placeholder="請輸入價錢"
                style="width: 50%"
              />
              <el-input
                class="mealText"
                v-model="formData.optionList[index].codeName"
                placeholder="請輸入選項代號"
                style="width: 50%"
              />

              <!-- <el-select
                multiple
                v-model="formData.relation[item]"
                placeholder="請選取要建立關係的選擇"
                style="width: 200px"
              >
                <el-option
                  v-for="select in selectListData"
                  :key="select.id"
                  v-show="select.id !== currentUpdateId"
                  :label="select.title"
                  :value="select.id"
                />
              </el-select> -->
            </div>
          </template>
          <el-tooltip content="新增選項">
            <el-button class="ml-2" type="primary" :icon="Plus" circle @click="addFormDataOption" />
          </el-tooltip>
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

<style lang="scss">
.selectTable {
  .el-table__row {
    cursor: grab;
  }
}
</style>
