<script lang="ts" setup>
import { storeToRefs } from "pinia"
import { useCommonStore } from "@/store/modules/common"

import { useNumberFormat } from "@/hooks/useNumberFormat"

const { role } = storeToRefs(useCommonStore())
const { thousandsSeparatorFormat } = useNumberFormat()

const props = defineProps(["mealList", "orderListIndex", "ordersMealsUnitPriceList"])
</script>

<template>
  <template v-if="['super-admin', 'branch-admin'].includes(role)">
    <el-table :data="props.mealList" size="small">
      <el-table-column prop="mealName" label="名稱" width="120" align="center" />
      <el-table-column label="價錢" width="80" align="center">
        <template #default="scope2" v-if="ordersMealsUnitPriceList[props.orderListIndex]">
          {{ thousandsSeparatorFormat(ordersMealsUnitPriceList[props.orderListIndex][scope2.$index]) }}
        </template>
      </el-table-column>
      <el-table-column prop="count" label="數量" width="80" align="center" />
      <el-table-column label="選擇" class="selectList">
        <template #default="scope2">
          <template v-for="item in scope2.row.selectList" :key="item.id">
            <div>
              <span v-for="item2 in item.activeOptionList" :key="item2.title"> {{ " " }} {{ item2.title }}</span>
            </div>
          </template>
        </template>
      </el-table-column>
      <el-table-column prop="note" label="備註" width="100" />
    </el-table>
  </template>

  <template v-if="['branch-backstage'].includes(role)">
    <el-table :data="props.mealList" size="small">
      <el-table-column prop="mealName" label="名稱" width="120" align="center" />
      <el-table-column prop="count" label="數量" width="80" align="center" />
      <el-table-column label="選擇" class="selectList">
        <template #default="scope2">
          <template v-for="item in scope2.row.selectList" :key="item.id">
            <div class="tableSelect" v-if="item.activeOptionList.length">
              <span class="tableOption" v-for="(item2, index2) in item.activeOptionList" :key="item2.title"
                >{{ index2 !== 0 ? "" : "" }} {{ item2.codeName ? item2.codeName : item2.title }}
              </span>
            </div>
          </template>
        </template>
      </el-table-column>
      <el-table-column prop="note" label="備註" width="100" />
    </el-table>
  </template>
</template>

<style lang="scss" scoped>
.tableSelect {
  display: inline-block;
  padding: 2px 6px;
  margin: 2px 9px;
  border-radius: 3px;
  background-color: #ccc;

  .tableOption {
    display: inline-block;
    padding: 2px 6px;
    margin: 2px 6px;
    border-radius: 5px;
    background-color: #666;
    color: #fff;
  }
}
</style>
