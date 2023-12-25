<script lang="ts" setup>
import { ref, computed, provide } from "vue"

import { storeToRefs } from "pinia"

import { type GetOrderData } from "@/api/order-list/types/order"
import { type GetMealData } from "@/api/meal-list/types/meal"

import { useOrdersStore } from "@/store/modules/orders"
import { useMealsStore } from "@/store/modules/meals"

import { Refresh } from "@element-plus/icons-vue"

//#region swiper
import { Swiper, SwiperSlide } from "swiper/vue"
import { Navigation } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"

const modules = [Navigation]
//#endregion

//#region import echart
import { use } from "echarts/core" //导入use函数 用于注册ecahts所需的渲染器和图标组件
import { CanvasRenderer } from "echarts/renderers" //渲染器 用于绘制图表
import { BarChart, LineChart, PieChart } from "echarts/charts" //导入饼图
import { GridComponent, TitleComponent, TooltipComponent, LegendComponent } from "echarts/components" //导入一些组件 用于显示图标的标题 提示框 不同系列的标识和名称
import VChart, { THEME_KEY } from "vue-echarts" //引入vchart组件和主题 主题可以自定义图标的样式

use([CanvasRenderer, BarChart, LineChart, PieChart, GridComponent, TitleComponent, TooltipComponent, LegendComponent]) //通过use来注册所需要的渲染器和图表组件可以确保在渲染的时候使用这些组件

provide(THEME_KEY, "light") //提供主题 dark暗色主题 light亮色
//#endregion

defineOptions({
  // 命名当前组件
  name: "Common"
})

// #region 日期
// 快捷鍵
const shortcuts = [
  {
    text: "Last 1 day",
    value: () => {
      const start = new Date()
      const end = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 1)
      return [start, end]
    }
  },
  {
    text: "Last 7 days",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: "Last 30 days",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: "Last 90 days",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  },
  {
    text: "Last 180 days",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 180)
      return [start, end]
    }
  },
  {
    text: "Last 360 days",
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 365)
      return [start, end]
    }
  }
]

const activeDateRange = ref<Date[]>([])

const resetSearch = () => {
  activeDateRange.value = []
}
// #endregion

const { orderListData } = storeToRefs(useOrdersStore())
const { getOrderData } = useOrdersStore()
getOrderData()

const { mealListData } = storeToRefs(useMealsStore())
const { getMealData } = useMealsStore()
getMealData()

const mealSalesList = computed(() => {
  let orderList: GetOrderData[] = JSON.parse(JSON.stringify(orderListData.value))
  const originMealList: GetMealData[] = JSON.parse(JSON.stringify(mealListData.value))
  type NewGetMealData = GetMealData & { salesVolume: number }
  let mealList: NewGetMealData[] = []

  const startTime = activeDateRange.value[0]
  const endTime = activeDateRange.value[1]
  if (startTime && endTime) {
    orderList = orderList.filter((order: GetOrderData) => {
      const createTime = new Date(order.createTime)
      return createTime >= startTime && createTime <= endTime
    })
  }

  orderList.forEach((order) => {
    order.mealList.forEach((orderMeal) => {
      const index = originMealList.findIndex((meal) => meal.mealName === orderMeal.mealName)
      if (index > -1) {
        if (mealList[index]) {
          mealList[index].salesVolume += orderMeal.quantity
        } else {
          mealList[index] = JSON.parse(JSON.stringify(originMealList[index]))
          mealList[index].salesVolume = orderMeal.quantity
        }
      }
    })
  })
  mealList = mealList.filter((meal: NewGetMealData) => meal.salesVolume)
  mealList.sort((a: NewGetMealData, b: NewGetMealData) => b.salesVolume - a.salesVolume)

  return mealList
})

// #region echart option
const optionNameList = computed(() => mealSalesList.value.map((meal) => meal.mealName))
const optionMealList = computed(() => {
  return mealSalesList.value.map((meal) => {
    return {
      name: meal.mealName,
      value: meal.salesVolume
    }
  })
})

