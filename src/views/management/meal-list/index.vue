<script lang="ts" setup>
import { ref, reactive, computed, watch, nextTick } from "vue"

import { type ReadData as MealReadData, type CreateReqData } from "@/api/meal-list/types/meal"
import { type MealSelectReadData } from "@/api/select-list/types/select"
import * as Meal from "@/api/meal-list"
import * as Category from "@/api/category-list"

import { storeToRefs } from "pinia"
import { useCommonStore } from "@/store/modules/common"
import { useMealsStore } from "@/store/modules/meals"
import { useCategoriesStore } from "@/store/modules/categories"
import { useSelectsStore } from "@/store/modules/selects"

import { type FormInstance, type TableInstance, ElMessage, ElMessageBox } from "element-plus"
import { Refresh, CirclePlus, Delete, RefreshRight, Plus } from "@element-plus/icons-vue"

import { usePagination } from "@/hooks/usePagination"
import { useNumberFormat } from "@/hooks/useNumberFormat"

defineOptions({
  // 命名当前组件
  name: "MealList"
})

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()
const { thousandsSeparatorFormat } = useNumberFormat()

//#region table
const tableRef = ref<TableInstance>()
//#endregion

//#region 新增/修改 dialog form
const dialogVisible = ref<boolean>(false)
const branchMealEnableDialogVisible = ref<boolean>(false)
const branchMealEnable = ref<number>(1)

const isBatchUpdate = ref(false)
const currentUpdateId = ref<number>()

const formRef = ref<FormInstance>()
const activeSelectIdList = ref<number[]>([])
watch(activeSelectIdList, (newData, originData) => {
  const newFormdataSelectList: MealSelectReadData[] = []
  newData.forEach((item) => {
    const originId = originData.find((item2) => item2 === item)
    let newItem: MealSelectReadData | undefined
    if (originId) {
      newItem = formData.selectList?.find((item2) => item2.id === item)
    } else {
      newItem = selectListData.value
        ?.map((item3) => {
          return {
            id: item3.id,
            selectName: item3.title,
            showOptionList: [],
            max: item3.max,
            min: item3.min
          }
        })
        ?.find((item2) => item2.id === item)
    }
    if (newItem) newFormdataSelectList.push(JSON.parse(JSON.stringify(newItem)))
  })
  formData.selectList = newFormdataSelectList
})
const formData = reactive<Omit<CreateReqData, "id">>({
  categorys: [],
  mealName: "",
  file: "",
  origin: "",
  mealTextList: [],
  selectList: [],
  price: undefined,
  count: "",
  mainMeal: false,
  enable: 1
})
const formRules: any = reactive({
  mealName: [{ required: true, trigger: "blur", message: "請輸入餐點名稱" }],
  file: [{ required: true, trigger: "blur", message: "請上傳餐點圖片" }],
  price: [{ required: true, trigger: "blur", message: "請輸入價錢" }]
})
const isFormdataReset = reactive<{ [propName: string]: boolean }>({
  categorys: false,
  // image: false,
  origin: false,
  mealTextList: false,
  selectList: false,
  count: false
})

//#region image
// show
const image = ref<any>("")

// formData.file => image.value
const reader = new FileReader()
reader.addEventListener("load", () => {
  image.value = reader.result
})

const inputHandler = (event: any) => {
  const img = event.target.files[0]
  if (!img) return
  if (img.type !== "image/jpg" && img.type !== "image/jpeg" && img.type !== "image/png") {
    ElMessage.error("格式錯誤!")
    return
  }
  formData.file = img
  reader.readAsDataURL(formData.file)
  event.target.value = ""
}
const deleteImg = () => {
  formData.file = ""
  image.value = ""
}
//#endregion

