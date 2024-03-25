<script lang="ts" setup>
import { ref } from "vue"

import { type ReadData } from "@/api/payMethod/types/payMethod"
import * as PayMethod from "@/api/payMethod/"

import { ElMessage } from "element-plus"

defineOptions({
  // 命名当前组件
  name: "PayMethod"
})

const channels = ref<ReadData[]>()

const cashMethod = ref<ReadData>({
  id: 0,
  channel: 0,
  payId: "",
  payKey: "",
  enabled: false
})
const lineMethod = ref<ReadData>({
  id: 0,
  channel: 0,
  payId: "",
  payKey: "",
  enabled: false
})

const getChannels = () => {
  PayMethod.getDataApi().then((res) => {
    channels.value = res

    const cash = res.find((item) => item.channel === 0)
    if (cash) cashMethod.value = JSON.parse(JSON.stringify(cash))

    const line = res.find((item) => item.channel === 1)
    if (line) lineMethod.value = JSON.parse(JSON.stringify(line))
  })
}
getChannels()

const updateChannel = (channel: ReadData) => {
  if (!channel.enabled) {
    const c = channels.value?.find((item) => item.id === channel.id)
    if (!c) return
    channel = c
    channel.enabled = false
  }
  PayMethod.updateDataApi(channel).then(() => {
    ElMessage.success("修改成功")
    getChannels()
  })
}
</script>

<template>
  <div class="app-container">
    <el-card>
      <div class="enable">
        <div class="img">
          <img src="../../../assets/img/cash.png" alt="" />
          <div class="text">現金支付</div>
        </div>
        <el-switch v-model="cashMethod.enabled" />
      </div>
      <el-button class="mt-5" @click="updateChannel(cashMethod)"> 確認 </el-button>
    </el-card>

    <el-card>
      <div class="enable">
        <div class="img">
          <img src="../../../assets/img/line.png" alt="" />
        </div>
        <el-switch v-model="lineMethod.enabled" />
      </div>

      <el-form v-if="lineMethod?.enabled" :model="lineMethod" label-width="150px" label-position="left">
        <el-form-item label="Channel ID">
          <el-input v-model="lineMethod.payId" placeholder="請輸入Channel ID" />
        </el-form-item>
        <el-form-item label="Channel Secret Key">
          <el-input v-model="lineMethod.payKey" placeholder="請輸入Channel Secret Key" />
        </el-form-item>
      </el-form>

      <el-button @click="updateChannel(lineMethod)"> 確認 </el-button>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.el-card {
  margin-bottom: 20px;

  .el-card__body {
    .enable {
      .img {
        margin-right: 20px;
        position: relative;

        img {
          width: 100%;
        }
        .text {
          position: absolute;
          top: 50%;
          right: 25px;
          transform: translateY(-50%);
          font-size: 26px;
          font-weight: 500;
          color: #2d2926;
        }
      }

      display: flex;
      align-items: center;
    }

    .el-form {
      max-width: 400px;
      margin-top: 20px;
    }
  }
}
</style>
