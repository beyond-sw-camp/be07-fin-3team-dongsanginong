<template>
    <v-container>
        <FarmMenuComponent
        :currentMenu="3" />
        <v-row justify="center">
            <v-col cols="12" sm="8" md="6" lg="8">
                <v-card v-for="notice in noticeList" :key="notice.id" class="notice-class elevation-0" outlined>
                    <v-card-title style="font-size: 17px;">{{ notice.title }}</v-card-title>
                    <v-card-text>
                        {{ notice.content }}
                    </v-card-text>

                    <v-carousel
                        v-if="notice.noticeImages && notice.noticeImages.length > 0"
                        hide-delimiters
                        height="300"
                        class="mt-3"
                    >
                        <v-carousel-item
                            v-for="image in notice.noticeImages"
                            :key="image.id">
                        <v-img v-bind:src="image" alt="Notice image" height="300"></v-img>
                        </v-carousel-item>
                    </v-carousel>

                    <br>
                    <v-row>
                        <v-btn @click="goToDetail(notice.id)" color="white" style="box-shadow: none; border: none; margin-bottom: 10px; font-size: 12px;">
                            <img src="/comment.png" width=25 alt="Logo" /> 
                            {{ notice.commentCnt }}
                        </v-btn>
                        <v-btn @click="goToDetail(notice.id)" class="btn-no-background">자세히 보기</v-btn>
                    </v-row>

                </v-card>
                <!-- 페이징 처리 -->
                <v-pagination
                        v-model="currentPage"
                        :length="pageCount"
                    ></v-pagination>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import FarmMenuComponent from '@/components/menubar/FarmMenuComponent.vue';
import axios from 'axios';
export default {
    components: {
        FarmMenuComponent
    },
    data() {
        return {
            noticeList: [],
            currentPage: 1, // 페이지 1번부터 시작 
            pageSize: 15, // 한 페이지에 15개씩 출력 
            totalItems: 0,   
        }
    },
    computed: {
        pageCount() {
            return Math.ceil(this.totalItems / this.pageSize);
        }
    },
    watch: {
        currentPage(newPage) {
            this.farmNoticeList(newPage);
        }
    },
    created() {
        this.farmNoticeList(this.currentPage)
    },
    methods: {
        async farmNoticeList(page) {
            try {
                const id = this.$route.params.farmId;
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/product-service/farm/no-auth/${id}/notice/list`, {
                    params: {
                        page: page - 1, 
                        size: this.pageSize  
                    }
                });
                this.noticeList = response.data.content;
                this.totalItems = response.data.totalElements;
                console.log(response.data);
            } catch(e) {
                console.log(e);
            }
        },
        goToDetail(noticeId) {
            const farmId = this.id;
            this.$router.push({ 
                name: 'NoticeDetailWithComment', 
                params: { farmId: farmId, notice_id: noticeId }
            });
        }
    }

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
.btn-no-background {
  box-shadow: none !important; 
  border: none !important;
  color: #808080;
  position: absolute;
  bottom: 10px;
  right: 30px;
}
</style>
