<template>
    <v-carousel cycle :show-arrows="false" delimiter-icon="mdi-square" delimiter-color="light_green" height="400"
        interval="5000" hide-delimiter-background> <!--5초마다 슬라이드-->
        <v-carousel-item v-for="(image, index) in images" :key="index" style="overflow: hidden;">
            <img :src="image.src" :alt="image.alt" class="banner-img" />
        </v-carousel-item>
    </v-carousel>

    <!-- 인기 패키지 -->
    <v-container>
        <!-- 제목 -->
        <v-col cols="12">
            <h3 class="text-center">
                🏆 패키지 실시간 인기 랭킹 🏆
            </h3>
            <p class="text-center">가장 인기있는 상품만 모아보세요!</p>
        </v-col>

        <!-- 상품 슬라이드 -->
        <v-window v-model="onboarding" style="width: 1080px; justify-content: center; margin: auto;">
            <!-- v-model="onboarding": 현재 활성화된 슬라이드의 인덱스를 바인딩 -->
            <v-window-item v-for="n in windowCount" :key="`window-${n}`" :value="n">
                <div class="d-flex justify-center">
                    <div v-for="(packageProduct, index) in paginatedPackages(n)" :key="index" style="margin: auto;">
                        <div style="padding-bottom: 30px;">
                            <v-img class="package-img" style="width:190px; height:190px;" width="190px" height="180px"
                                :src="packageProduct.imageUrl" alt="Farm 썸네일" cover />
                        </div>
                        <div style="display: flex;">
                            <div class="grade" :class="{ 'top-grade': (4 * (n-1) + index + 1) <= 3 }">{{ 4 * (n-1) + index + 1 }}</div> <p>{{ packageProduct.packageName }}</p>
                        </div>
                        <p style="font-size: small; color: #5D5D5D;" v-if="packageProduct.farmName.length > 10"> {{
                            packageProduct.farmName.substring(0, 10) }}... </p>
                        <p v-else> {{ packageProduct.farmName }}</p>
                    </div>
                </div>
            </v-window-item>
        </v-window>
        <v-card-actions style="justify-content: center;">
            <v-item-group v-model="onboarding" class="text-center" mandatory>
                <v-item v-for="n in windowCount" :key="`btn-${n}`" v-slot="{ isSelected, toggle }" :value="n">
                    <v-btn :color="isSelected ? 'yellow' : 'deep_green'" icon="mdi-circle-small"
                        @click="toggle"></v-btn>
                </v-item>
            </v-item-group>
        </v-card-actions>
        <!-- 전체보기 버튼 -->
        <v-col cols="12" class="text-center">
            <v-btn color="deep_green" @click="this.$router.push()">
                🥦 패키지 전체보기
            </v-btn>
        </v-col>
    </v-container>
    <!-- 인기 패키지 끝 -->


    <!-- 인기 농장 -->
    <v-container class="farm-container">
        <!-- 제목 -->
        <v-col cols="12">
            <h3 class="text-center">
                🏠 실시간 인기 농장 🏠
            </h3>
            <p class="text-center">즐겨찾기 수가 많은 농장들입니다.</p>
        </v-col>

        <v-window v-model="farmOnboarding" style="width: 1080px; justify-content: center; margin: auto;">
            <!-- v-model="onboarding": 현재 활성화된 슬라이드의 인덱스를 바인딩 -->
            <v-window-item v-for="n in windowCount" :key="`window-${n}`" :value="n">
                <div class="d-flex justify-center">
                    <div v-for="(farm, index) in paginatedFarm(n)" :key="index" style="margin: auto;">
                        <div style="padding-bottom: 30px;">
                            <v-img class="package-img" style="width:190px; height:190px;" width="190px" height="180px"
                                :src="farm.imageUrl" alt="Farm 썸네일" cover />
                        </div>
                        <div style="display: flex; justify-content:center">
                            <div class="grade" :class="{ 'top-grade': (4 * (n-1) + index + 1) <= 3 }">{{ 4 * (n-1) + index + 1 }}</div>
                            <p style="font-size: middle"> {{ farm.farmName }}</p>
                            <v-chip
                            class="like-chip"
                            size="small"
                            color="deep_orange"
                            style="margin-left: 10px;"
                            @click="clickLike((4 * (n-1) + index + 1))"
                            >
                            💛 {{ farm.favoriteCount }}
                            </v-chip>

                            <!-- 하트 이모지 애니메이션 -->
                            <div v-if="likes[(4 * (n-1) + index + 1)] == true" class="heart-emoji">💛</div>
                        </div>
                    </div>
                </div>
            </v-window-item>
        </v-window>
        <v-card-actions style="justify-content: center;">
            <v-item-group v-model="farmOnboarding" class="text-center" mandatory>
                <v-item v-for="n in windowCount" :key="`btn-${n}`" v-slot="{ isSelected, toggle }" :value="n">
                    <v-btn :color="isSelected ? 'yellow' : 'deep_green'" icon="mdi-circle-small"
                        @click="toggle"></v-btn>
                </v-item>
            </v-item-group>
        </v-card-actions>
        <!-- 전체보기 버튼 -->
        <v-col cols="12" class="text-center">
            <v-btn color="deep_green" @click="this.$router.push('/farm')">
                🌾 농장 둘러보기
            </v-btn>
        </v-col>
    </v-container>
    <!-- 인기 농장 끝 -->

