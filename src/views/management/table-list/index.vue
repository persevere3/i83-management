<script lang="ts" setup>
import { ref, reactive, watch, computed } from "vue"

import { type ReadData } from "@/api/table-list/types/table"
import * as Table from "@/api/table-list"

import { storeToRefs } from "pinia"
import { useCommonStore } from "@/store/modules/common"
import { useTablesStore } from "@/store/modules/tables"

import { type FormInstance, type FormRules, type TableInstance, ElMessage, ElMessageBox } from "element-plus"
import { Refresh, CirclePlus, Delete, RefreshRight } from "@element-plus/icons-vue"

import { usePagination } from "@/hooks/usePagination"

import QRCodeVue3 from "qrcode-vue3"

defineOptions({
  // 命名当前组件
  name: "TableList"
})

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region table
const tableRef = ref<TableInstance | null>(null)
//#endregion

//#region 新增/修改 dialog form
const dialogVisible = ref<boolean>(false)

const currentUpdateId = ref<number>()

const formRef = ref<FormInstance>()
const formData = reactive({
  storeName: "",
  number: ""
})
const formRules: FormRules = reactive({
  storeName: [{ required: true, trigger: "blur", message: "請選擇分店" }],
  number: [{ required: true, trigger: "blur", message: "請選擇桌號" }]
})

const openDialog = (row?: ReadData) => {
  if (row) {
    currentUpdateId.value = row.id
    formData.storeName = row.storeName
    formData.number = row.number
  } else {
    formRef.value?.resetFields()
    currentUpdateId.value = undefined
    formData.storeName = ""
    formData.number = ""
    if (activeStore.value?.id !== 0) formData.storeName = activeStore.value?.storeName || ""
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
  const table = tableListData.value.find(
    (item) => item.storeName === formData.storeName && item.number === formData.number
  )
  if (table) {
    ElMessageBox.confirm("桌號不可重複", "提示", {
      confirmButtonText: "確定",
      type: "warning"
    })
    return
  }
  Table.createDataApi({
    id: 0,
    storeName: formData.storeName,
    number: formData.number,
    orderToken: "",
    birthdayBonus: 0,
    enable: 0
  })
    .then(() => {
      ElMessage.success("新增成功")
      getTableData()
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
    text = `刪除${row.storeName}分店-桌號${row.number}，確認刪除？`
    ids = [row.id]
  } else {
    text = "批量刪除桌號，確認刪除？"
    const selections = tableRef.value?.getSelectionRows()
    if (!selections.length) return
    ids = selections.map((item: ReadData) => item.id)
  }

  ElMessageBox.confirm(text, "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    Table.deleteDataApi(ids)
      .then(() => {
        ElMessage.success("删除成功")
        getTableData()
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
  const table = tableListData.value.find((item) => item.id === currentUpdateId.value)
  if (!table) return
  Table.updateDataApi({
    id: currentUpdateId.value,
    storeName: formData.storeName,
    number: formData.number,
    orderToken: table.orderToken,
    enable: table.enable
  })
    .then(() => {
      ElMessage.success("修改成功")
      getTableData()
    })
    .finally(() => {
      dialogVisible.value = false
    })
}
//#endregion

//#region status
const statusDialogVisible = ref<boolean>(false)
const enable = ref<boolean | null>(null)
const statusFormRef = ref<FormInstance>()
const statusFormData = reactive<{
  storeName: string
  id: number | ""
  birthdayBonus: number
}>({
  storeName: "",
  id: "",
  birthdayBonus: 0
})
const statusFormRules: FormRules = reactive({
  storeName: [{ required: true, trigger: "blur", message: "請選擇分店" }],
  id: [{ required: true, trigger: "blur", message: "請選擇桌號" }]
})
const openStatusDialog = (isEnable: boolean, row?: ReadData) => {
  statusFormRef.value?.resetFields()
  enable.value = isEnable
  if (row) {
    statusFormData.storeName = row.storeName
    statusFormData.id = row.id
    statusFormData.birthdayBonus = 0
  } else {
    statusFormData.storeName = ""
    statusFormData.id = ""
    statusFormData.birthdayBonus = 0
  }
  if (activeStore.value?.id !== 0) statusFormData.storeName = activeStore.value?.storeName || ""
  statusDialogVisible.value = true
}
const handleStatusConfirm = () => {
  if (!statusFormData.id) return
  statusFormRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      if (enable.value) handleEnable(statusFormData.id)
      else handleDisable(statusFormData.id)
    } else {
      console.error("表單校驗不通過", fields)
    }
  })
}

const handleEnable = (id: number | "") => {
  if (!id) return
  const table = tableListData.value.find((item) => item.id === id)
  if (!table) return
  const text = `開啟${table.storeName}-${table.number}，確認開啟？`
  ElMessageBox.confirm(text, "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    Table.enableApi(id, statusFormData.birthdayBonus)
      .then(() => {
        ElMessage.success("開啟成功")
        getTableData()
      })
      .finally(() => {
        statusDialogVisible.value = false
      })
  })
}
const handleDisable = (id: number | "") => {
  const table = tableListData.value.find((item) => item.id === id)
  if (!table) return
  if (table.enable !== 1) return
  const text = `關閉${table.storeName}分店-桌號${table.number}，確認關閉？`
  ElMessageBox.confirm(text, "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    Table.updateDataApi({
      id: table.id,
      storeName: table.storeName,
      number: table.number,
      orderToken: undefined,
      enable: 0
    })
      .then(() => {
        ElMessage.success("關閉成功")
        getTableData()
      })
      .finally(() => {
        statusDialogVisible.value = false
      })
  })
}
//#endregion

