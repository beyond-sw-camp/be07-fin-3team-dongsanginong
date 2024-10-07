<template>
    <v-app-bar app dark dense height="70">
        <v-container class="bar" fluid>
            <v-row no-gutters class="flex-nowrap justify-space-between">
                <!-- Left-aligned buttons -->
                <v-col class="d-flex justify-start">
                    <v-btn style="text-transform: none;" @click="this.$router.push(`/farm`)">Farm</v-btn>
                    <v-btn :to="{ path: '/live/list' }" style="text-transform: none;">Live</v-btn>
                    <v-btn :to="{ path: '/member/my-page' }" style="text-transform: none;"
                        v-if="!isSeller">Mypage</v-btn>
                    <v-btn style="text-transform: none;" v-if="isSeller" @click="checkFarmAndRedirect">MyFarm</v-btn>
                </v-col>
                <v-col class="text-center">
                    <v-btn :to="{ path: '/' }" color="white">
                        <img src="/inongLogo.png" width=175 alt="Logo" class="main-logo-image" />
                    </v-btn>
                </v-col>
                <!-- Right-aligned buttons -->
                <v-col class="d-flex justify-end">
                    <v-btn style="text-transform: none;" v-if="!isLogin" class="reduce-spacing"
                        :to="{ path: '/member/sign-in' }">Login</v-btn>
                    <v-btn style="text-transform: none;" v-if="isLogin" class="reduce-spacing"
                        @click="alertModal = true">Logout</v-btn> <!-- Open modal instead of logging out directly -->

                    <v-menu>
                    <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" color="white" class="reduce-spacing">
                            <img src="/notifications.png" width=25 alt="Logo" />
                            <span v-if="notifications.length  > 0" class="notification-mark"></span>
                        </v-btn>
                    </template>
                    <v-list style="background-color: #EAEAEA;">
                        <v-list-item v-if="notifications.length === 0">
                            <v-list-item-title>새로운 알림이 없네요!</v-list-item-title>
                        </v-list-item>
                        <v-card
                        v-for="(notification, index) in notifications"
                        :key="index" style="margin: 5px;"
                        @click="this.$router.push(`/notifications`)"
                        >
                                <v-card-text style="font-weight: bold;">{{ notification.notification.title }}</v-card-text>
                                <v-card-subtitle style="font-size:small; margin-bottom: 10px;">{{ notification.notification.body.substring(0, 10) }}</v-card-subtitle>

                        </v-card>
                        <v-list-item v-if="notifications.length > 0"
                            @click="markAsRead()"
                            >✅ 모두 읽음 표시
                        </v-list-item>
                    </v-list>
                </v-menu>
                    
                    
                    <v-btn color="white">
                        <img src="/searchLogo.png" width=17 alt="Logo" />
                    </v-btn>
                </v-col>
            </v-row>
        </v-container>
    </v-app-bar>

    <v-dialog v-model="alertModal" max-width="300px">
        <v-card class="modal" style="align-items: center; text-align: center; height: 160px; padding-bottom: 20px; 
        overflow-y: hidden;">
            <v-card-text>로그아웃 되었습니다.</v-card-text>
            <v-btn @click="handleLogout" class="submit-btn">close</v-btn>
        </v-card>
    </v-dialog>

    <v-dialog v-model="firstFarmModal" max-width="260px">
        <v-card class="farmModal" style="padding: 10px; padding-right: 20px; text-align: center;">
            <v-card-text style="font-weight: bold;">
                농장 정보가 존재하지 않네요.<br><br>농장 정보를 입력해주세요. :)
            </v-card-text>
            <v-btn @click="goToFarmCreate" class="submit-btn">확인</v-btn>
        </v-card>
    </v-dialog>
</template>

<script>
import axios from 'axios';
import 'firebase/messaging';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { mapGetters } from 'vuex';

