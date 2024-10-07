import { createRouter, createWebHistory } from "vue-router";
import MainPage from "../views/main/MainPage.vue";

import { farmNoticeRouter } from "./farmNoticeRouter";
import { sellerRouter } from '@/router/sellerRouter';
import { memberRouter } from "./memberRouter";
import { farmRouter } from "./farmRouter";
import { liveRouter } from "./liveRouter";
import { reviewRouter } from "./reviewRouter";
import { receiptRouter } from "./receiptRouter";


const routes = [
  {
    path: "/",
    name: "home",
    component: MainPage,
  },
  {
    path: "/about",
    name: "about",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
  },

  ...farmNoticeRouter,
  ...sellerRouter,
  ...memberRouter,
  ...reviewRouter,
  ...farmRouter,
  ...liveRouter,
  ...receiptRouter,
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
