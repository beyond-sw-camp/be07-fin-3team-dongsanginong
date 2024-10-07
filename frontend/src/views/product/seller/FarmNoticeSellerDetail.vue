<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" sm="8" md="6" lg="8">
                <v-card class="notice-class elevation-0" outlined>
                    <v-card-title style="font-size: 17px;"> {{ title }} </v-card-title>
                    <v-card-text>{{ content }}</v-card-text>

                    <v-carousel v-if="images && images.length > 0" hide-delimiters height="300" class="mt-3">
                        <v-carousel-item v-for="image in images" :key="image.id">
                            <v-img :src="image" alt="Notice image" height="300"></v-img>
                        </v-carousel-item>
                    </v-carousel>
                </v-card>

                <!-- 수정 및 삭제 버튼을 수평으로 배치 -->
                <v-row justify="end" class="mt-3">
                    <v-btn @click="openEditDialog" class="edit-btn">수정하기</v-btn>
                    <v-btn @click="deleteNotice" class="delete-btn">삭제하기</v-btn>
                </v-row>

                <!-- 수정 모달 컴포넌트 추가 -->
                <farm-notice-update :notice-id="noticeId" ref="editModal" @notice-updated="farmNoticeDetail" />

                <!-- 삭제 완료 모달 -->
                <v-dialog v-model="alertModal" max-width="260px">
                    <v-card class="modal" style="padding: 10px; padding-right: 20px; text-align: center;">
                        <v-card-text>완료되었습니다.</v-card-text>
                        <v-btn @click="closeModal" class="submit-btn">close</v-btn>
                    </v-card>
                </v-dialog>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import FarmNoticeUpdate from '@/views/product/farmNotice/FarmNoticeUpdate.vue'; // 공지사항 수정 모달 import
import axios from 'axios';

export default {
    components: {
        FarmNoticeUpdate,
    },
    data() {
        return {
            title: "",
            content: "",
            images: [],
            noticeId: null,
            alertModal: false, // 모달 상태 관리 변수
        };
    },
    created() {
        this.farmNoticeDetail();
    },
    methods: {
        async farmNoticeDetail() {
            try {
                const farm_id = this.$route.params.farmId;
                const notice_id = this.$route.params.notice_id;
                this.noticeId = notice_id; // noticeId를 동적으로 설정
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/product-service/farm/no-auth/${farm_id}/notice/${notice_id}`);
                this.title = response.data.title;
                this.content = response.data.content;
                this.images = response.data.noticeImages;
            } catch (e) {
                console.log(e);
            }
        },
        openEditDialog() {
            this.$refs.editModal.openEditDialog(); // 모달 열기
        },
        async deleteNotice() {
            try {
                const notice_id = this.noticeId;
                const sellerId = localStorage.getItem('sellerId');

                await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/product-service/farm/notice/${notice_id}/delete`, {
                    headers: {
                        sellerId: sellerId
                    }
                });

                this.alertModal = true; // 삭제 완료 후 모달 표시
            } catch (e) {
                console.log(e);
            }
        },
        closeModal() {
            this.alertModal = false; // 모달 닫기
            const farm_id = this.$route.params.farmId;
            this.$router.push(`/seller/${farm_id}/notice/list`);
        },
    },
};
</script>

<style scoped>
.notice-class {
    margin-top: 20px;
    width: 800px;
    border: 1px solid #d4d4d4;
    border-radius: 10px;
    padding-top: 10px;
    padding-bottom: 10px;
    padding-right: 30px;
    padding-left: 30px;
}

.edit-btn, .delete-btn {
    background-color: #BCC07B;
    color: black;
    border-radius: 30px;
    padding: 10px 40px;
    font-size: 15px;
    font-weight: bold;
    line-height: 1.5;
}

.edit-btn {
    margin-right: 10px;
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