export default {
    data() {
        return {
            alertModal: false, // Initialize alertModal as a reactive data property
            isLogin: false, // 로그인 여부 확인 
            isSeller: false, // seller인지 member인지 여부 확인
            firstFarmModal: false,
            notiCount: 0,
            notifications: []
        };
    },
    computed: {
      ...mapGetters(['getNotiCount']),
    },
    created() {
        const token = localStorage.getItem('accessToken');
        this.isLogin = !!token;

        const role = localStorage.getItem('role');

        if (token) {
            this.isLogin = true;
        } else {
            this.isLogin = false;
        }

        if (role == "SELLER") {
            this.isSeller = true;
        } else {
            this.isSeller = false;
        }


        this.initializeFCM()

        // IndexedDB에서 알림 데이터 가져오기
        this.getNotificationsFromIndexedDB()
            .then((notifications) => {
                this.notifications = notifications;
            })
            .catch((error) => {
                console.error("Failed to retrieve notifications from IndexedDB:", error);
            });
        
            console.log("notifications:");
            console.log(this.notifications);

            // 주기적으로 IndexedDB 상태 확인 (예: 5초마다)
            setInterval(() => {
                this.getNotificationsFromIndexedDB()
                    .then((notifications) => {
                        this.notifications = notifications;
                    })
                    .catch((error) => {
                        console.error("Failed to retrieve notifications from IndexedDB:", error);
                    });
            }, 5000); // 5초마다 확인
    },
    
    methods: {

        async checkFarmAndRedirect() {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/product-service/farm/exists`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    }
                });
                if (response.data) {
                    this.$router.push('/seller/delivery-management');
                } else {
                    // 농장이 없을 경우 모달 띄우기
                    this.firstFarmModal = true;
                }
            } catch (error) {
                console.error('농장 확인 실패:', error);
            }
        },
        goToFarmCreate() {
            this.firstFarmModal = false;
            this.$router.push('/farm/farm-create'); // 농장 생성 페이지로 이동
        },

        handleLogout() {
            localStorage.clear();
            this.isLogin = false;
            this.alertModal = false; // Close the modal
            window.location.href = '/'; // Redirect to home
        },
        async initializeFCM() {
            const firebaseConfig = {
                apiKey: `${process.env.VUE_APP_FIREBASE_API_KEY}`,
                authDomain: "dongsanginong-24f95.firebaseapp.com",
                projectId: "dongsanginong-24f95",
                storageBucket: "dongsanginong-24f95.appspot.com",
                messagingSenderId: "331466655968",
                appId: "1:331466655968:web:f9802c140ab1701b63a885",
                measurementId: "G-WK79L8VKTR"
            };
            
            // Initialize Firebase
            // const firebase = !getApps().length ? initializeApp(firebaseConfig) : getApp();
            const firebase = initializeApp(firebaseConfig);
            const messaging = getMessaging(firebase);

            if (!localStorage.getItem("fcmToken")) {
                try {
                    // Await the FCM token
                    const token = await getToken(messaging, {
                        vapidKey: `${process.env.VUE_APP_FIREBASE_VAPID_KEY}`
                    });

                    // Store the token in local storage
                    localStorage.setItem("fcmToken", token);
                } catch (err) {
                    console.log(err);
                }
            }

            const body = {
                "fcmToken" : localStorage.getItem("fcmToken")
            };

            // DB에 fcm 토큰을 저장
            try {
                const res = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/member-service/fcm/token`, body);
                console.log(res);
            } catch(e) {
                console.log(e);
            }



            onMessage(messaging, (payload) => {
        
                // IndexedDB에 저장
                this.saveNotificationToIndexedDB(payload);
                // notifications 배열 업데이트
                this.notifications.push(payload);


                console.log("Received message ", payload);
                const notificationTitle = payload.notification.title;
                const notificationOptions = {
                    body: payload.notification.body,
                    icon: "favicon.ico"
                };



                if (Notification.permission === "granted") {
                    new Notification(notificationTitle, notificationOptions);
                }

            });
        },
        markAsRead() {
            this.notifications = [];
            this.clearNotificationsFromIndexedDB();
        },
        saveNotificationToIndexedDB(notification) {
            const request = indexedDB.open("notificationDB", 1);

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction("notifications", "readwrite");
                const store = transaction.objectStore("notifications");
                store.add(notification);
            };

            request.onerror = (event) => {
                console.error("Error saving notification to IndexedDB", event);
            };
        },
        getNotificationsFromIndexedDB() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open("notificationDB", 1);

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains("notifications")) {
                        db.createObjectStore("notifications", { keyPath: "id", autoIncrement: true });
                    }
                };

                request.onsuccess = (event) => {
                    const db = event.target.result;
                    const transaction = db.transaction("notifications", "readonly");
                    const store = transaction.objectStore("notifications");
                    const getAllRequest = store.getAll();

                    getAllRequest.onsuccess = () => {
                        resolve(getAllRequest.result);
                    };

                    getAllRequest.onerror = (error) => {
                        reject(error);
                    };
                };

                request.onerror = (event) => {
                    reject(event);
                };
            });
        },
        clearNotificationsFromIndexedDB() {
            const request = indexedDB.open("notificationDB", 1);

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction("notifications", "readwrite");
                const store = transaction.objectStore("notifications");
                
                // 모든 데이터를 삭제
                const clearRequest = store.clear();

                clearRequest.onsuccess = () => {
                    console.log("All notifications cleared from IndexedDB");
                };

                clearRequest.onerror = (event) => {
                    console.error("Error clearing notifications from IndexedDB", event);
                };
            };

            request.onerror = (event) => {
                console.error("Error opening IndexedDB", event);
            };
        },
    },
};
</script>


<style scoped>
.bar {
    /* font-family: "Fredoka", sans-serif;  */
    font-weight: 400;
}

.main-logo-image {
    transform: translateY(-21px);
}

.reduce-spacing {
    padding-right: 0px;
}

.modal {
    background-color: rgb(255, 255, 255);
    border: none;
    box-shadow: none;
    border-radius: 10px;
}

.farmModal {
    background-color: rgb(255, 255, 255);
    border: none;
    box-shadow: none;
    border-radius: 10px;
    width: 300px;
}

.submit-btn {
    margin-left: 10px;
    margin-top: 8px;
    background-color: #BCC07B;
    color: black;
    border-radius: 50px;
}

.notification-mark {
    background-color: #FFAF6E;
    border-radius: 20px;
    width: 10px;
    height: 10px;
    margin-bottom: 10px;
}
</style>