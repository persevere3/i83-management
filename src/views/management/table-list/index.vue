<script lang="ts" setup>
import { reactive, ref, watch, computed } from "vue"

// import { createTableDataApi, deleteTableDataApi, updateTableDataApi, getTableDataApi } from "@/api/table"
import { type GetTableData, CreateTableRequestData, UpdateTableRequestData } from "@/api/table-list/types/table"
import { createTableDataApi, deleteTableDataApi, updateTableDataApi, getTableDataApi } from "@/api/table-list"

import { type FormInstance, type FormRules, type TableInstance, ElMessage, ElMessageBox } from "element-plus"
import { Refresh, CirclePlus, Delete, RefreshRight } from "@element-plus/icons-vue"
// import { Search, Refresh, CirclePlus, Delete, Download, RefreshRight } from "@element-plus/icons-vue"

import { usePagination } from "@/hooks/usePagination"

import QRCodeVue3 from "qrcode-vue3"

import Sortable from "sortablejs"

defineOptions({
  // 命名当前组件
  name: "TableList"
})

const loading = ref(false)

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 增
// 桌號
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const formData = reactive({
  storeName: "",
  number: ""
})
const formRules: FormRules = reactive({
  storeName: [{ required: true, trigger: "blur", message: "請選擇分店" }],
  number: [{ required: true, trigger: "blur", message: "請選擇桌號" }]
})

const handleCreate = () => {
  // fields ???
  formRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      if (currentUpdateId.value === undefined) {
        const createTableData: CreateTableRequestData = {
          id: 0,
          storeName: formData.storeName,
          number: formData.number,
          orderToken: null,
          enable: 0
        }
        createTableDataApi(createTableData)
          .then(() => {
            ElMessage.success("新增成功")
            getTableData()
          })
          .finally(() => {
            dialogVisible.value = false
          })
      } else {
        const createTableData: UpdateTableRequestData = {
          id: currentUpdateId.value,
          storeName: formData.storeName,
          number: formData.number,
          orderToken: null,
          enable: 0
        }
        updateTableDataApi(createTableData)
          .then(() => {
            ElMessage.success("修改成功")
            getTableData()
          })
          .finally(() => {
            dialogVisible.value = false
          })
      }
    } else {
      console.error("表單校驗不通過", fields)
    }
  })
}
const setForm = () => {
  // 新增桌號
  if (!currentUpdateId.value) {
    formData.storeName = ""
    formData.number = ""
  }

  // 新增桌號 && 選中某分店
  if (!currentUpdateId.value && activeStore.value !== "全部") {
    formData.storeName = activeStore.value
  }
}
const resetForm = () => {
  currentUpdateId.value = undefined
  formRef.value?.resetFields()
}
//#endregion

//#region 增
// 顧客
const customerDialogVisible = ref<boolean>(false)
const customerFormRef = ref<FormInstance | null>(null)
const customerFormData = reactive({
  storeName: "",
  number: ""
})
const customerFormRules: FormRules = reactive({
  storeName: [{ required: true, trigger: "blur", message: "請選擇分店" }],
  number: [{ required: true, trigger: "blur", message: "請選擇桌號" }]
})

const handleCreateCustomer = () => {
  // fields ???
  customerFormRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      const createTableData: CreateTableRequestData = {
        id: 0,
        storeName: formData.storeName,
        number: formData.number,
        orderToken: null,
        enable: 0
      }
      createTableDataApi(createTableData)
        .then(() => {
          ElMessage.success("新增成功")
          getTableData()
        })
        .finally(() => {
          customerDialogVisible.value = false
        })
    } else {
      console.error("表單校驗不通過", fields)
    }
  })
}
const setCustomerForm = () => {
  customerFormData.storeName = ""
  customerFormData.number = ""
  // 選中某分店
  if (activeStore.value !== "全部") {
    customerFormData.storeName = activeStore.value
  }
}
const resetCustomerForm = () => {
  customerFormRef.value?.resetFields()
}
//#endregion

//#region 删
const handleDelete = (row: GetTableData) => {
  const text = `刪除${row.storeName}分店-桌號${row.number}，確認刪除？`

  ElMessageBox.confirm(text, "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    deleteTableDataApi([row.id])
      .then(() => {
        ElMessage.success("刪除成功")
        getTableData()
      })
      .finally(() => {})
  })
}

const tableRef = ref<TableInstance | null>(null)
const batchDelete = () => {
  const selections = tableRef.value?.getSelectionRows()
  if (!selections.length) return

  const text = "批量刪除桌號，確認刪除？"

  ElMessageBox.confirm(text, "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    const arr = ref<(number | string)[]>([])
    selections.forEach((element: GetTableData) => {
      arr.value.push(element.id)
    })
    console.log(JSON.stringify(arr.value))
    deleteTableDataApi(arr.value)
      .then(() => {
        ElMessage.success("刪除成功")
        getTableData()
      })
      .finally(() => {})
  })
}
//#endregion

//#region 改
const currentUpdateId = ref<undefined | string | number>(undefined)
const handleUpdate = (row: GetTableData) => {
  currentUpdateId.value = row.id
  formData.storeName = row.storeName
  formData.number = row.number
  dialogVisible.value = true
}
//#endregion