const barOption = ref({
  title: {
    text: "銷量柱狀圖",
    top: "0",
    left: "center"
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow"
    }
  },
  xAxis: {
    type: "category",
    axisLabel: {
      show: true, // 是否显示X轴的内容，不包含两端的文字
      interval: 0,
      rotate: "50"
    },
    data: optionNameList
  },
  yAxis: {
    type: "value",
    minInterval: 1
  },
  series: [
    {
      type: "bar",
      barWidth: "40%",
      itemStyle: {
        borderRadius: 5
      },
      data: optionMealList
    }
  ]
})

const lineOption = ref({
  title: {
    text: "銷量折線圖",
    top: "0",
    left: "center"
  },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow"
    }
  },
  xAxis: {
    type: "category",
    axisLabel: {
      show: true, // 是否显示X轴的内容，不包含两端的文字
      interval: 0,
      rotate: "50"
    },
    data: optionNameList
  },
  yAxis: {
    type: "value",
    minInterval: 1
  },
  series: [
    {
      type: "line",
      barWidth: "40%",
      itemStyle: {
        borderRadius: 5
      },
      data: optionMealList
    }
  ]
})

const pieOption = ref({
  title: {
    text: "銷量圓餅圖",
    top: "0",
    left: "center"
  },
  tooltip: {
    trigger: "item",
    formatter: "{a} <br/>{b} : {c} ({d}%)"
  },
  legend: {
    orient: "horizontal",
    top: "bottom",
    left: "center",
    data: optionNameList
  },
  series: [
    {
      name: "pie",
      type: "pie",
      radius: ["40%", "70%"],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 5,
        borderColor: "#fff",
        borderWidth: 1
      },
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: "bold"
        },
        itemStyle: {
          shadowBlur: 5,
          shadowOffsetX: 0,
          shadowColor: "rgba(0, 0, 0, 0.5)",
          borderRadius: 10
        }
      },
      labelLine: {
        show: false
      },
      data: optionMealList
    }
  ]
})
// #endregion
</script>

<template>
  <div class="app-container">
    <el-card class="dateRange">
      <el-form ref="searchFormRef" :inline="true">
        <el-form-item prop="mealName" label="日期範圍">
          <el-date-picker
            v-model="activeDateRange"
            type="daterange"
            range-separator="To"
            start-placeholder="Start Date"
            end-placeholder="End Date"
            :shortcuts="shortcuts"
          />
        </el-form-item>
        <el-form-item>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="sales-wrapper">
      <div style="text-align: center" v-if="mealSalesList.length < 1">暫無數據</div>
      <swiper :modules="modules" navigation :slides-per-view="5" :space-between="10">
        <swiper-slide v-for="(meal, index) in mealSalesList" :key="meal.mealName">
          <el-card :body-style="{ padding: 0 }">
            <div class="mealImg" :style="{ 'background-image': `url(/img/meals/${meal.mealName}.jpg)` }">
              <div class="mealText" style="padding: 10px">
                <div class="rank" v-if="index < 3">{{ index + 1 }}</div>
                <div class="mealName">{{ meal.mealName }}</div>
                <div class="mealSales">銷量: {{ meal.salesVolume }}</div>
              </div>
            </div>
          </el-card>
        </swiper-slide>
      </swiper>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="8">
        <el-card>
          <v-chart ref="bar" class="chart bar" :option="barOption" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <v-chart ref="line" class="chart line" :option="lineOption" />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <v-chart ref="pie" class="chart pie" :option="pieOption" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.dateRange {
  margin-bottom: 20px;

  .el-form-item {
    margin-bottom: 0;
  }
}
.sales-wrapper {
  margin-bottom: 20px;

  .el-row {
    justify-content: center;
  }
}

.swiper-slide {
  cursor: pointer;
}

.mealImg {
  width: 100%;
  padding-bottom: 100%;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  position: relative;

  .mealText {
    width: 80%;
    position: absolute;
    bottom: 3%;
    left: 10%;
    border-radius: 5px;
    background-color: rgba(255, 255, 255, 0.8);
    color: #333;

    .rank {
      width: 40px;
      height: 40px;
      position: absolute;
      top: -15px;
      right: -15px;
      border-radius: 50%;
      background-color: var(--el-color-primary);
      color: #eee;
      font-size: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .mealName {
      margin-bottom: 5px;
      font-size: 16px;
      font-weight: bold;
    }
    .mealSales {
      font-size: 14px;
    }
  }
}

.chart {
  height: 400px;
}
</style>
