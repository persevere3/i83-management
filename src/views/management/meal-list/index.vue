<script lang="ts" setup>
import { reactive, ref, watch, computed } from "vue"

import { storeToRefs } from "pinia"

// import { createTableDataApi, deleteTableDataApi, updateTableDataApi, getTableDataApi } from "@/api/table"
import { type GetMealData, CreateMealRequestData } from "@/api/meal-list/types/meal"
import { createMealDataApi, deleteMealDataApi } from "@/api/meal-list"

import { useMealsStore } from "@/store/modules/meals"
import { useSelectsStore } from "@/store/modules/selects"

import { type FormInstance, type FormRules, type TableInstance, ElMessage, ElMessageBox } from "element-plus"
import { Refresh, CirclePlus, Delete, RefreshRight, Plus } from "@element-plus/icons-vue"
// import { Search, Refresh, CirclePlus, Delete, Download, RefreshRight } from "@element-plus/icons-vue"

//#region upload
import { genFileId } from "element-plus"
import type { UploadInstance, UploadProps, UploadRawFile } from "element-plus"

const upload = ref<UploadInstance>()

const handleExceed: UploadProps["onExceed"] = (files) => {
  upload.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  upload.value!.handleStart(file)
}
//#endregion

import { usePagination } from "@/hooks/usePagination"
import { useNumberFormat } from "@/hooks/useNumberFormat"

defineOptions({
  // 命名当前组件
  name: "MealList"
})

const { loading } = storeToRefs(useMealsStore())

const { selectListData } = storeToRefs(useSelectsStore())
const { getSelectData } = useSelectsStore()

getSelectData()

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const { thousandsSeparatorFormat } = useNumberFormat()

//#region 增
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
interface Select {
  selectName: string
  showOptionList: string[]
  max: number
  min: number
}
const formData = reactive<{
  categoryList: string[]
  mealName: string
  origin: string
  mealTextList: string[]
  selectList: Select[]
  price: number
}>({
  categoryList: [],
  mealName: "",
  origin: "",
  mealTextList: [],
  selectList: [],
  price: 0
})
const image = ref<string>("")
const formDataSelectList = ref<string[]>([])
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
        // api ==================================================
        const createMealData: CreateMealRequestData = {
          id: 0,
          // Categorys: [1, 2],
          mealName: "板腱牛",
          file: image.value,
          // Image: ''
          // Origin: '美國'
          // SelectList: ''
          mealTextList: ["醬料擇一", "含義大利麵，蛋，蔬菜"],
          price: 200
          // Count: 50,
          // Enable: 1
        }
        const createMealFormData = new FormData()
        for (const [key, value] of Object.entries(createMealData)) {
          if (Array.isArray(value)) createMealFormData.append(key, JSON.stringify(value))
          else createMealFormData.append(key, value)
        }
        createMealDataApi(createMealFormData)
          .then(() => {
            ElMessage.success("新增成功")
          })
          .finally(() => {
            dialogVisible.value = false
          })
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
  document.querySelector("input[type=file]")?.addEventListener("change", (event: any) => {
    image.value = event.target.files[0]
    // const reader = new FileReader()
    // reader.readAsDataURL(event.target.files[0])
    // reader.onload = function () {
    //   image.value = reader.result
    // }
  })
  // 新增餐點
  if (!currentUpdateId.value) {
    formData.categoryList = []
    formData.mealName = ""
    formData.origin = ""
    formData.mealTextList = []
    formData.price = 0
  }

  // 新增餐點 && 選中某分類
  if (!currentUpdateId.value && activeCategory.value !== "全部") {
    formData.categoryList[0] = activeCategory.value
  }
}
const resetForm = () => {
  currentUpdateId.value = undefined
  formRef.value?.resetFields()
}
//#endregion

//#region 選擇
const selectDialogVisible = ref<boolean>(false)

const batchSelect = () => {
  const selections = tableRef.value?.getSelectionRows()
  if (!selections.length) return

  selectDialogVisible.value = true
}
const handleSelect = (row: GetMealData) => {
  currentUpdateId.value = row.mealName
  formData.mealName = row.mealName
  formDataSelectList.value = JSON.parse(JSON.stringify(row.selectList?.map((select) => select.selectName) || []))
  selectDialogVisible.value = true
}
const confirmSelect = () => {
  if (currentUpdateId.value) {
    const meal = mealListData.value.find((meal) => meal.mealName === currentUpdateId.value)
    if (meal) meal.selectList = JSON.parse(JSON.stringify(formData.selectList))
    ElMessage.success("修改選擇成功")
  } else {
    const selections = tableRef.value?.getSelectionRows()
    selections.forEach((element: GetMealData) => {
      element.selectList = JSON.parse(JSON.stringify(formData.selectList))
    })
    ElMessage.success("批量添加選擇成功")
  }

  getMealData()
  selectDialogVisible.value = false
}
const setSelectForm = () => {
  // 批量添加選擇
  if (!currentUpdateId.value) {
    formData.mealName = ""
    formDataSelectList.value = []
  }
}
const resetSelectForm = () => {
  currentUpdateId.value = undefined
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

const testDeleteApi = () => {
  deleteMealDataApi(54)
    .then(() => {
      ElMessage.success("刪除成功")
    })
    .finally(() => {})
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

const testUpdateApi = () => {
  // api ==================================================
  const createMealData: CreateMealRequestData = {
    id: 0,
    // Categorys: [1, 2],
    mealName: "板腱牛",
    file: image.value,
    // Image: ''
    // Origin: '美國'
    // SelectList: ''
    // MealTextList: ''
    price: 200
    // Count: 50,
    // Enable: 1
  }
  const createMealFormData = new FormData()
  for (const [key, value] of Object.entries(createMealData)) {
    createMealFormData.append(key, value)
  }
  // updateMealDataApi(createMealFormData)
  //   .then(() => {
  //     ElMessage.success("修改成功")
  //   })
  //   .finally(() => {})
}
//#endregion

//#region 查
const { mealListData } = storeToRefs(useMealsStore())
const { getMealData } = useMealsStore()
getMealData()

const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  mealName: ""
})

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
  let list: GetMealData[]
  if (activeCategory.value === "全部") list = mealListData.value
  else list = mealListData.value.filter((item) => item.categoryList.find((item2) => item2 === activeCategory.value))
  list = list.filter((item) => item.mealName.indexOf(searchData.mealName) > -1)
  return list
})
watch(
  filterMealListData,
  () => {
    paginationData.total = filterMealListData.value.length
    paginationData.currentPage = 1
    console.log("filterMealListData end")
  },
  { immediate: true }
)

