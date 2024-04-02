<script lang="ts" setup>
import { ref } from "vue"

import { type ReadData } from "@/api/table-list/types/table"
import * as Table from "@/api/table-list"

import { useRoute } from "vue-router"

import { storeToRefs } from "pinia"
import { useTagsViewStore } from "@/store/modules/tags-view"

import QRCodeVue3 from "qrcode-vue3"

defineOptions({
  // 命名当前组件
  name: "CategoryList"
})

const loading = ref(false)
const route = useRoute()
const { id } = route.params

const { visitedViews } = storeToRefs(useTagsViewStore())

const tableListData = ref<ReadData[]>([])
const activeTable = ref<ReadData>()
loading.value = true
Table.getDataApi()
  .then((res) => {
    tableListData.value = res
    activeTable.value = tableListData.value.find((item) => item.id == Number(id))
    console.log(activeTable.value)
    // tag
    const currentPath = route.path
    const view = visitedViews.value.find((item) => item.path === currentPath)
    if (view && view.meta) {
      view.meta.title = `${activeTable.value?.storeName} - ${activeTable.value?.number}`
    }
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
        v-if="activeTable && activeTable.number"
        :value="`https://preview.uniqcarttest.com/?tableId=${activeTable.id}`"
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