//#region 查
const tableListData = ref<GetTableData[]>([])

//#region sort
const initSort = () => {
  const table: HTMLElement | null = document.querySelector(".el-table__body tbody")
  if (!table) return

  Sortable.create(table, {
    animation: 200, // 拖拽延时，效果更好看
    onEnd: (event: any) => {
      // 进行数据的处理，拖拽实际并不会改变绑定数据的顺序
      const { oldIndex, newIndex } = event
      const currentRow = tableListData.value?.splice(oldIndex, 1)[0]
      tableListData.value?.splice(newIndex, 0, currentRow)
    }
  })
}
//#endregion

const getTableData = () => {
  loading.value = true
  getTableDataApi({})
    .then((res) => {
      tableListData.value = res
      initSort()
      // paginationData.total = res.data.total
    })
    .catch(() => {
      tableListData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}
getTableData()
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  number: ""
})

const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

const storeList = reactive(["全部", "復北店", "學府店"])
const activeStore = ref("全部")
const filterTableListData = computed<GetTableData[]>(() => {
  let list: GetTableData[]
  if (activeStore.value === "全部") list = tableListData.value
  else list = tableListData.value.filter((item) => item.storeName === activeStore.value)
  list = list.filter((item) => item.number.indexOf(searchData.number) > -1)
  return list
})
watch(
  filterTableListData,
  () => {
    paginationData.total = filterTableListData.value.length
    paginationData.currentPage = 1
  },
  { immediate: true }
)

// startIndex, endIndex => pagefilterTableListData
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
const pagefilterTableListData = computed<GetTableData[]>(() => {
  const list: GetTableData[] = filterTableListData.value.filter(
    (table, index) => index >= startIndex.value && index <= endIndex.value
  )
  return list
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
          <el-button type="primary" :icon="CirclePlus" @click="dialogVisible = true">新增桌號</el-button>
          <el-button type="danger" :icon="Delete" @click="batchDelete()">批量刪除</el-button>
          <el-button type="primary" :icon="CirclePlus" @click="customerDialogVisible = true">新增顧客</el-button>
        </div>
        <div>
          <el-tooltip content="刷新當前頁">
            <el-button type="primary" :icon="RefreshRight" circle @click="getTableData" />
          </el-tooltip>
        </div>
      </div>
      <div class="toolbar-wrapper">
        <div>
          <el-button
            v-for="item in storeList"
            :key="item"
            :type="item === activeStore ? 'success' : 'info'"
            @click="activeStore = item"
          >
            {{ item }}
            (<template v-if="item === '全部'"> {{ tableListData.length }} </template>
            <template v-else> {{ tableListData.filter((item2) => item2.storeName === item).length }} </template>)
          </el-button>
        </div>
      </div>
      <div class="table-wrapper">
        <!-- 必須加 row-key hover sortable 才不會有bug -->
        <el-table ref="tableRef" :data="pagefilterTableListData" row-key="id">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="storeName" label="分店" align="center" />
          <el-table-column prop="number" label="桌號" align="center" />
          <el-table-column label="QR code" align="center">
            <template #default="scope">
              <router-link :to="`/customer/${scope.row.id}`">
                <QRCodeVue3
                  myclass="qrcode"
                  :width="50"
                  :height="50"
                  :value="`https://i83.vercel.app/${scope.row.number}-${scope.row.orderToken}`"
                  :dotsOptions="{ type: 'classy' }"
                />
              </router-link>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="狀態" width="80" align="center">
            <template #default="scope">
              <el-tag v-if="scope.row.enable" type="success" effect="plain">啟用</el-tag>
              <el-tag v-else type="danger" effect="plain">禁用</el-tag>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="200" align="center">
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
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
    <!-- 新增/修改 桌號 -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentUpdateId === undefined ? '新增桌號' : '修改桌號'"
      @open="setForm"
      @close="resetForm"
      width="35%"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item prop="storeName" label="分店">
          <el-select v-model="formData.storeName" placeholder="請選擇分店" style="width: 100%">
            <el-option v-for="item in storeList" :key="item" v-show="item !== '全部'" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item prop="number" label="桌號">
          <el-input v-model="formData.number" placeholder="請輸入桌號" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">確認</el-button>
      </template>
    </el-dialog>

    <!-- 新增 顧客 -->
    <el-dialog
      v-model="customerDialogVisible"
      title="新增顧客"
      @open="setCustomerForm"
      @close="resetCustomerForm"
      width="35%"
    >
      <el-form
        ref="customerFormRef"
        :model="customerFormData"
        :rules="customerFormRules"
        label-width="100px"
        label-position="left"
      >
        <el-form-item prop="storeName" label="分店">
          <el-select v-model="customerFormData.storeName" placeholder="請選擇分店" style="width: 100%">
            <el-option v-for="item in storeList" :key="item" v-show="item !== '全部'" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item prop="number" label="桌號">
          <el-select v-model="customerFormData.number" placeholder="請選擇桌號" style="width: 100%">
            <el-option
              v-for="item in tableListData"
              :key="item.id"
              v-show="item.storeName === customerFormData.storeName && !item.enable"
              :label="item.number"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="customerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateCustomer">確認</el-button>
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

<style lang="scss">
.qrcode {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