</template>
<script>
import axios from 'axios';

export default {
    data() {
        return {
            images: [],
            items: [],
            windowCount: 3,
            onboarding: 1,
            scrollPosition: 0,
            farmList: [],
            farmOnboarding: 1,
            likes: [],
        }
    },
    mounted() {
        // 3초마다 슬라이드 전환
        // this.startAutoSlide();
    },
    methods: {
        startAutoSlide() {
            setInterval(() => {
                this.saveScrollPosition();  // 스크롤 위치 저장
                this.onboarding = (this.onboarding + 1) % this.windowCount;
                this.farmOnboarding = (this.farmOnboarding + 1) % this.windowCount;
                this.restoreScrollPosition();  // 스크롤 위치 복원
            }, 5000); // 3000ms마다 다음 슬라이드로 이동
        },
        paginatedPackages(page) {
            // 페이지에 따라 프로젝트를 반환하도록 수정
            const packagesPerPage = 4;
            const start = (page - 1) * packagesPerPage;
            const end = start + packagesPerPage;
            console.log(this.items.slice(start, end));
            return this.items.slice(start, end);
        },
        paginatedFarm(page) {
            // 페이지에 따라 프로젝트를 반환하도록 수정
            const farmsPerPage = 4;
            const start = (page - 1) * farmsPerPage;
            const end = start + farmsPerPage;
            console.log(this.farmList.slice(start, end));
            return this.farmList.slice(start, end);
        },
        saveScrollPosition() {
            this.scrollPosition = window.scrollY;  // 현재 스크롤 위치 저장
        },
        restoreScrollPosition() {
            window.scrollTo(0, this.scrollPosition);  // 저장된 스크롤 위치로 이동
        },
        clickLike(idx) {
            if(this.likes[Number(idx)] == false) {
                this.likes[Number(idx)] = true;
            } else {
                this.likes[Number(idx)] = false;
            }

            setTimeout(() => {
                this.likes[Number(idx)] = false;  // 1초 후에 liked 상태를 다시 false로 변경
            }, 1000);  // 1초 동안 하트 표시
        }

    },
    async created() {
        // 테스트용 임시 데이터
        this.images = [
            { "src": "https://dongsanginong-bucket.s3.ap-northeast-2.amazonaws.com/local/test_banner.png", "alt": "배너사진1", "link": "/event1" },
            { "src": "https://dongsanginong-bucket.s3.ap-northeast-2.amazonaws.com/local/_+(2).jpeg", "alt": "배너사진2", "link": "/event2" },
            { "src": "https://dongsanginong-bucket.s3.ap-northeast-2.amazonaws.com/local/_+(3).jpeg", "alt": "배너사진3", "link": "/event2" },
            { "src:": "https://dongsanginong-bucket.s3.ap-northeast-2.amazonaws.com/local/desktop+wallpaper.jpeg", "alt": "배너사진4", "link": "/event2" },
            { "src": "https://dongsanginong-bucket.s3.ap-northeast-2.amazonaws.com/local/desktop+wallpaper.jpeg", "alt": "배너사진5", "link": "/event2" }
        ];

        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/product-service/product/no-auth/top10`);
        this.items = response.data;
        console.log(this.items);

        const params = {
            "page": 0,
            "size": 10,
            "sort": "favoriteCount,desc"
        }

        try {
            const response2 = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/product-service/farm/no-auth/list`, { params });
            this.farmList = response2.data.content;

            this.likes = new Array(this.farmList.length);
            for(let i=0; i<this.farmList.length; ++i) {
                this.likes[i] = false;
            }
        } catch (e) {
            console.log(e);
        }


    },
    computed: {
        chunkedItems() {
            // 한 번에 4개씩 아이템을 나누어서 배열을 생성
            const chunkSize = 4;
            const result = [];
            for (let i = 0; i < this.items.length; i += chunkSize) {
                result.push(this.items.slice(i, i + chunkSize));
            }
            return result;
        }
    },
}
</script>
<style scoped>
.v-carousel-item {
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    /* 넘치는 부분 감추기 */
    background-color: #f5f5f5;
}

