<template>
    <div class="loader-container">
        <img src="/loading.gif" width="50px" />
    </div>

    <v-dialog v-model="alertModal" max-width="300px">
        <v-card class="modal" style="align-items: center; text-align: center; height: 160px; padding-bottom: 20px; 
    overflow-y: hidden;">
        <v-card-text style="margin-bottom:5px">동상이농 회원이 아닙니다. <br /> 회원가입 페이지로 이동합니다.</v-card-text>
        <v-btn @click="handleCloseModal(true)" class="submit-btn" style="border-radius: 50px; width: 100px">close</v-btn>
    </v-card>
    </v-dialog>
</template>

<script>
import axios from "axios";

export default {
    name: "KakaoCallback",
    data() {
        return {
            alertModal: false
        };
    },
    created() {
        const code = new URL(window.location.href).searchParams.get("code");

        if (code) {
            this.getKakaoToken(code);
        } else {
            console.error("NO code");
        }
    },
    methods: {
        async getKakaoToken(code) {
            try {
                // 카카오 액세스 토큰 요청
                const client_id = process.env.VUE_APP_KAKAO_CLIENT_ID;
                const redirect_uri = process.env.VUE_APP_KAKAO_REDIRECT_URI;
                const tokenResponse = await axios.post(
                    'https://kauth.kakao.com/oauth/token',
                    null,
                    {
                        params: {
                            grant_type: 'authorization_code',
                            client_id: client_id,
                            redirect_uri: redirect_uri,
                            code: code
                        }
                    }
                );
                const { access_token } = tokenResponse.data;

                // 동상이농 회원이 아닐 경우 해당 소셜 이메일로 가입하기 위해 이메일 요청
                const emailResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
                    headers: {
                        Authorization: `Bearer ${access_token}`
                    }
                });
                const email = emailResponse.data.kakao_account.email;
                localStorage.setItem("email", email);
                localStorage.setItem("socialType", "KAKAO");
                localStorage.setItem("token", access_token);

                const apiUrl = `${process.env.VUE_APP_API_BASE_URL}/member-service/member/sign-in`;
                // 서버에 로그인 요청
                const signInResponse = await axios.post(
                    apiUrl,
                    { socialType: 'KAKAO' },
                    {
                        headers: {
                            Authorization: `Bearer ${access_token}`
                        }
                    }
                );

                // 로컬 스토리지 토큰 저장
                localStorage.clear(); // 회원가입을 위해서 저장했던 데이터 지워주기
                localStorage.setItem("accessToken", signInResponse.data.accessToken);
                localStorage.setItem("refreshToken", signInResponse.data.refreshToken);
                localStorage.setItem("role", signInResponse.data.role);
                localStorage.setItem("memberId", signInResponse.data.memberId);

                // 홈으로 리다이렉트
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