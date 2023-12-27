<script lang="ts" setup>
import { ref } from "vue"

import { type GetTableData } from "@/api/table-list/types/table"
import { getTableDataApi } from "@/api/table-list"

import { useRoute } from "vue-router"

import QRCodeVue3 from "qrcode-vue3"

defineOptions({
  // 命名当前组件
  name: "CategoryList"
})

const loading = ref(false)

const { id } = useRoute().params

const tableListData = ref<GetTableData[]>([])
const activeTable = ref<GetTableData>({})
loading.value = true
getTableDataApi({})
  .then((res) => {
    tableListData.value = res
    activeTable.value = tableListData.value.find((item) => item.id == id)
    console.log(activeTable.value)
  })
  .catch(() => {
    tableListData.value = []
  })
  .finally(() => {
    loading.value = false
  })
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never">
      <QRCodeVue3
        myclass="qrcode"
        v-if="activeTable.number"
        :value="`https://i83.vercel.app/${activeTable.number}-${activeTable.orderToken}`"
        :dotsOptions="{ type: 'classy' }"
      />
    </el-card>
  </div>
</template>

<style lang="scss">
.qrcode {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
