<script lang="ts" setup>
import { reactive, ref, onMounted, watch, computed } from "vue"

// import { createTableDataApi, deleteTableDataApi, updateTableDataApi, getTableDataApi } from "@/api/table"
import { type GetMealData } from "@/api/meal-list/types/meal"

import { type FormInstance, type FormRules, type TableInstance, ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, CirclePlus, Delete, RefreshRight, Plus } from "@element-plus/icons-vue"
// import { Search, Refresh, CirclePlus, Delete, Download, RefreshRight } from "@element-plus/icons-vue"

import { usePagination } from "@/hooks/usePagination"

import Sortable from "sortablejs"

defineOptions({
  // 命名当前组件
  name: "MealList"
})

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 增
const dialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
const formData = reactive({
  categories: [],
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
const resetForm = () => {
  currentUpdateId.value = undefined
  formData.mealName = ""
  formData.origin = ""
  formData.mealTextList = []
  formData.price = 0
  formRef.value?.resetFields()
}
//#endregion

//#region 删
const handleDelete = (row: GetMealData) => {
  ElMessageBox.confirm(`正在刪除餐點:${row.mealName}，確認刪除？`, "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    mealListData.value = mealListData.value.filter((item) => item.mealName !== row.mealName)
    ElMessage.success("删除成功")
    getMealData()
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
    selections.forEach((element: GetMealData) => {
      const index = mealListData.value.findIndex((item) => item.mealName === element.mealName)
      index > -1 ? mealListData.value.splice(index, 1) : null
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
  formData.mealName = row.mealName
  formData.origin = row.origin
  formData.mealTextList = JSON.parse(JSON.stringify(row.mealTextList))
  formData.price = row.price
  dialogVisible.value = true
}
//#endregion

//#region 查
const mealListData = ref<GetMealData[]>([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
  mealName: ""
})
const getMealData = () => {
  loading.value = true
  !mealListData.value.length
    ? (mealListData.value = [
        //#region 單打獨鬥
        {
          categoryList: ["單打獨鬥區"],
          mealName: "沙朗牛排5oz",
          origin: "巴拉圭",
          mealTextList: ["醬料擇一", "含義大利麵、蛋、蔬菜"],
          price: 200
        },
        {
          categoryList: ["單打獨鬥區"],
          mealName: "厚切里肌豬排",
          origin: "台灣豬",
          mealTextList: ["醬料擇一", "含義大利麵、蛋、蔬菜"],
          price: 220
        },
        {
          categoryList: ["單打獨鬥區", "分進合擊區"],
          mealName: "海陸雙拼",
          origin: "",
          mealTextList: ["【沙朗牛/豬/雞/羊/鱈魚】擇二", "醬料擇一", "含義大利麵、蛋、蔬菜"],
          price: 300
        },
        {
          categoryList: ["單打獨鬥區"],
          mealName: "黃金雞腿排",
          origin: "美國",
          mealTextList: ["醬料擇一", "含義大利麵、蛋、蔬菜"],
          price: 220
        },
        {
          categoryList: ["單打獨鬥區"],
          mealName: "大比目魚排",
          origin: "冰島",
          mealTextList: ["醬料擇一", "含義大利麵、蛋、蔬菜"],
          price: 220
        },
        {
          categoryList: ["單打獨鬥區"],
          mealName: "厚切沙朗6oz",
          origin: "巴拉圭",
          mealTextList: ["醬料擇一", "含義大利麵、蛋、蔬菜"],
          price: 240
        },
        {
          categoryList: ["單打獨鬥區"],
          mealName: "鮭魚排",
          origin: "智利",
          mealTextList: ["醬料擇一", "含義大利麵、蛋、蔬菜"],
          price: 280
        },
        {
          categoryList: ["單打獨鬥區"],
          mealName: "雪花沙朗8oz",
          origin: "紐西蘭",
          mealTextList: ["醬料擇一", "含義大利麵、蛋、蔬菜"],
          price: 280
        },
        {
          categoryList: ["單打獨鬥區"],
          mealName: "安格斯牛排10oz",
          origin: "紐西蘭",
          mealTextList: ["醬料擇一", "含義大利麵、蛋、蔬菜"],
          price: 350
        },
        {
          categoryList: ["單打獨鬥區"],
          mealName: "菲力牛排8oz",
          origin: "紐西蘭",
          mealTextList: ["醬料擇一", "含義大利麵、蛋、蔬菜"],
          price: 380
        },
        {
          categoryList: ["單打獨鬥區"],
          mealName: "帶骨牛小排8oz",
          origin: "紐西蘭",
          mealTextList: ["醬料擇一", "含義大利麵、蛋、蔬菜"],
          price: 480
        },
        {
          categoryList: ["單打獨鬥區"],
          mealName: "法式羊排",
          origin: "",
          mealTextList: ["醬料擇一", "含義大利麵、蛋、蔬菜"],
          price: 260
        },
        {
          categoryList: ["單打獨鬥區"],
          mealName: "歡樂自助吧",
          origin: "",
          mealTextList: ["濃湯、飲料、麵包、冰淇淋等"],
          price: 100
        },
        //#endregion

        //#region 咖哩飯
        {
          categoryList: ["咖哩飯"],
          mealName: "炸豬排咖哩飯",
          origin: "",
          mealTextList: ["淋上咖哩醬汁的豬排飯，彼此交織著美味的饗宴。(此描述僅供參考)", "含飯、蔬菜、小菜"],
          price: 240
        },
        {
          categoryList: ["咖哩飯"],
          mealName: "炸雞排咖哩飯",
          origin: "",
          mealTextList: ["外酥內嫩的雞排，搭配香氣十足的咖哩醬，美味無比！(此描述僅供參考)", "含飯、蔬菜、小菜"],
          price: 240
        },
        {
          categoryList: ["咖哩飯"],
          mealName: "唐揚雞咖哩飯",
          origin: "",
          mealTextList: ["濃郁的咖哩醬汁，搭配香酥脆的雞肉，必吃的美味料理。(此描述僅供參考)", "含飯、蔬菜、小菜"],
          price: 250
        },
        {
          categoryList: ["咖哩飯"],
          mealName: "起司可樂餅咖哩飯",
          origin: "",
          mealTextList: ["含飯、蔬菜、小菜"],
          price: 260
        },
        {
          categoryList: ["咖哩飯"],
          mealName: "鮮蝦可樂餅咖哩飯",
          origin: "",
          mealTextList: ["含飯、蔬菜、小菜"],
          price: 260
        },
        //#endregion

        //#region 分進合擊
        {
          categoryList: ["分進合擊區"],
          mealName: "厚切沙朗雙拼",
          origin: "",
          mealTextList: ["厚切沙朗、【豬/雞/羊/鱈魚】擇一", "醬料擇一", "含義大利麵、蛋、蔬菜"],
          price: 340
        },
        {
          categoryList: ["分進合擊區"],
          mealName: "帶骨牛小排雙拼",
          origin: "",
          mealTextList: ["帶骨牛小排(4盎司，1片，建議全熟)、【豬/雞/羊/鱈魚】擇一", "醬料擇一", "含義大利麵、蛋、蔬菜"],
          price: 420
        },
        {
          categoryList: ["分進合擊區"],
          mealName: "頂級沙朗16oz",
          origin: "紐西蘭",
          mealTextList: ["醬料擇一", "含義大利麵、蛋、蔬菜"],
          price: 500
        },
        //#endregion

        //#region 米食
        {
          categoryList: ["米食區"],
          mealName: "照燒牛肉飯",
          origin: "美國",
          mealTextList: ["含溏心蛋、蔬菜、小菜"],
          price: 220
        },
        {
          categoryList: ["米食區"],
          mealName: "照燒豬肉飯",
          origin: "台灣-豬五花，西班牙-梅花豬",
          mealTextList: ["含溏心蛋、蔬菜、小菜"],
          price: 200
        },
        {
          categoryList: ["米食區"],
          mealName: "照燒牛排飯",
          origin: "巴拉圭",
          mealTextList: ["含溏心蛋、蔬菜、小菜"],
          price: 200
        },
        {
          categoryList: ["米食區"],
          mealName: "照燒豬排飯",
          origin: "台灣",
          mealTextList: ["含溏心蛋、蔬菜、小菜"],
          price: 220
        },
        {
          categoryList: ["米食區"],
          mealName: "照燒雞腿飯",
          origin: "美國",
          mealTextList: ["含溏心蛋、蔬菜、小菜"],
          price: 220
        },
        //#endregion

        //#region 游擊
        {
          categoryList: ["游擊區"],
          mealName: "酥炸脆薯",
          origin: "",
          mealTextList: ["外皮黃金酥脆、內裡紮實綿密，令人無法抗拒的美妙小點。(此描述僅供參考)"],
          price: 90
        },
        {
          categoryList: ["游擊區"],
          mealName: "檸檬雞柳條",
          origin: "",
          mealTextList: ["口感柔軟，肉質細嫩，每一口都能感受到食材的細膩。(此描述僅供參考)"],
          price: 90
        },
        {
          categoryList: ["游擊區"],
          mealName: "洋蔥圈",
          origin: "",
          mealTextList: ["外皮酥脆、內裡洋蔥的香甜多汁，絕對滿足您的味蕾！(此描述僅供參考)"],
          price: 90
        },
        {
          categoryList: ["游擊區"],
          mealName: "炸雞塊",
          origin: "",
          mealTextList: ["穿上黃金外衣就知道大事不妙了，香酥口感直接征服您。(此描述僅供參考)"],
          price: 90
        },
        {
          categoryList: ["游擊區"],
          mealName: "魷魚圈",
          origin: "",
          mealTextList: ["魷魚的嚼勁十足，搭配著微鹹的風味，十分開胃。(此描述僅供參考)"],
          price: 90
        },
        {
          categoryList: ["游擊區"],
          mealName: "小拼盤",
          origin: "",
          mealTextList: [],
          price: 150
        },
        {
          categoryList: ["游擊區"],
          mealName: "大拼盤",
          origin: "",
          mealTextList: [],
          price: 250
        }
        //#endregion
      ])
    : null
  paginationData.total = mealListData.value.length
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

//#region sort
const initSort = () => {
  const table: HTMLElement | null = document.querySelector(".el-table__body tbody")
  if (!table) return

  Sortable.create(table, {
    animation: 200, // 拖拽延时，效果更好看
    onEnd: (event: any) => {
      // 进行数据的处理，拖拽实际并不会改变绑定数据的顺序
      const { oldIndex, newIndex } = event
      const currentRow = mealListData.value?.splice(oldIndex, 1)[0]
      mealListData.value?.splice(newIndex, 0, currentRow)
      // console.log(mealListData.value.map((item) => item.mealName))
    }
  })
}

onMounted(() => {
  initSort()
})
//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getMealData, { immediate: true })
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
      @close="resetForm"
      width="35%"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" label-position="left">
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
