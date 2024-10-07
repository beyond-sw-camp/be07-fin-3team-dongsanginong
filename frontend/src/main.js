import { createApp } from "vue";
import App from "./App.vue";
import router from "@/router/index.js";
import vuetify from "./plugins/vuetify";
import "@mdi/font/css/materialdesignicons.css";
import axios from "axios";
import store from "@/store/index";
import { loadFonts } from "./plugins/webfontloader";

loadFonts();

const app = createApp(App);

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// refreshToken 으로 accessToken 재발급하는 코드 작성해주기 !!
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const token = localStorage.getItem("accessToken");
    if (error.response && error.response.status === 401 && token != null) {
      try {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("memberId");
        alert("로그아웃 되었습니다! 재로그인 해주세요!");
        window.location.href = "/login";
      } catch (e) {
        console.log(e.response);
      }
    }
    return Promise.reject(error);
  }
);

app.use(store);
app.use(router);
app.use(vuetify);
app.mount("#app");