const batchMeals = ref<MealReadData[]>([])
const openDialog = (row?: MealReadData, batchUpdate?: boolean) => {
  formRef.value?.resetFields()

  if (batchUpdate) {
    const selections = tableRef.value?.getSelectionRows()
    if (!selections.length) return
    batchMeals.value = mealListData.value.filter((item: MealReadData) =>
      selections.find((item2: MealReadData) => item2.id === item.id)
    )
  } else batchMeals.value = []
  isBatchUpdate.value = batchUpdate ? true : false

  if (row) {
    // 修改餐點
    currentUpdateId.value = row.id
    formData.categorys = JSON.parse(JSON.stringify(row.category.map((item) => item.id)))
    formData.mealName = row.mealName

    formRules.file[0].required = true
    if (row.image) formData.file = "1"
    image.value = row.image

    formData.origin = row.origin
    formData.mealTextList = JSON.parse(JSON.stringify(row.mealTextList))

    activeSelectIdList.value = row.selectList?.map((item) => item.id)
    setTimeout(() => {
      formData.selectList = JSON.parse(JSON.stringify(row.selectList))
    }, 0)

    formData.price = row.price
    formData.count = row.count
    formData.mainMeal = row.mainMeal
    formData.enable = row.enable
  } else {
    // 新增餐點 or 批量修改餐點
    currentUpdateId.value = undefined
    for (const key in isFormdataReset) isFormdataReset[key] = false

    formData.categorys = []
    // 選中某分類下新增餐點
    if (!batchUpdate && activeCategory.value !== 0) formData.categorys[0] = activeCategory.value

    formData.mealName = ""

    formRules.file[0].required = true
    deleteImg()

    formData.origin = ""
    formData.mealTextList = []

    activeSelectIdList.value = []

    formData.price = undefined
    formData.count = ""

    if (!batchUpdate) {
      formData.mainMeal = false
      formData.enable = 1
    } else {
      formData.mainMeal = undefined
      formData.enable = undefined
    }
  }
  dialogVisible.value = true

  nextTick(() => {
    const input: any = document.querySelector("input[type=file]")
    input?.removeEventListener("input", inputHandler)
    input?.addEventListener("input", inputHandler)
  })
}
const openBranchMealEnableDialog = () => {
  const selections = tableRef.value?.getSelectionRows()
  if (!selections.length) return
  branchMealEnable.value = 1
  branchMealEnableDialogVisible.value = true
}

const addFormDataMealText = () => {
  formData.mealTextList?.push("")
}

const handleConfirm = () => {
  formData.mealTextList = formData.mealTextList?.filter((item) => item)
  formRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      if (currentUpdateId.value === undefined) {
        isBatchUpdate.value ? handleBatchUpdate() : handleCreate()
      } else handleUpdate()
    } else {
      console.error("表單校驗不通過", fields)
    }
  })
}

const objToFormData = (obj: { [propName: string]: any }) => {
  const formData = new FormData()
  for (const [key, value] of Object.entries(obj)) {
    if (key === "categorys" && value !== "noChange") {
      value.forEach((item: any) => {
        formData.append(key, item)
      })
    } else if (Array.isArray(value)) formData.append(key, JSON.stringify(value))
    else formData.append(key, value)
  }
  return formData
}
//#endregion

//#region 增
const handleCreate = () => {
  Meal.createDataApi(
    objToFormData({
      id: 0,
      ...formData
    })
  )
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
const handleDelete = (row?: MealReadData) => {
  let text = ""
  let activeIds: number[]
  if (row) {
    text = (activeCategory.value === 0 ? "從全部中" : "從分類中") + `刪除餐點:${row.mealName}，確認刪除？`
    activeIds = [row.id]
  } else {
    text = (activeCategory.value === 0 ? "從全部中" : "從分類中") + "批量刪除餐點，確認刪除？"
    const selections = tableRef.value?.getSelectionRows()
    if (!selections.length) return
    activeIds = selections.map((item: any) => item.id)
  }

  ElMessageBox.confirm(text, "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    if (activeCategory.value === 0) {
      Meal.deleteDataApi(activeIds)
        .then(() => {
          ElMessage.success("删除成功")
          resetData()
        })
        .finally(() => {
          dialogVisible.value = false
        })
    } else {
      const category = categoryListData.value.find((item) => item.id === activeCategory.value)
      if (!category) return
      const products = category.products
        .map((item) => item.id)
        .filter((item2) => !activeIds.find((item3) => item3 === item2))
      Category.updateDataApi({
        id: category.id,
        name: category.name,
        text: category.text,
        products
      })
        .then(() => {
          ElMessage.success("删除成功")
          resetData()
        })
        .finally(() => {
          dialogVisible.value = false
        })
    }
  })
}
//#endregion

