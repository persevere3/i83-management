import { type RouteRecordRaw, createRouter } from "vue-router"
import { history, flatMultiLevelRoutes } from "./helper"
import routeSettings from "@/config/route"

const Layouts = () => import("@/layouts/index.vue")

/**
 * 常驻路由
 * 除了 redirect/403/404/login 等隐藏页面，其他页面建议设置 Name 属性
 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layouts,
    meta: {
      hidden: true
    },
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@/views/redirect/index.vue")
      }
    ]
  },
  {
    path: "/403",
    component: () => import("@/views/error-page/403.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/404",
    component: () => import("@/views/error-page/404.vue"),
    meta: {
      hidden: true
    },
    alias: "/:pathMatch(.*)*"
  },
  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/",
    component: Layouts,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        name: "Dashboard",
        meta: {
          title: "首頁",
          svgIcon: "dashboard",
          keepAlive: true
        }
      }
    ]
  },
  {
    path: "/management",
    component: Layouts,
    redirect: "/management/category-list",
    name: "Management",
    meta: {
      title: "管理",
      elIcon: "Grid"
    },
    children: [
      {
        path: "category-list",
        component: () => import("@/views/management/category-list/index.vue"),
        name: "CategoryList",
        meta: {
          title: "分類管理",
          keepAlive: true
        }
      },
      {
        path: "meal-list",
        component: () => import("@/views/management/meal-list/index.vue"),
        name: "MealList",
        meta: {
          title: "餐點管理",
          keepAlive: true
        }
      },
      {
        path: "select-list",
        component: () => import("@/views/management/select-list/index.vue"),
        name: "SelectList",
        meta: {
          title: "選擇管理",
          keepAlive: true
        }
      },
      {
        path: "order-list",
        component: () => import("@/views/management/order-list/index.vue"),
        name: "OrdertList",
        meta: {
          title: "訂單管理",
          keepAlive: true
        }
      },
      {
        path: "table-list",
        component: () => import("@/views/management/table-list/index.vue"),
        name: "TabletList",
        meta: {
          title: "顧客管理",
          keepAlive: true
        }
      }
    ]
  },
  {
    path: "/customer",
    component: Layouts,
    redirect: "/management/table-list",
    meta: {
      hidden: true,
      title: "QR code"
    },
    children: [
      {
        path: ":id",
        component: () => import("@/views/customer/index.vue"),
        name: "customer"
      }
    ]
  }
  // {
  //   path: "/hook-demo",
  //   component: Layouts,
  //   redirect: "/hook-demo/use-fetch-select",
  //   name: "HookDemo",
  //   meta: {
  //     title: "Hook 示例",
  //     elIcon: "Menu",
  //     alwaysShow: true
  //   },
  //   children: [
  //     {
  //       path: "use-fetch-select",
  //       component: () => import("@/views/hook-demo/use-fetch-select.vue"),
  //       name: "UseFetchSelect",
  //       meta: {
  //         title: "useFetchSelect"
  //       }
  //     },
  //     {
  //       path: "use-fullscreen-loading",
  //       component: () => import("@/views/hook-demo/use-fullscreen-loading.vue"),
  //       name: "UseFullscreenLoading",
  //       meta: {
  //         title: "useFullscreenLoading"
  //       }
  //     },
  //     {
  //       path: "use-watermark",
  //       component: () => import("@/views/hook-demo/use-watermark.vue"),
  //       name: "UseWatermark",
  //       meta: {
  //         title: "useWatermark"
  //       }
  //     }
  //   ]
  // }
]

/**
 * 动态路由
 * 用来放置有权限 (Roles 属性) 的路由
 * 必须带有 Name 属性
 */
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: "/permission",
    component: Layouts,
    redirect: "/permission/page",
    name: "Permission",
    meta: {
      title: "权限管理",
      svgIcon: "lock",
      roles: ["admin", "editor"], // 可以在根路由中设置角色
      alwaysShow: true // 将始终显示根菜单
    },
    children: [
      {
        path: "page",
        component: () => import("@/views/permission/page.vue"),
        name: "PagePermission",
        meta: {
          title: "页面权限",
          roles: ["admin"] // 或者在子导航中设置角色
        }
      },
      {
        path: "directive",
        component: () => import("@/views/permission/directive.vue"),
        name: "DirectivePermission",
        meta: {
          title: "指令权限" // 如果未设置角色，则表示：该页面不需要权限，但会继承根路由的角色
        }
      }
    ]
  },
  {
    path: "/:pathMatch(.*)*", // Must put the 'ErrorPage' route at the end, 必须将 'ErrorPage' 路由放在最后
    redirect: "/404",
    name: "ErrorPage",
    meta: {
      hidden: true
    }
  }
]

const router = createRouter({
  history,
  routes: routeSettings.thirdLevelRouteCache ? flatMultiLevelRoutes(constantRoutes) : constantRoutes
})

/** 重置路由 */
export function resetRouter() {
  // 注意：所有动态路由路由必须带有 Name 属性，否则可能会不能完全重置干净
  try {
    router.getRoutes().forEach((route) => {
      const { name, meta } = route
      if (name && meta.roles?.length) {
        router.hasRoute(name) && router.removeRoute(name)
      }
    })
  } catch {
    // 强制刷新浏览器也行，只是交互体验不是很好
    window.location.reload()
  }
}

export default router
