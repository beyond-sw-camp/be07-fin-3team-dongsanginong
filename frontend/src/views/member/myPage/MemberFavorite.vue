<template>
    <MemberSidebar />
    <v-container class="custom-container">
        <v-card style="border-radius: 15px; padding: 20px; max-width: 1200px; width: 100%;" rounded="0" flat>
            <v-card-title>즐겨찾기 농장</v-card-title>
            <v-card-text style="color: gray;">회원님이 즐겨찾기한 농장입니다.</v-card-text>
            <div style="display: flex; justify-content: center; align-items:center;">
                <v-btn icon="mdi-chevron-left" variant="plain" @click="prevFarm" :disabled="farmOnboarding === 1"></v-btn>
                <v-window v-model="farmOnboarding" style="width: 1080px;">
                    <v-window-item v-for="n in farmWindowCount" :key="`farm-window-${n}`" :value="n">
                        <v-row class="d-flex justify-center">
                            <v-col v-for="(farm, index) in paginatedFarms(n)" :key="index" cols="12" md="3" class="d-flex justify-center">
                                <v-card variant="text" style="width:190px; height:230px;">
                                    <v-img class="farm-image" width="190px" height="180px" :src="farm.profileImageUrl" alt="Farm 썸네일" cover @click="this.$router.push(`/farm/${farm.id}`)" />
                                    <v-card-text style="padding: 0; margin-top: 10px; text-align:center; font-weight: bold;">
                                        <span v-if="farm.farmName.length > 10"> {{ farm.farmName.substring(0, 10) }}...</span>
                                        <span v-else> {{ farm.farmName }}</span>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-window-item>
                </v-window>
                <v-btn icon="mdi-chevron-right" variant="plain" @click="nextFarm" :disabled="!canGoToNextFarm"></v-btn>
            </div>
        </v-card>

        <v-card style="border-radius: 15px; padding: 20px; max-width: 1200px; width: 100%;" rounded="0" flat>
            <v-card-title>구독한 패키지</v-card-title>
            <v-card-text style="color: gray;">회원님이 구독한 패키지입니다.</v-card-text>
            <div style="display: flex; justify-content: center; align-items:center;">
                <v-btn icon="mdi-chevron-left" variant="plain" @click="prevProduct" :disabled="productOnboarding === 1"></v-btn>
                <v-window v-model="productOnboarding" style="width: 1080px;">
                    <v-window-item v-for="n in productWindowCount" :key="`product-window-${n}`" :value="n">
                        <v-row class="d-flex justify-center">
                            <v-col v-for="(packageProduct, index) in paginatedPackageProducts(n)" :key="index" cols="12" md="3" class="d-flex justify-center">
                                <v-card variant="text" style="width:190px; height:270px;">
                                    <v-img class="packageProduct-image" width="190px" height="180px" :src="packageProduct.imageUrl" alt="packageProduct 썸네일" cover @click="this.$router.push(`/packageProductProduct/${packageProduct.id}`)" />
                                    <v-card-text style="padding: 0; margin-top: 10px; font-weight: bold;">
                                        <span v-if="packageProduct.packageName.length > 10"> {{ packageProduct.packageName.substring(0, 10) }}...</span>
                                        <span v-else> {{ packageProduct.packageName }}</span>
                                        <div class="detail-container">
                                            <a class="toDetail" @click="createReview">후기 작성</a>
                                            <a class="toDetail" @click="receiptInfo">결제 내역 보기</a>
                                        </div>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-window-item>
                </v-window>
                <v-btn icon="mdi-chevron-right" variant="plain" @click="nextProduct" :disabled="!canGoToNextProduct"></v-btn>
            </div>
        </v-card>
    </v-container>
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
            favoriteFarmList: [], // 즐겨찾기 농장 리스트
            subscriptionPackageProductList: [], // 구독한 패키지 리스트
            farmOnboarding: 1,
            productOnboarding: 1,
            farmWindowCount: 3,
            productWindowCount: 3,
            isLoading: false,
        }
    },
    computed: {
        canGoToNextFarm() {
            const farmsPerPage = 4;
            const totalPages = Math.ceil(this.favoriteFarmList.length / farmsPerPage);
            return this.farmOnboarding < totalPages;
        },
        canGoToNextProduct() {
            const packageProductsPerPage = 4;
            const totalPages = Math.ceil(this.subscriptionPackageProductList.length / packageProductsPerPage);
            return this.productOnboarding < totalPages;
        }
    },
    async created() {
        await this.fetchFavoriteFarms(); // 즐겨찾기 농장 불러오기
        await this.fetchSubscriptionPackageProducts();
    },
    methods: {
        async fetchFavoriteFarms() {
            const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/member-service/member/favorite/farm`);
            this.favoriteFarmList = response.data;
        },
        nextFarm() {
            if (this.canGoToNextFarm) {
                this.farmOnboarding += 1;
            }
        },
        prevFarm() {
            if (this.farmOnboarding > 1) {
                this.farmOnboarding -= 1;
            }
        },
        paginatedFarms(page) {
            const farmsPerPage = 4;
            const start = (page - 1) * farmsPerPage;
            const end = start + farmsPerPage;
            return this.favoriteFarmList.slice(start, end);
        },

        async fetchSubscriptionPackageProducts() {
            const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/member-service/subscription/list`);
            this.subscriptionPackageProductList = response.data;
        },
        nextProduct() {
            if (this.canGoToNextProduct) {
                this.productOnboarding += 1;
            }
        },
        prevProduct() {
            if (this.productOnboarding > 1) {
                this.productOnboarding -= 1;
            }
        },
        paginatedPackageProducts(page) {
            const packageProductsPerPage = 4;
            const start = (page - 1) * packageProductsPerPage;
            const end = start + packageProductsPerPage;
            return this.subscriptionPackageProductList.slice(start, end);
        },
        createReview() {
            // 리뷰 모달 띄워주기
            this.reviewModal = true;
        },
        receiptInfo() {
            // 영수증 페이지로 보내주기
        }
    }
}
</script>

<style scoped>
.toDetail {
    color: #FFAF6E;
    font-size: 10px;
    font-weight: bold;
    cursor: pointer;
    text-decoration: none;
}

.detail-container{
    display: flex;
    justify-content: flex-start;
    gap: 10px;
}
</style>