//#region 改
const handleUpdate = () => {
  const updateFormData = JSON.parse(JSON.stringify(formData))
  updateFormData.id = currentUpdateId.value
  // 改圖   => file: (binary)，後端覆蓋原本的image(base64)
  // 不改圖 => file: 1，後端維持原本的image
  if (process.env.NODE_ENV === "development") {
    updateFormData.image = image.value.replace("https://preview.uniqcarttest.com", "")
  } else {
    updateFormData.image = image.value.replace("https://preview.uniqcarttest.com", "")
    // updateFormData.image = image.value
  }
  delete updateFormData.categorys
  delete updateFormData.file

  Meal.updateDataApi(
    objToFormData({
      categorys: formData.categorys,
      products: [updateFormData],
      file: formData.file
    })
  )
    .then(() => {
      ElMessage.success("修改成功")
      resetData()
    })
    .finally(() => {
      dialogVisible.value = false
    })
}
const handleBatchUpdate = () => {
  const newBatchMeal = JSON.parse(JSON.stringify(batchMeals.value))
  newBatchMeal.forEach((item: any) => {
    delete item.category
    if (process.env.NODE_ENV === "development") {
      item.image = item.image.replace("https://preview.uniqcarttest.com", "")
    } else {
      item.image = item.image.replace("https://preview.uniqcarttest.com", "")
    }
    item.mealTextList = isFormdataReset.mealTextList
      ? []
      : formData.mealTextList?.length
      ? formData.mealTextList
      : item.mealTextList
    item.selectList = isFormdataReset.selectList
      ? []
      : formData.selectList?.length
      ? formData.selectList
      : item.selectList
    item.origin = isFormdataReset.origin ? "" : formData.origin ? formData.origin : item.origin
    item.price = formData.price ? formData.price : item.price
    item.count = isFormdataReset.count ? "" : formData.count ? formData.count : item.count

    item.mainMeal = formData.mainMeal === undefined ? item.mainMeal : formData.mainMeal
    item.enable = formData.enable === undefined ? item.enable : formData.enable
  })

  Meal.updateDataApi(
    objToFormData({
      categorys: isFormdataReset.categorys ? [] : formData.categorys?.length ? formData.categorys : "noChange",
      products: newBatchMeal,
      file: ""
    })
  )
    .then(() => {
      ElMessage.success("修改成功")
      resetData()
    })
    .finally(() => {
      dialogVisible.value = false
    })
}

const changeMealEnable = (id: number) => {
  if (!id) return
  const meal = mealListData.value.find((item) => item.id === id)
  if (!meal) return

  const newEnableText = meal.enable ? "關閉" : "開啟"
  const text = `${newEnableText}餐點: ${meal.mealName}，確認${newEnableText}？`

  ElMessageBox.confirm(text, "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    const newMeal = JSON.parse(JSON.stringify(meal))
    newMeal.enable = !newMeal.enable

    if (process.env.NODE_ENV === "development") {
      newMeal.image = newMeal.image.replace("https://preview.uniqcarttest.com", "")
    } else {
      newMeal.image = newMeal.image.replace("https://preview.uniqcarttest.com", "")
    }

    Meal.updateDataApi(
      objToFormData({
        categorys: newMeal.category.map((item: MealReadData) => item.id),
        products: [newMeal],
        file: 1
      })
    ).then(() => {
      ElMessage.success(`${newEnableText}成功`)
      resetData()
    })
  })
}
const changeBranchMealEnable = (id?: number) => {
  let newEnableText = ""
  let newEnable = 1
  let text = ""
  let ids: number[] = []

  if (id) {
    const meal = mealListData.value.find((item) => item.id === id)
    if (!meal) return
    newEnable = meal.enable ? 0 : 1
    newEnableText = newEnable ? "開啟" : "關閉"
    text = `${newEnableText}分店餐點: ${meal.mealName}，確認${newEnableText}？`
    ids = [id]
  } else {
    const selections = tableRef.value?.getSelectionRows()
    if (!selections.length) return
    newEnable = branchMealEnable.value
    newEnableText = newEnable ? "開啟" : "關閉"
    text = `批量${newEnableText}分店餐點，確認${newEnableText}？`
    ids = selections.map((item: any) => item.id)
  }

  ElMessageBox.confirm(text, "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    if (!activeStore.value) return
    Meal.updateBranchEnableApi({
      productIds: ids,
      storeId: activeStore.value.id,
      changeType: newEnable ? 1 : 0
    })
      .then(() => {
        ElMessage.success(`${newEnableText}成功`)
        resetData()
      })
      .finally(() => {
        branchMealEnableDialogVisible.value = false
      })
  })
}
//#endregion

