<script lang="ts" setup>
import { computed } from "vue"
import { storeToRefs } from "pinia"
import { useCommonStore } from "@/store/modules/common"

const { role, storeList, activeStore } = storeToRefs(useCommonStore())
const activeStoreId = computed({
  get(): number {
    return activeStore.value?.id || 0
  },
  set(newValue: number) {
    activeStore.value = JSON.parse(JSON.stringify(storeList.value.find((item) => item.id === newValue)))
  }
})
</script>

<template>
  <div class="table-wrapper">
    <el-select
      :disabled="role !== 'super-admin'"
      v-model="activeStoreId"
      class="m-2"
      placeholder="Select"
      size="large"
      style="width: 120px"
    >
      <el-option v-for="item in storeList" :key="item.id" :label="item.storeName" :value="item.id" />
    </el-select>
  </div>
</template>

<style lang="scss" scoped>
.table-wrapper {
}
</style>
