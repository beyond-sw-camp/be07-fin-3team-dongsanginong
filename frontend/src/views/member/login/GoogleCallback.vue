<template>
    <div class="loader-container">
        <img src="/loading.gif" width="50px" />
    </div>

    <v-dialog v-model="alertModal" max-width="300px">
        <v-card class="modal" style="align-items: center; text-align: center; height: 160px; padding-bottom: 20px; 
    overflow-y: hidden;">
            <v-card-text>동상이농 회원이 아닙니다. <br /> 회원가입 페이지로 이동합니다.</v-card-text>
            <v-btn @click="handleCloseModal" class="submit-btn">close</v-btn>
        </v-card>
    </v-dialog>
</template>

<script>
import axios from "axios";
import qs from 'qs'; // qs 패키지 추가 > 구글 로그인 시 쿼리 문자열 형식으로 반환하기 위함

export default {
    name: "GoogleCallback",
    data() {
        return {
            alertModal: false
        };
    },
    created() {
        const code = new URL(window.location.href).searchParams.get("code");

        if (code) {
            this.getGoogleToken(code);
        } else {
            console.error("NO code");
        }
    },
    methods: {
        async getGoogleToken(code) {
            try {
                const client_id = process.env.VUE_APP_GOOGLE_CLIENT_ID;
                const client_secret = process.env.VUE_APP_GOOGLE_CLIENT_SECRET;
                const redirect_uri = process.env.VUE_APP_GOOGLE_REDIRECT_URI;

                const data = {
                    grant_type: 'authorization_code',
                    client_id: client_id,
                    client_secret: client_secret,
                    redirect_uri: redirect_uri,
                    code: code
                };

                const tokenResponse = await axios.post(
                    'https://oauth2.googleapis.com/token',
                    qs.stringify(data),
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }
                );

                const { access_token } = tokenResponse.data;

                // 동상이농 회원이 아닐 경우 해당 소셜 이메일로 가입하기 위해 이메일만 요청 후 localStorage 에 저장
                const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
                    headers: {
                        Authorization: `Bearer ${access_token}`
                    }
                });
                const email = userResponse.data.email;
                localStorage.setItem("email", email);
                localStorage.setItem("socialType", "GOOGLE");
                localStorage.setItem("token", access_token);

                const apiUrl = `${process.env.VUE_APP_API_BASE_URL}/member-service/member/sign-in`;
                const signInResponse = await axios.post(
                    apiUrl,
                    { socialType: 'GOOGLE' },
                    {
                        headers: {
                            Authorization: `Bearer ${access_token}`
                        }
                    }
                );

                localStorage.clear();
                localStorage.setItem("accessToken", signInResponse.data.accessToken);
                localStorage.setItem("refreshToken", signInResponse.data.refreshToken);
                localStorage.setItem("role", signInResponse.data.role);
                localStorage.setItem("memberId", signInResponse.data.memberId);

                window.location.href = process.env.VUE_APP_MY_URL;
            } catch (error) {
                if (error.response.data.name === 'NEED_TO_REGISTER') {
                    this.alertModal = true;
                } else {
                    console.error(error);
                }
            }
        },
        handleCloseModal() {
            this.alertModal = false;
            window.location.href = '/member/sign-up';
        }
    }
}
</script>

<style>
.loader-container {
    display: flex;
    justify-content: center;
    padding-top: 100px;
}

.modal {
    background-color: rgb(255, 255, 255);
    border: none;
    box-shadow: none;
    border-radius: 10px;
}
.submit-btn {
    margin-left: 10px;
    margin-top: 8px;
    background-color: #BCC07B;
    color: black;
    border-radius: 50px;
}
</style>