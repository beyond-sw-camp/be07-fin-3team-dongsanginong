import { createStore } from "vuex";
import fcmNotiManagement from "./fcmNoti";

const store = createStore({
    modules:{
        fcmNotiManagement
    }
})

export default store