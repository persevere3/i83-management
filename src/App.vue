<script lang="ts" setup>
// import { h } from "vue"
import { useTheme } from "@/hooks/useTheme"
// import { ElNotification } from "element-plus"
// 将 Element Plus 的语言设置为中文
import zhTw from "element-plus/es/locale/lang/zh-tw"

import { useRoute } from "vue-router"

const route: any = useRoute()

const { initTheme } = useTheme()

/** 初始化主题 */
initTheme()

// ElNotification({
//   title: "Hello",
//   type: "success",
//   message: h(
//     "a",
//     { style: "color: teal", target: "_blank", href: "https://github.com/un-pany/v3-admin-vite" },
//     "小项目获取 star 不易，如果你喜欢这个项目的话，欢迎点击这里支持一个 star ！这是作者持续维护的唯一动力（小声：毕竟是免费的）"
//   ),
//   duration: 0,
//   position: "bottom-right"
// })
</script>

<template>
  <el-config-provider :locale="zhTw">
    <router-view :key="route.path" />
  </el-config-provider>
</template>
