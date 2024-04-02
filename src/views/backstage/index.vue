<script lang="ts" setup>
import { computed } from "vue"
import { useRouter } from "vue-router"

// import { type OrderMeal, type ReadData } from "@/api/order-list/types/order"
import * as Order from "@/api/order-list/"

import { storeToRefs } from "pinia"
import { useCommonStore } from "@/store/modules/common"
import { useOrdersStore } from "@/store/modules/orders"
import { useUserStore } from "@/store/modules/user"

import { ElMessage } from "element-plus"
// import { Refresh, Delete, RefreshRight } from "@element-plus/icons-vue"
import { RefreshRight } from "@element-plus/icons-vue"

defineOptions({
  // 命名当前组件
  name: "Backstage"
})

const router = useRouter()

const logout = () => {
  useUserStore().logout()
  router.push("/login")
}

//#region 後台改變餐點狀態
const preparingOrder = (orderId: string) => {
  Order.preparingOrder(orderId).then(() => {
    ElMessage.success(`${orderId} 開始備餐`)
    getOrderData()
  })
}

const doneOrder = (orderId: string) => {
  Order.doneOrder(orderId).then(() => {
    ElMessage.success(`${orderId} 備餐完成`)
    getOrderData()
  })
}
//#endregion

//#region 查
const { activeStore } = storeToRefs(useCommonStore())

const { orderListData } = storeToRefs(useOrdersStore())
const { getOrderData } = useOrdersStore()
getOrderData()

const filterOrderListData = computed(() => {
  return orderListData.value.filter((item) => item.storeName === activeStore.value?.storeName)
})
//#endregion
</script>

<template>
  <div class="app-container">
    <div class="logoutBtnContainer">
      <el-tag size="large" effect="dark" style="margin-right: auto"> {{ activeStore?.storeName }} </el-tag>
      <el-button type="primary" :icon="RefreshRight" circle @click="getOrderData" />
      <el-button class="logoutBtn" type="info" @click="logout"> 登出 </el-button>
    </div>
    <div class="orderList">
      <el-card v-for="item in filterOrderListData" :key="item.orderId">
        <div class="tableNumber">{{ item.tableNumber }}</div>
        <div class="payTime" v-if="item.payTime">{{ item.payTime.split(" ")[1] }}</div>

        <div class="mealList">
          <div class="meal" v-for="item2 in item.mealList" :key="item2.id">
            <div class="mealTitle">
              <div class="mealName">{{ item2.mealName }}</div>
              <div class="mealCount">x{{ item2.count }}</div>
            </div>
            <div class="selectList" v-if="item2.selectList.length">
              <template v-for="item3 in item2.selectList" :key="item3.id">
                <div class="tableSelect" v-if="item3.activeOptionList.length">
                  <span class="tableOption" v-for="item4 in item3.activeOptionList" :key="item4.title"
                    >{{ item4.codeName ? item4.codeName : item4.title }}
                  </span>
                </div>
              </template>
            </div>
            <div class="note" v-show="item2.note">{{ item2.note }}</div>
          </div>
        </div>

        <div class="controlBtns">
          <el-button
            v-if="item.orderStatus === 1"
            type="warning"
            text
            bg
            size="large"
            @click="preparingOrder(item.orderId)"
          >
            開始備餐
          </el-button>
          <el-button v-if="item.orderStatus === 2" type="success" text bg size="large" @click="doneOrder(item.orderId)">
            備餐完成
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.logoutBtnContainer {
  margin-bottom: 10px;
  display: flex;
  justify-content: flex-end;
}

.orderList {
  display: flex;
  flex-wrap: wrap;

  .el-card {
    flex: 0 0 20%;

    .tableNumber {
      padding: 5px 10px;
      margin-bottom: 5px;
      font-size: 24px;
      border-radius: 5px;
      background: #666;
      color: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .payTime {
      margin-right: 10px;
      display: flex;
      justify-content: flex-end;
    }
    .mealList {
      margin-bottom: 10px;

      .meal {
        padding: 10px 0px;
        border-bottom: 1px solid #aaa;

        .mealTitle {
          font-size: 20px;
          display: flex;
          justify-content: space-between;
        }

        .selectList {
          margin-top: 5px;

          .tableSelect {
            display: inline-block;
            padding: 2px 4px;
            margin: 2px 4px;
            border-radius: 3px;
            background-color: #ccc;

            .tableOption {
              display: inline-block;
              padding: 2px 4px;
              margin: 2px 4px;
              border-radius: 3px;
              background-color: #666;
              color: #fff;
            }
          }
        }

        .note {
          margin-top: 10px;
        }
      }
    }
    .controlBtns {
      margin-top: auto;
      display: flex;
      justify-content: center;

      el-button {
        font-size: 20px;
      }
    }
  }
}
</style>