//#region 查
const tableEnableArr = [
  {
    label: "關閉"
  },
  {
    label: "開啟"
  },
  {
    label: "已新增訂單"
  }
]

const { role, storeList, activeStore } = storeToRefs(useCommonStore())
const { loading, tableListData } = storeToRefs(useTablesStore())
const { getTableData } = useTablesStore()
getTableData()
//#endregion

//#region 過濾
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  number: ""
})
const resetSearch = () => {
  searchData.number = ""
}

const activeStatus = ref<boolean | null>(null)
const filterListData = computed<ReadData[]>(() => {
  let list = tableListData.value
  // 分店
  if (activeStore.value?.id !== 0) list = list.filter((item) => item.storeName === activeStore.value?.storeName)
  // 桌號
  list = list.filter((item) => item.number.indexOf(searchData.number) > -1)
  // 開啟/關閉
  if (activeStatus.value !== null) {
    list = list.filter((item) => Boolean(item.enable) === activeStatus.value)
  }
  return list
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
        <el-form-item prop="number" label="桌號">
          <el-input v-model="searchData.number" placeholder="請輸入桌號" />
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
            <el-button type="primary" :icon="CirclePlus" @click="openDialog()">新增桌號</el-button>
            <el-button class="mr-20" type="danger" :icon="Delete" @click="handleDelete()">批量刪除</el-button>
          </template>
        </div>
        <div>
          <el-tooltip content="刷新當前頁">
            <el-button type="primary" :icon="RefreshRight" circle @click="getTableData" />
          </el-tooltip>
        </div>
      </div>
      <div class="toolbar-wrapper">
        <div>
          <el-button :type="activeStatus === null ? 'success' : 'info'" @click="activeStatus = null">
            全部 ({{
              tableListData.filter((item) => activeStore?.id === 0 || item.storeName === activeStore?.storeName).length
            }})</el-button
          >
          <el-button :type="activeStatus === true ? 'success' : 'info'" @click="activeStatus = true">
            啟用 ({{
              tableListData
                .filter((item) => activeStore?.id === 0 || item.storeName === activeStore?.storeName)
                .filter((item) => item.enable).length
            }})
          </el-button>
          <el-button :type="activeStatus === false ? 'success' : 'info'" @click="activeStatus = false">
            未啟用 ({{
              tableListData
                .filter((item) => activeStore?.id === 0 || item.storeName === activeStore?.storeName)
                .filter((item) => !item.enable).length
            }})
          </el-button>
        </div>
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="openStatusDialog(true)">開啟桌號</el-button>
          <el-button type="danger" :icon="Delete" @click="openStatusDialog(false)">關閉桌號</el-button>
        </div>
      </div>
      <div class="table-wrapper">
        <!-- 必須加 row-key hover sortable 才不會有bug -->
        <el-table ref="tableRef" :data="pagefilterListData" row-key="id">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="storeName" label="分店" align="center" />
          <el-table-column prop="number" label="桌號" align="center" />
          <el-table-column label="QR code" align="center">
            <template #default="scope">
              <router-link :to="`/customer/${scope.row.id}`" v-if="scope.row.orderToken && scope.row.number">
                <QRCodeVue3
                  myclass="qrcode"
                  :width="60"
                  :height="60"
                  :value="`https://preview.uniqcarttest.com/?tableId=${scope.row?.id}`"
                  :dotsOptions="{ type: 'classy' }"
                />
              </router-link>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="狀態" width="120" align="center">
            <template #default="scope">
              <el-tag
                v-if="scope.row.enable"
                type="success"
                effect="plain"
                @click="scope.row.enable === 1 ? handleDisable(scope.row.id) : ''"
              >
                {{ tableEnableArr[scope.row.enable].label }}
              </el-tag>
              <el-tag v-else type="danger" effect="plain">
                {{ tableEnableArr[scope.row.enable].label }}
              </el-tag>
              <div>
                <el-switch
                  :model-value="scope.row.enable ? 1 : 0"
                  style="--el-switch-on-color: var(--el-color-success); --el-switch-off-color: var(--el-color-danger)"
                  :active-value="1"
                  :inactive-value="0"
                  @click="scope.row.enable ? handleDisable(scope.row.id) : openStatusDialog(true, scope.row)"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column v-if="role === 'super-admin'" fixed="right" label="操作" width="200" align="center">
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
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
    <!-- 新增/修改 桌號 -->
    <el-dialog v-model="dialogVisible" :title="currentUpdateId === undefined ? '新增桌號' : '修改桌號'" width="35%">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item prop="storeName" label="分店">
          <el-select v-model="formData.storeName" placeholder="請選擇分店" style="width: 100%">
            <el-option
              v-for="item in storeList"
              :key="item.id"
              v-show="item.id !== 0"
              :label="item.storeName"
              :value="item.storeName"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="number" label="桌號">
          <el-input v-model="formData.number" placeholder="請輸入桌號" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">確認</el-button>
      </template>
    </el-dialog>

    <!-- 改變狀態 桌號 -->
    <el-dialog v-model="statusDialogVisible" :title="enable === true ? '開啟桌號' : '關閉桌號'" width="35%">
      <el-form
        ref="statusFormRef"
        :model="statusFormData"
        :rules="statusFormRules"
        label-width="100px"
        label-position="left"
      >
        <el-form-item prop="storeName" label="分店">
          <el-select
            :disabled="role !== 'super-admin'"
            v-model="statusFormData.storeName"
            placeholder="請選擇分店"
            style="width: 100%"
          >
            <el-option
              v-for="item in storeList"
              :key="item.id"
              v-show="item.id !== 0"
              :label="item.storeName"
              :value="item.storeName"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="number" label="桌號">
          <el-select v-model="statusFormData.id" placeholder="請選擇桌號" style="width: 100%">
            <el-option
              v-for="item in tableListData"
              :key="item.id"
              v-show="
                item.storeName === statusFormData.storeName && (enable === true ? !item.enable : item.enable === 1)
              "
              :label="item.number"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="enable === true" prop="birthdayBonus" label="當月壽星優惠人數">
          <el-input v-model="statusFormData.birthdayBonus" placeholder="請輸入當月壽星優惠人數" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleStatusConfirm">確認</el-button>
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

.el-tag {
  cursor: pointer;
}
</style>

<style lang="scss">
.qrcode {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
