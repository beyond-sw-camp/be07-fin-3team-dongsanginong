<template>
    <v-dialog v-model="alertModal" max-width="300px">
        <v-card class="modal" style="align-items: center; text-align: center; height: 130px; padding-bottom: 20px; 
        overflow-y: hidden;">
            <v-card-text style="margin-bottom:5px">회원가입이 완료되었습니다.</v-card-text>
            <v-btn @click="handleCloseModal(true)" class="submit-btn" style="border-radius: 50px; width: 100px">close</v-btn>
        </v-card>
    </v-dialog>

    <v-dialog v-model="errorModal" max-width="300px">
        <v-card class="modal" style="align-items: center; text-align: center;">
            <v-card-text>회원가입 중 오류가 발생했습니다. <br /> 다시 시도해주세요.</v-card-text>
            <v-btn @click="handleCloseModal(false)" class="submit-btn" width="100px">close</v-btn>
        </v-card>
    </v-dialog>

    <div class="member-signup">
        <h2>회원 정보 입력</h2>
        <hr />
        <form @submit.prevent="onSubmit">
            <!-- Form Fields -->
            <div class="form-group">
                <label for="name">이름</label>
                <input type="text" id="name" v-model="name" placeholder="이름을 입력하세요" required />
            </div>
            <div class="form-group">
                <label for="phone">전화번호</label>
                <input type="tel" id="phone" v-model="phone" placeholder="전화번호를 입력하세요" required />
            </div>
            <div class="form-group">
                <label for="email">이메일</label>
                <span style="text-align: left;">{{ email }}</span>
            </div>
            <div class="form-group">
                <label for="zipcode">우편번호</label>
                <input type="text" id="zipcode" v-model="zipcode" placeholder="우편번호를 입력하세요 (ex. 12345)" required />
            </div>
            <div class="form-group">
                <input type="button" class="find-postal" @click="execDaumPostcode" value="우편번호 찾기" />
            </div>
            <div class="form-group">
                <label for="address">주소</label>
                <input type="text" id="address" v-model="address" placeholder="도로명 주소를 입력하세요 (ex. 서울시 노원구)" required />
            </div>
            <div class="form-group">
                <label for="address-detail">상세 주소</label>
                <input type="text" id="address-detail" v-model="addressDetail" placeholder="상세 주소를 입력하세요 (ex. 101호)" required ref="addressDetail" />
            </div>
            <button type="submit" class="submit-btn">회원 가입 하기</button>
        </form>
    </div>
</template>


<script>
import axios from 'axios';

export default {
    data() {
        return {
            name: '',
            phone: '',
            zipcode: '',
            address: '',
            addressDetail: '',
            email: localStorage.getItem("email"),
            socialType: localStorage.getItem("socialType"),
            errorModal: false,
            alertModal: false
        };
    },
    methods: {
        async onSubmit() {
            const memberData = {
                name: this.name,
                phone: this.phone,
                zipcode: this.zipcode,
                address: this.address,
                addressDetail: this.addressDetail,
                email: this.email,
                socialType: this.socialType // 소셜 타입 추가
            };
            
            try {
                const token = localStorage.getItem("token"); // 저장된 액세스 토큰 가져오기
                const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/member-service/member/sign-up`, memberData, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                localStorage.clear();
                localStorage.setItem("accessToken", response.data.accessToken);
                localStorage.setItem("refreshToken", response.data.refreshToken);
                localStorage.setItem("role", response.data.role);
                localStorage.setItem("memberId", response.data.memberId);
                this.alertModal = true;
            } catch (error) {
                console.error("회원가입 실패:", error);
                this.errorModal = true;
            }
        },
        handleCloseModal(isSuccessful) {
            if (isSuccessful) {
                window.location.href = '/'; // 회원가입 성공 시 홈으로 이동
            } else {
                this.errorModal = false; // 오류 모달 닫기
            }
        },
        execDaumPostcode() {
            if (this.daum) {
                new this.daum.Postcode({
                    oncomplete: (data) => {
                        this.zipcode = data.zonecode;
                        this.address = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
                        this.$nextTick(() => {
                            this.$refs.addressDetail.focus();
                        });
                    }
                }).open();
            } else {
                console.error("Daum Postcode API가 로드되지 않았습니다.");
            }
        }
    },
    mounted() {
        const script = document.createElement('script');
        script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.onload = () => {
            this.daum = window.daum;
        };
        document.body.appendChild(script);
    }
};
</script>

<style scoped>
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

.member-signup {
    max-width: 600px;
    margin: 0 auto;
    padding-top: 3%;
    text-align: center;
}

h2 {
    margin-bottom: 10px;
}

hr {
    border: 0;
    border-top: 1px solid #eaeaea;
    margin-bottom: 30px;
}

/* form-group 안의 요소들을 좌우로 배치 */
.form-group {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    align-items: center; /* 라벨과 입력필드를 세로 가운데 정렬 */
}

/* 라벨을 왼쪽에 배치하고 넓이를 지정 */
label {
    width: 30%;
    text-align: left; /* 왼쪽 정렬 */
    margin-right: 10px;
}

/* 입력 필드를 오른쪽에 배치하고 넓이를 지정 */
input, span {
    width: 65%; /* 입력 필드의 넓이를 조절 */
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

/* 우편번호 찾기 버튼의 스타일 */
input[type="button"].find-postal {
    width: 100%; /* 필요한 만큼의 넓이만 차지하도록 설정 */
    margin-left: 10px; /* 우편번호 입력 필드와 간격을 줌 */
    padding: 10px;
    background-color: #FFE2A6;
    font-size: 18px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

input.find-postal:hover {
    background-color: #FFD68B;
}

/* 회원 가입 버튼 스타일 */
button.submit-btn {
    width: 100%;
    padding: 10px;
    background-color: #BCC07B;
    font-size: 18px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button.submit-btn:hover {
    background-color: #a3a66a;
}
</style>