.banner-img {
    object-fit: cover;
    width: 100%;
    /* 부모의 너비에 맞추기 */
    height: 100%;
    /* 부모의 높이에 맞추기 */
}

.text-center {
    text-align: center;
}

.package-img {
    border-radius: 10px;
}

.package-img:hover {
    box-shadow: 10px 10px #5D5D5D, 0 25px 40px rgba(0, 0, 0, 0.30), 0 15px 12px rgba(0, 0, 0, 0.22);
    transition: 0.5s ease;
}

.farm-container {
    margin-top: 20px;
    padding-top: 10px;
    border-top: 1px #5D5D5D solid;
}

.slider-wrapper {
    width: 100%;
    overflow: hidden;
    position: relative;
}

.slider {
    display: flex;
    width: max-content;
    transition: transform 0.1s linear;
}

.card {
    flex-shrink: 0;
    width: 300px;
    margin: 0 10px;
}

.grade {
    width: 30px;
    height: 30px;
    text-align: center;
    line-height: 30px;
    background-color: #D8D8D8;
    margin-right: 10px;
    border-radius: 10px;
    font-size: large;
    color: #424242;
}

.top-grade {
    background-color: #FFE2A6;
    font-weight: bold;
    font-size: large;
    color: #DF7401;
}

.like-chip:hover {
    background-color: #FFE2A6;
    transition: 0.5s ease;
}

.heart-emoji {
    position: absolute;
    transform: translateX(-50%); /* 중앙 정렬을 위한 트랜스폼 */
    font-size: 24px;
    opacity: 0; /* 애니메이션 전에는 보이지 않도록 설정 */
    animation: popUp 1s ease-in-out forwards; /* 애니메이션 정의 */
}

@keyframes popUp {
    0% {
        opacity: 0;
        transform: translate(-50%, 0) scale(0); /* 처음에는 원래 위치에서 scale 0으로 시작 */
    }
    50% {
        opacity: 1;
        transform: translate(-50%, -50px) scale(1.5); /* 위로 이동하면서 크기 확대 */
    }
    100% {
        opacity: 0;
        transform: translate(-50%, -100px) scale(0); /* 더 위로 이동하면서 크기 축소 */
    }
}
</style>