// startIndex, endIndex => pagefilterMealListData
const startIndex = ref(0)
const endIndex = ref(0)
watch(
  [() => paginationData.currentPage, () => paginationData.pageSize],
  () => {
    const current = paginationData.currentPage
    const size = paginationData.pageSize
    startIndex.value = current * size - size
    endIndex.value = startIndex.value + size - 1
    console.log("currentPage end")
  },
  { immediate: true }
)
const pagefilterMealListData = computed<GetMealData[]>(() => {
  console.log("pagefilterMealListData start")
  const list: GetMealData[] = filterMealListData.value.filter(
    (meal, index) => index >= startIndex.value && index <= endIndex.value
  )
  return list
})
//#endregion

watch(formDataSelectList, (list) => {
  const newSelectList: Select[] = []
  list.forEach((item) => {
    const meal = mealListData.value.find((meal) => meal.mealName === formData.mealName)
    const mealSelect = meal?.selectList?.find((select) => select.selectName === item)
    if (mealSelect) {
      newSelectList.push(JSON.parse(JSON.stringify(mealSelect)))
    } else {
      newSelectList.push({
        selectName: item,
        showOptionList: selectListData.value.find((select) => select.selectName === item)?.optionList || [],
        max: 1,
        min: 1
      })
    }
  })

  formData.selectList = JSON.parse(JSON.stringify(newSelectList))
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
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <el-button type="primary" :icon="CirclePlus" @click="dialogVisible = true">新增餐點</el-button>
          <el-button type="warning" :icon="Delete" @click="batchSelect()">批量添加選擇</el-button>
          <el-button type="danger" :icon="Delete" @click="batchDelete()">批量刪除</el-button>
          <el-button type="danger" :icon="Delete" @click="testDeleteApi()">test刪除</el-button>
          <el-button type="danger" :icon="Delete" @click="testUpdateApi()">test修改</el-button>
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
        <el-table ref="tableRef" :data="pagefilterMealListData" row-key="mealName">
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
          <el-table-column label="價錢" width="100" align="center">
            <template #default="scope"> {{ thousandsSeparatorFormat(scope.row.price) }} </template>
          </el-table-column>
          <el-table-column prop="status" label="狀態" width="80" align="center">
            <template #default="scope">
              <el-tag v-if="!scope.row.isShow" type="success" effect="plain">啟用</el-tag>
              <el-tag v-else type="danger" effect="plain">禁用</el-tag>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="200" align="center">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="handleUpdate(scope.row)">修改</el-button>
              <el-button type="warning" text bg size="small" @click="handleSelect(scope.row)">選擇</el-button>
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
        <el-form-item>
          <el-upload
            ref="uploadRef"
            accept="image/jpg,image/jpeg,image/png"
            :limit="1"
            :on-exceed="handleExceed"
            :auto-upload="false"
          >
            <el-button type="primary">select file</el-button>
            <template #tip>
              <div class="el-upload__tip text-red">limit 1 file, new file will cover the old file</div>
            </template>
          </el-upload>
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

    <!-- 新增/修改 選擇 -->
    <el-dialog
      v-model="selectDialogVisible"
      :title="currentUpdateId === undefined ? '批量添加選擇' : '修改選擇'"
      @open="setSelectForm"
      @close="resetSelectForm"
      width="40%"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
        <el-form-item v-if="formData.mealName" prop="mealName" label="餐點名稱">
          <el-input v-model="formData.mealName" disabled />
        </el-form-item>
        <el-form-item prop="" label="選擇">
          <el-select v-model="formDataSelectList" multiple placeholder="選擇" style="width: 100%">
            <el-option
              v-for="item in selectListData"
              :key="item.selectName"
              :label="item.selectName"
              :value="item.selectName"
            />
          </el-select>
        </el-form-item>
        <template v-for="item in formData.selectList" :key="item.selectName">
          <el-form-item :prop="item.selectName" :label="item.selectName">
            <el-checkbox-group v-model="item.showOptionList">
              <el-checkbox
                v-for="option in selectListData.find((select) => select.selectName === item.selectName)?.optionList"
                :key="option"
                :label="option"
              />
            </el-checkbox-group>

            <div class="mt-3">
              最少選擇
              <el-input-number class="mx-1" v-model="item.min" :min="0" :max="item.max" /> 項
            </div>
            <div class="mt-3">
              最多選擇
              <el-input-number class="mx-1" v-model="item.max" :min="1" :max="item.showOptionList.length" /> 項
            </div>
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <el-button @click="selectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSelect">確認</el-button>
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

.el-form-item__content {
  div + button {
    margin-top: 5px;
  }
}

.el-checkbox-group {
  width: 100%;
}
</style>
