<template>
    <div class="member-page" style="padding-right: 300px;">
        <MemberSidebar />
        <div class="member-change-address">
            <h2>주소지 변경</h2>
            <hr class="horizontal-divider" />
            <form @submit.prevent="onSubmit">
                <div class="form-group">
                    <label for="zipcode">우편번호</label>
                    <input type="text" id="zipcode" v-model="zipcode" placeholder="우편번호를 입력하세요 (ex. 12345)" required />
                </div>

                <input type="button" class="find-postal" @click="execDaumPostcode" value="우편번호 찾기" />

                <div class="form-group">
                    <label for="address">주소</label>
                    <input type="text" id="address" v-model="address" placeholder="도로명 주소를 입력하세요 (ex. 서울시 노원구)"
                        required />
                </div>
                <div class="form-group">
                    <label for="address-detail">상세 주소</label>
                    <input type="text" id="address-detail" v-model="addressDetail" placeholder="상세 주소를 입력하세요 (ex. 101호)"
                        required ref="addressDetail" />
                </div>

                <hr class="horizontal-divider" style="margin-top:60px"/>

                <div class="footer">
                    <div class="update-container">
                        <button type="submit" class="update-button">주소지 변경하기</button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <v-dialog v-model="alertModal" max-width="300px">
        <v-card class="modal" style="align-items: center; text-align: center; height: 130px; padding-bottom: 20px; 
        overflow-y: hidden;">
            <v-card-text style="margin-bottom:5px">{{ modalMessage }}</v-card-text>
            <v-btn @click="handleAlertClose" class="submit-btn" style="border-radius: 50px; width: 100px">close</v-btn>
        </v-card>
    </v-dialog>

    <v-dialog v-model="errorModal" max-width="300px">
        <v-card class="modal" style="align-items: center; text-align: center;">
            <v-card-text>주소지 변경 중 오류가 발생했습니다. <br /> 다시 시도해주세요.</v-card-text>
            <v-btn @click="handleCloseErrorModal" class="submit-btn" width="100px">close</v-btn>
        </v-card>
    </v-dialog>
</template>

<script>
import axios from 'axios';
import MemberSidebar from '@/components/sidebar/MemberSidebar.vue';

export default {
    components: {
        MemberSidebar
    },
    data() {
        return {
            memberInfo: {
                phone: '',
                address: '',
                addressDetail: '',
                zipcode: ''
            },
            zipcode: '',
            address: '',
            addressDetail: '',
            alertModal: false,
            errorModal: false,
            modalMessage: '',
            loading: false
        };
    },
    methods: {
        async fetchMemberInfo() {
            this.loading = true;
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/member-service/member/member-info`);
                this.memberInfo = response.data;
            } catch (error) {
                console.log(error);
            } finally {
                this.loading = false;
            }
        },
        handleAlertClose() {
            this.alertModal = false;
            if (this.modalMessage === "주소지가 변경되었습니다.") {
                window.location.reload();
            }
        },
        handleCloseErrorModal() {
            this.errorModal = false;
        },
        async onSubmit() {
            // 입력값 검증
            if (!this.zipcode || !this.address || !this.addressDetail) {
                this.modalMessage = "모든 주소 정보를 입력해 주세요."; // 에러 메시지 설정
                this.errorModal = true; // 에러 모달 띄우기
                return; // 함수 종료
            }

            const addressData = {
                phone: this.memberInfo.phone,
                zipcode: this.zipcode,
                address: this.address,
                addressDetail: this.addressDetail
            };

            try {
                await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/member-service/member/update-info`, addressData);
                this.modalMessage = "주소지가 변경되었습니다.";
                this.alertModal = true;
            } catch (error) {
                console.error("주소지 변경 실패:", error);
                this.modalMessage = "주소지 변경에 실패했습니다.";
                this.errorModal = true; // 에러 모달 띄우기
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
                console.error("주소지 변경에 실패했습니다. 다시 시도해주세요.");
            }
        }
    },
    mounted() {
        this.fetchMemberInfo(); // Fetch member info to populate fields
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

.member-page {
    margin-left: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px;
    flex-direction: column;
}

.member-change-address {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 40px;
    width: 1000px;
    height: 650px;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
    margin-bottom: 10px;
}

hr {
    border: 0;
    border-top: 1px solid #eaeaea;
    margin-bottom: 30px;
}

.form-group {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    align-items: center;
    margin-top: 50px;
}

label {
    width: 30%;
    text-align: left;
    font-weight: 900;
    font-size: large;
    color: #4a4a4a;
    margin-left: 100px;
}

input {
    width: 65%;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-right: 50px;
}

input[type="button"].find-postal {
    width: 57.7%;
    margin-left: 340px;
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

.horizontal-divider {
    width: 100%;
    border: none;
    border-top: 1px solid #ccc;
    margin: 20px 0;
}

.footer {
    display: flex;
    flex-direction: column;
    margin-top: auto;
}

.submit-btn {
    margin-left: 10px;
    margin-top: 8px;
    background-color: #BCC07B;
    color: black;
    border-radius: 50px;
}

.update-container {
    width: 100%;
    display: flex;
    justify-content: flex-end;
}

.update-button {
    background-color: #BCC07B;
    color: black;
    padding: 10px 20px;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    font-size: 16px;
}
</style>
