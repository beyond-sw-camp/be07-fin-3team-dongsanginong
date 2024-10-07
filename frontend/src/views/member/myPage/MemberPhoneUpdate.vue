<template>
    <!-- 완료 모달 -->
    <v-dialog v-model="alertModal" max-width="300px">
        <v-card class="modal"
            style="align-items: center; text-align: center; height: 160px; padding-bottom: 20px; overflow-y: hidden;">
            <v-card-text>{{ modalMessage }}</v-card-text>
            <v-btn @click="handleAlertClose" class="submit-btn">확인</v-btn>
        </v-card>
    </v-dialog>

    <div class="member-page" style="padding-right: 300px;">
        <MemberSidebar />
        <div class="member-info">
            <h2>전화번호 수정</h2>
            <hr class="horizontal-divider" />

            <div class="info-container">
                <div class="label" style="padding-bottom: 20px;">
                    <label>현재 전화번호</label>
                    <label>새 전화번호</label>
                </div>

                <div class="divider"></div>

                <div class="value">
                    <input type="text" v-model="currentPhone" placeholder="현재 전화번호를 입력하세요." class="form-input" />
                    <input type="text" v-model="newPhone" placeholder="새 전화번호를 입력하세요." class="form-input" />
                </div>
            </div>

            <hr class="horizontal-divider" />

            <div class="footer">
                <div class="update-container">
                    <button class="update-button" @click="handleUpdatePhone">전화번호 수정하기</button>
                </div>
            </div>
        </div>
    </div>
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
            currentPhone: '',
            newPhone: '',
            loading: false,
            alertModal: false,
            modalMessage: ''
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
            if (this.modalMessage === "전화번호가 수정되었습니다.") {
                window.location.reload();
            }
        },
        async handleUpdatePhone() {
            if (this.currentPhone !== this.memberInfo.phone) {
                this.modalMessage = "전화번호가 일치하지 않습니다.";
            } else if (!this.newPhone) {
                this.modalMessage = "변경하실 전화번호를 입력해주세요.";
            } else {
                try {
                    const updateInfo = {
                        phone: this.newPhone,
                        address: this.memberInfo.address,
                        addressDetail: this.memberInfo.addressDetail,
                        zipcode: this.memberInfo.zipcode
                    };
                    await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/member-service/member/update-info`, updateInfo);
                    this.modalMessage = "전화번호가 수정되었습니다.";
                } catch (error) {
                    console.log(error);
                    this.modalMessage = "전화번호 수정에 실패했습니다.";
                }
            }
            this.alertModal = true;
        }
    },
    mounted() {
        this.fetchMemberInfo();
    }
};
</script>

<style scoped>
h2 {
    margin-bottom: 10px;
}

.modal {
    position: fixed;
    top: -100px;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background-color: white;
    padding: 40px;
    border-radius: 5px;
    width: 500px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #333;
}

.form-input {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-sizing: border-box;
    margin-bottom: 20px;
}

.modal-title+p {
    margin-bottom: 20px;
}

.error-message {
    color: red;
    margin-bottom: 10px;
}

.form-input {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-sizing: border-box;
    margin-bottom: 20px;
}

.member-page {
    margin-left: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px;
    flex-direction: column;
}

.member-info {
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

.header {
    margin-bottom: 20px;
}

.info-container {
    display: grid;
    grid-template-columns: 4fr auto 6fr;
    gap: 20px;
    align-items: center;
    width: 100%;
    flex-grow: 1;
}

.label {
    font-weight: 900;
    font-size: large;
    display: flex;
    color: #4a4a4a;
    flex-direction: column;
    height: 100%;
    text-align: left;
    justify-content: space-evenly;
    align-items: flex-start;
    padding-left: 130px;
    width: fit-content;
}

.value {
    display: flex;
    flex-direction: column;
    height: 78%;
    justify-content: space-evenly;
    text-align: left;
    padding-left: 80px;
    padding-right: 70px;
}

.value p {
    margin: 0;
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

.divider {
    width: 100%;
    border: none;
    border-top: 1px solid #ccc;
    margin: 20px 0;
}

.submit-btn {
    margin-left: 10px;
    margin-top: 8px;
    background-color: #BCC07B;
    color: black;
    border-radius: 50px;
}
</style>
