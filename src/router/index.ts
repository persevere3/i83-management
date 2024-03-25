import { type RouteRecordRaw, createRouter } from "vue-router"
import { history, flatMultiLevelRoutes } from "./helper"
import routeSettings from "@/config/route"

const Layouts = () => import("@/layouts/index.vue")

/**
 * 常驻路由
 * 除了 redirect/403/404/login 等隐藏页面，其他页面建议设置 Name 属性
 */
export const constantRoutes: RouteRecordRaw[] = [
  // ?
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
  // 403
  {
    path: "/403",
    component: () => import("@/views/error-page/403.vue"),
    meta: {
      hidden: true
    }
  },
  // 404
  {
    path: "/404",
    component: () => import("@/views/error-page/404.vue"),
    meta: {
      hidden: true
    },
    alias: "/:pathMatch(.*)*"
  },
  // login
  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      hidden: true
    }
  }
]

/**
 * 动态路由
 * 用来放置有权限 (Roles 属性) 的路由
 * 必须带有 Name 属性
 */
export const asyncRoutes: RouteRecordRaw[] = [
  // /
  {
    path: "/",
    component: Layouts,
    redirect: "/dashboard",
    meta: {
      roles: ["super-admin", "branch-admin"]
    },
    children: [
      {
        path: "dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        name: "Dashboard",
        meta: {
          title: "銷售報表",
          svgIcon: "dashboard"
        }
      }
    ]
  },
  // account
  {
    path: "/",
    component: Layouts,
    redirect: "/account-list",
    meta: {
      roles: ["super-admin"]
    },
    children: [
      {
        path: "account-list",
        component: () => import("@/views/management/account-list/index.vue"),
        name: "AccountList",
        meta: {
          title: "帳戶管理",
          svgIcon: "user"
        }
      }
    ]
  },
  // store
  {
    path: "/",
    component: Layouts,
    redirect: "/store-list",
    meta: {
      roles: ["super-admin"]
    },
    children: [
      {
        path: "store-list",
        component: () => import("@/views/management/store-list/index.vue"),
        name: "StoreList",
        meta: {
          title: "分店管理",
          svgIcon: "store"
        }
      }
    ]
  },
  // pay method
  {
    path: "/",
    component: Layouts,
    redirect: "/payMethod",
    meta: {
      roles: ["super-admin"]
    },
    children: [
      {
        path: "payMethod",
        component: () => import("@/views/management/payMethod/index.vue"),
        name: "PayMethod",
        meta: {
          title: "支付管理",
          svgIcon: "cash"
        }
      }
    ]
  },
  // category
  {
    path: "/",
    component: Layouts,
    redirect: "/category-list",
    meta: {
      roles: ["super-admin"]
    },
    children: [
      {
        path: "category-list",
        component: () => import("@/views/management/category-list/index.vue"),
        name: "CategoryList",
        meta: {
          title: "分類管理",
          svgIcon: "category",
          keepAlive: true
        }
      }
    ]
  },
  // select
  {
    path: "/",
    component: Layouts,
    redirect: "/select-list",
    meta: {
      roles: ["super-admin"]
    },
    children: [
      {
        path: "select-list",
        component: () => import("@/views/management/select-list/index.vue"),
        name: "SelectList",
        meta: {
          title: "選擇管理",
          svgIcon: "select",
          keepAlive: true
        }
      }
    ]
  },
  // meal
  {
    path: "/",
    component: Layouts,
    redirect: "/meal-list",
    meta: {
      roles: ["super-admin", "branch-admin"]
    },
    children: [
      {
        path: "meal-list",
        component: () => import("@/views/management/meal-list/index.vue"),
        name: "MealList",
        meta: {
          title: "餐點管理",
          svgIcon: "meal",
          keepAlive: true
        }
      }
    ]
  },
  // table
  {
    path: "/",
    component: Layouts,
    redirect: "/table-list",
    meta: {
      roles: ["super-admin", "branch-admin"]
    },
    children: [
      {
        path: "table-list",
        component: () => import("@/views/management/table-list/index.vue"),
        name: "TabletList",
        meta: {
          title: "桌號管理",
          svgIcon: "table",
          keepAlive: true
        }
      }
    ]
  },
  // order
  {
    path: "/",
    component: Layouts,
    redirect: "/order-list",
    children: [
      {
        path: "order-list",
        component: () => import("@/views/management/order-list/index.vue"),
        name: "OrdertList",
        meta: {
          title: "訂單管理",
          svgIcon: "order"
        }
      }
    ]
  },
  // customer
  {
    path: "/",
    component: Layouts,
    redirect: "/customer/:id",
    meta: {
      hidden: true
    },
    children: [
      {
        path: "customer/:id",
        component: () => import("@/views/customer/index.vue"),
        name: "Customer"
      }
    ]
  },

  // ?
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