//#region 查
const { role, activeStore } = storeToRefs(useCommonStore())

const { loading, mealListData } = storeToRefs(useMealsStore())
const { getMealData } = useMealsStore()
getMealData()

const activeCategory = ref(0)
const { categoryListData } = storeToRefs(useCategoriesStore())
const { getCategoryData } = useCategoriesStore()
getCategoryData()

watch([mealListData, categoryListData], () => {
  if (mealListData && categoryListData) {
    const products = JSON.parse(JSON.stringify(mealListData.value))
    products.forEach((item: any) => {
      delete item.category
    })
    if (categoryListData.value.find((item) => item.id === 0))
      categoryListData.value.splice(0, 1, { id: 0, name: "全部", text: "", products })
    else categoryListData.value.splice(0, 0, { id: 0, name: "全部", text: "", products })
  }
})

const resetData = () => {
  getMealData()
  getCategoryData()
}

watch(activeStore, () => {
  resetData()
})

const { selectListData } = storeToRefs(useSelectsStore())
const { getSelectData } = useSelectsStore()
getSelectData()
//#endregion

//#region 過濾
const searchFormRef = ref<FormInstance>()
const searchData = reactive({
  mealName: ""
})
const resetSearch = () => {
  searchData.mealName = ""
}

const filterListData = computed<MealReadData[]>(() => {
  return mealListData.value
    .filter((item) => activeCategory.value === 0 || item.category?.find((item2) => item2.id === activeCategory.value))
    .filter((item) => item.mealName.indexOf(searchData.mealName) > -1)
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
const pagefilterListData = computed<MealReadData[]>(() => {
  return filterListData.value.filter((item, index) => index >= startIndex.value && index <= endIndex.value)
})
//#endregion
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
    <!--  -->
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <template v-if="role === 'super-admin'">
            <el-button type="primary" :icon="CirclePlus" @click="openDialog()">新增餐點</el-button>
            <el-button type="warning" :icon="CirclePlus" @click="openDialog(undefined, true)">批量修改餐點</el-button>
            <el-button type="danger" :icon="Delete" @click="handleDelete()">批量刪除</el-button>
          </template>
          <template v-else>
            <el-button type="warning" :icon="CirclePlus" @click="openBranchMealEnableDialog">批量修改狀態</el-button>
          </template>
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
      <div class="toolbar-wrapper">
        <div>
          <el-button
            v-for="item in categoryListData"
            :key="item.id"
            :type="item.id === activeCategory ? 'success' : 'info'"
            @click="activeCategory = item.id"
          >
            {{ item.name }}({{ item.products.length }})
          </el-button>
        </div>
      </div>
      <div class="table-wrapper">
        <!-- 必須加 row-key hover sortable 才不會有bug -->
        <el-table ref="tableRef" :data="pagefilterListData" row-key="id">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="餐點圖片" width="80" align="center">
            <template #default="scope">
              <div class="mealImgContainer">
                <img class="mealImg" :src="scope.row.image" alt="" srcset="" />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="餐點名稱 / 肉品來源" width="150" align="center">
            <template #default="scope">
              <div>{{ scope.row.mealName }}</div>
              <div>{{ scope.row.origin }}</div>
            </template>
          </el-table-column>
          <el-table-column label="餐點說明" align="left">
            <template #default="scope">
              <div v-for="item in scope.row.mealTextList" :key="item">- {{ item }}</div>
            </template>
          </el-table-column>
          <el-table-column label="餐點選擇" align="left">
            <template #default="scope">
              <div v-for="item in scope.row.selectList" :key="item">- {{ item.selectName }}</div>
            </template>
          </el-table-column>
          <el-table-column label="價錢" width="100" align="center">
            <template #default="scope"> {{ thousandsSeparatorFormat(scope.row.price) }} </template>
          </el-table-column>
          <!-- <el-table-column label="數量" width="100" align="center">
            <template #default="scope"> {{ scope.row.count }} </template>
          </el-table-column> -->
          <el-table-column prop="status" width="100" align="center">
            <template #header>
              <div v-if="activeStore?.id !== 0">{{ activeStore?.storeName }}</div>
              <div>餐點狀態</div>
            </template>
            <template #default="scope">
              <el-tag v-if="scope.row.enable" type="success" effect="plain">開啟</el-tag>
              <el-tag v-else type="danger" effect="plain">關閉</el-tag>
              <el-switch
                :model-value="scope.row.enable"
                style="--el-switch-on-color: var(--el-color-success); --el-switch-off-color: var(--el-color-danger)"
                :active-value="1"
                :inactive-value="0"
                @click="activeStore?.id === 0 ? changeMealEnable(scope.row.id) : changeBranchMealEnable(scope.row.id)"
              />
            </template>
          </el-table-column>
          <el-table-column v-if="role === 'super-admin'" fixed="right" label="操作" width="80" align="center">
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
    <!-- 新增/修改 -->
    <el-dialog
      v-model="dialogVisible"
      :title="
        currentUpdateId === undefined
          ? isBatchUpdate
            ? '批量修改餐點 (請填寫或選擇要批量修改的欄位)'
            : '新增餐點'
          : '修改餐點'
      "
      width="35%"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="!isBatchUpdate ? formRules : {}"
        label-width="100px"
        label-position="left"
      >
        <el-form-item prop="" label="餐點分類">
          <el-switch v-if="isBatchUpdate" v-model="isFormdataReset.categorys" inactive-text="清除" />
          <el-select
            :disabled="isFormdataReset.categorys"
            v-model="formData.categorys"
            multiple
            placeholder="餐點分類"
            style="width: 100%"
          >
            <el-option
              v-for="item in categoryListData"
              :key="item.id"
              v-show="item.id !== 0"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!isBatchUpdate" prop="mealName" label="餐點名稱">
          <el-input v-model="formData.mealName" placeholder="請輸入餐點名稱" />
        </el-form-item>
        <el-form-item v-if="!isBatchUpdate" prop="file" label="餐點圖片">
          <!-- <el-switch v-if="isBatchUpdate" v-model="isFormdataReset.image" inactive-text="清除" /> -->
          <el-button class="uploadBtn" type="primary" :icon="CirclePlus"
            >上傳圖片
            <input :disabled="isFormdataReset.image" class="uploadImg" type="file" ref="file" accept="image/*" />
          </el-button>
          <template v-if="image">
            <img :src="image" />
            <el-button
              type="danger"
              class="deleteImgBtn"
              :icon="Delete"
              @click="!isFormdataReset.image ? deleteImg() : ''"
            />
          </template>
        </el-form-item>
        <el-form-item prop="origin" label="肉品來源">
          <el-switch v-if="isBatchUpdate" v-model="isFormdataReset.origin" inactive-text="清除" />
          <el-input :disabled="isFormdataReset.origin" v-model="formData.origin" placeholder="請輸入肉品來源" />
        </el-form-item>
        <el-form-item prop="" label="餐點說明" v-if="formData.mealTextList">
          <el-switch v-if="isBatchUpdate" v-model="isFormdataReset.mealTextList" inactive-text="清除" />
          <template v-for="(item, index) in formData.mealTextList" :key="index">
            <el-input
              :disabled="isFormdataReset.mealTextList"
              v-model="formData.mealTextList[index]"
              placeholder="請輸入餐點說明"
            />
          </template>
          <el-tooltip content="新增說明">
            <el-button
              type="primary"
              :icon="Plus"
              circle
              @click="!isFormdataReset.mealTextList ? addFormDataMealText() : ''"
            />
          </el-tooltip>
        </el-form-item>
        <el-form-item prop="" label="餐點選擇">
          <el-switch v-if="isBatchUpdate" v-model="isFormdataReset.selectList" inactive-text="清除" />
          <el-select
            :disabled="isFormdataReset.selectList"
            v-model="activeSelectIdList"
            multiple
            placeholder="餐點選擇"
            style="width: 100%"
          >
            <el-option v-for="item in selectListData" :key="item.id" :label="item.title" :value="item.id" />
          </el-select>
        </el-form-item>
        <template v-for="item in formData.selectList" :key="item.id">
          <el-form-item :prop="item.selectName" :label="item.selectName">
            <el-checkbox-group :disabled="isFormdataReset.selectList" v-model="item.showOptionList">
              <el-checkbox
                v-for="option in selectListData.find((select) => select.id === item.id)?.optionList"
                :key="option.title"
                :label="option"
              >
                {{ option.title }}
              </el-checkbox>
            </el-checkbox-group>
            <div class="mt-3">
              最少選擇
              <el-input-number
                :disabled="isFormdataReset.selectList"
                class="mx-1"
                v-model="item.min"
                :min="0"
                :max="item.showOptionList.length"
              />
              項
            </div>
            <div class="mt-3">
              最多選擇
              <el-input-number
                :disabled="isFormdataReset.selectList"
                class="mx-1"
                v-model="item.max"
                :min="0"
                :max="item.showOptionList.length"
              />
              項
            </div>
          </el-form-item>
        </template>
        <el-form-item prop="price" label="價錢">
          <el-input v-model="formData.price" placeholder="請輸入價錢" />
        </el-form-item>
        <!-- <el-form-item prop="count" label="數量">
          <el-switch v-if="isBatchUpdate" v-model="isFormdataReset.count" inactive-text="清除" />
          <el-input :disabled="isFormdataReset.count" type="number" v-model="formData.count" placeholder="請輸入數量" />
        </el-form-item> -->
        <el-form-item prop="mainMeal" label="是否為主餐">
          <el-select v-model="formData.mainMeal" placeholder="是否為主餐" style="width: 100%">
            <el-option label="是" :value="true" />
            <el-option label="否" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item prop="enable" label="狀態">
          <el-select v-model="formData.enable" placeholder="狀態" style="width: 100%">
            <el-option label="開啟" :value="1" />
            <el-option label="關閉" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm()">確認</el-button>
      </template>
    </el-dialog>

    <!-- 批量修改狀態 -->
    <el-dialog v-model="branchMealEnableDialogVisible" title="批量修改分店餐點狀態" width="35%">
      <el-select v-model="branchMealEnable" placeholder="狀態" style="width: 100%">
        <el-option label="開啟" :value="1" />
        <el-option label="關閉" :value="0" />
      </el-select>
      <template #footer>
        <el-button @click="branchMealEnableDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="changeBranchMealEnable()">確認</el-button>
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

.el-button {
  margin-left: 0;
  margin-right: 12px;
  margin-bottom: 6px;
}
.cell {
  .el-button {
    margin: 0px;

    &:first-child {
      margin-bottom: 6px;
    }
  }
}

.table-wrapper {
  margin-bottom: 20px;
}
.mealImgContainer {
  display: flex;
  align-items: center;

  .mealImg {
    width: 50px;
    height: 50px;
  }
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

.uploadBtn {
  margin-bottom: 0;
  position: relative;

  input {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
  }
}
.uploadImg {
  height: 60px;
}
.deleteImgBtn {
  margin-left: 12px;
  margin-bottom: 0;
}

.el-checkbox-group {
  width: 100%;
}
.el-dialog .el-switch {
  width: 100%;
}
</style>
