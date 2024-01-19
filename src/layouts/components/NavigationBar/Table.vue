<script lang="ts" setup>
import { storeToRefs } from "pinia"
import { useCommonStore } from "@/store/modules/common"

const { storeList, activeStore } = storeToRefs(useCommonStore())
</script>

<template>
  <div class="table-wrapper">
    <el-select v-model="activeStore" class="m-2" placeholder="Select" size="large" style="width: 120px">
      <el-option v-for="item in storeList" :key="item" :label="item" :value="item" />
    </el-select>
  </div>
</template>

<style lang="scss" scoped>
.table-wrapper {
}
</style>
