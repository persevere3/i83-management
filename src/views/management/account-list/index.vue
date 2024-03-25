<script lang="ts" setup>
import { ref, reactive, computed, watch } from "vue"

import { type ReadData } from "@/api/account-list/types/account"
import * as Account from "@/api/account-list/"

import { storeToRefs } from "pinia"
import { useCommonStore } from "@/store/modules/common"

import { type FormInstance, type FormRules, type TableInstance, ElMessage, ElMessageBox } from "element-plus"
import { Refresh, CirclePlus, RefreshRight } from "@element-plus/icons-vue"

import { usePagination } from "@/hooks/usePagination"
import { formatDateTime } from "@/utils/"

defineOptions({
  // 命名当前组件
  name: "AccountList"
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
  account: string
  passWord: string
  enable: number
  permissions: number
  storeId: number | undefined
}>({
  account: "",
  passWord: "",
  enable: 1,
  permissions: 1,
  storeId: undefined
})
const formRules: FormRules = reactive({
  account: [{ required: true, trigger: "blur", message: "請輸入帳號" }]
})

watch(
  currentUpdateId,
  () => {
    delete formRules.passWord
    if (currentUpdateId.value) {
      formRules.passWord = [{ required: false, trigger: "blur", message: "請輸入密碼" }]
    } else {
      formRules.passWord = [{ required: true, trigger: "blur", message: "請輸入密碼" }]
    }
  },
  { immediate: true }
)
watch(
  () => formData.permissions,
  () => {
    delete formRules.storeId
    if (formData.permissions !== 0) {
      formRules.storeId = [{ required: true, trigger: ["blur", "change"], message: "請選擇分店" }]
    }
  },
  { immediate: true }
)

const openDialog = (row?: ReadData) => {
  if (row) {
    currentUpdateId.value = row.id
    formData.account = row.account
    formData.passWord = ""
    formData.enable = row.enable
    formData.permissions = row.permissions
    formData.storeId = row.store[0]?.id
  } else {
    formRef.value?.resetFields()
    currentUpdateId.value = undefined

    formData.account = ""
    formData.passWord = ""
    formData.enable = 1
    formData.permissions = 1
    formData.storeId = undefined
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
  Account.createDataApi(formData)
    .then(() => {
      ElMessage.success("新增成功")
      getAccountData()
    })
    .finally(() => {
      dialogVisible.value = false
    })
}
//#endregion

//#region 删
const handleDelete = (row: ReadData) => {
  if (!row.id) return

  ElMessageBox.confirm(`正在刪除帳戶:${row.account}，確認刪除？`, "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    Account.deleteDataApi(row.id)
      .then(() => {
        ElMessage.success("删除成功")
        getAccountData()
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
  const account = accountListData.value.find((item: ReadData) => item.id === currentUpdateId.value)
  if (!account) return
  const newFormData = JSON.parse(JSON.stringify(formData))
  delete newFormData.account
  if (!newFormData.passWord) delete newFormData.passWord
  const postData = Object.assign(
    {
      id: currentUpdateId.value
    },
    newFormData
  )
  Account.updateDataApi(postData)
    .then(() => {
      ElMessage.success("修改成功")
      getAccountData()
    })
    .finally(() => {
      dialogVisible.value = false
    })
}

const changeEnable = (id: number) => {
  if (!id) return
  const account = accountListData.value.find((item) => item.id === id)
  if (!account) return

  const newEnableText = account.enable ? "關閉" : "開啟"
  const text = `${newEnableText}${account.account}，確認${newEnableText}？`

  ElMessageBox.confirm(text, "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    const newAccount: ReadData = JSON.parse(JSON.stringify(account))
    const postData = {
      id,
      enable: newAccount.enable ? 0 : 1,
      permissions: newAccount.permissions,
      storeId: newAccount.permissions > 0 ? newAccount.store[0].id : undefined
    }
    Account.updateDataApi(postData).then(() => {
      ElMessage.success(`${newEnableText}成功`)
      getAccountData()
    })
  })
}
//#endregion

//#region 查
const { roleList, role, storeList } = storeToRefs(useCommonStore())
const loading = ref<boolean>(false)
const accountListData = ref<ReadData[]>([])
const getAccountData = () => {
  loading.value = true
  Account.getDataApi()
    .then((res) => {
      accountListData.value = res
    })
    .catch(() => {
      accountListData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}
getAccountData()
//#endregion

//#region 過濾
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  account: ""
})
const resetSearch = () => {
  searchData.account = ""
}

const filterListData = computed<ReadData[]>(() => {
  return accountListData.value.filter((item) => item.account.indexOf(searchData.account) > -1)
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
        <el-form-item prop="account" label="帳號">
          <el-input v-model="searchData.account" placeholder="請輸入帳號" />
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
            <el-button type="primary" :icon="CirclePlus" @click="openDialog()">新增帳戶</el-button>
            <!-- <el-button type="danger" :icon="Delete" @click="handleDelete()">批量刪除</el-button> -->
          </template>
        </div>
        <div>
          <!-- <el-tooltip content="下载">
            <el-button type="primary" :icon="Download" circle />
          </el-tooltip> -->
          <el-tooltip content="刷新當前頁">
            <el-button type="primary" :icon="RefreshRight" circle @click="getAccountData()" />
          </el-tooltip>
        </div>
      </div>
      <div class="table-wrapper">
        <!-- 必須加 row-key hover sortable 才不會有bug -->
        <el-table ref="tableRef" :data="pagefilterListData" row-key="id">
          <!-- <el-table-column type="selection" width="50" align="center" /> -->
          <el-table-column prop="account" label="帳號" align="center" />
          <el-table-column label="權限" align="center">
            <template #default="scope">
              {{ roleList[scope.row.permissions] }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="狀態" width="100" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.enable" type="success" effect="plain">開啟</el-tag>
              <el-tag v-else type="danger" effect="plain">關閉</el-tag>
              <el-switch
                :model-value="scope.row.enable"
                style="--el-switch-on-color: var(--el-color-success); --el-switch-off-color: var(--el-color-danger)"
                :active-value="1"
                :inactive-value="0"
                @click="changeEnable(scope.row.id)"
              />
            </template>
          </el-table-column>
          <el-table-column label="登入時間" align="center" width="100">
            <template #default="scope">
              {{ scope.row.loginDate ? formatDateTime(scope.row.loginDate) : "" }}
            </template>
          </el-table-column>
          <el-table-column label="更新時間" align="center" width="100">
            <template #default="scope">
              {{ formatDateTime(scope.row.changeDate) }}
            </template>
          </el-table-column>
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
    <el-dialog v-model="dialogVisible" :title="currentUpdateId === undefined ? '新增帳戶' : '修改帳戶'" width="35%">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item prop="account" label="帳號">
          <el-input v-model="formData.account" placeholder="請輸入帳號" :disabled="currentUpdateId !== undefined" />
        </el-form-item>
        <el-form-item prop="passWord" label="密碼">
          <el-input v-model="formData.passWord" placeholder="請輸入密碼" />
        </el-form-item>
        <el-form-item prop="enable" label="狀態">
          <el-switch v-model="formData.enable" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item prop="permissions" label="權限">
          <el-select v-model="formData.permissions" placeholder="請選取權限" style="width: 200px">
            <el-option v-for="(item, index) in roleList" :key="index" :label="item" :value="index" />
          </el-select>
        </el-form-item>
        <el-form-item prop="storeId" label="分店" v-if="formData.permissions !== 0">
          <el-select v-model="formData.storeId" placeholder="請選取分店" style="width: 200px">
            <el-option
              v-for="item in storeList"
              :key="item.id"
              v-show="item.id !== 0"
              :label="item.storeName"
              :value="item.id"
            />
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

// .el-form-item__content {
//   div + button {
//     margin-top: 5px;
//   }
// }

.el-input__inner {
  width: 50%;
}
</style>
