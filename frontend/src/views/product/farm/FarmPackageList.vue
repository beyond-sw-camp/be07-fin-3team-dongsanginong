<template>
    <FarmMenuComponent :currentMenu="2"/>
  
    <v-container style="max-width: 1200px;"> <!-- max-width를 1200px로 조정 -->
      <!-- <v-row justify="center" style="margin-bottom: 10px;">
        <h2>패키지 둘러보기</h2>
      </v-row> -->
  
      <!-- 에러 메시지 출력 -->
      <v-row v-if="errorMessage">
        <v-col>
          <v-alert type="error">
            {{ errorMessage }}
          </v-alert>
        </v-col>
      </v-row>
  
      <!-- 패키지 리스트 슬라이드 -->
      <v-row v-else justify="center" style="gap: 10px;"> <!-- 중앙 정렬을 위한 justify-center -->
        <v-col
          v-for="(packageProduct, index) in paginatedPackageList"
          :key="index"
          cols="12"
          sm="6"
          md="3"
          lg="2"
          class="d-flex justify-center"
          style="margin:25px; padding: 0px;"
        >
          <v-card elevation="0" class="v-card" style="width: 190px; height: 220px; padding: 0px;">
            <v-img
              :src="packageProduct.imageUrl"
              alt="Package Image"
              height="150px"
              contain
            ></v-img>
            <v-card-text>
              <div class="package-name" style="text-align: left;">
                {{ packageProduct.packageName }}
              </div>
              <div class="package-price" style="text-align: left; color: #8e8e8e;">
                {{ packageProduct.price.toLocaleString() }} 원
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
  
      <!-- 슬라이드 컨트롤 버튼 -->
      <v-row justify="center" class="mt-4">
        <v-btn icon="mdi-chevron-left" variant="plain" @click="prevPage" :disabled="currentPage === 1"></v-btn>
        <v-btn icon="mdi-chevron-right" variant="plain" @click="nextPage" :disabled="currentPage === totalPages"></v-btn>
      </v-row> <br><br><br><br>
    </v-container>
  </template>
  
  
  
<script>
import axios from 'axios';
import FarmMenuComponent from '@/components/menubar/FarmMenuComponent.vue';

export default {
  components: {
    FarmMenuComponent
  },
  data() {
    return {
      packageProductList: [], // 전체 상품 리스트
      currentPage: 1, // 현재 페이지
      itemsPerPage: 4, // 한 페이지당 보여줄 아이템 수
      farmId: null,
      errorMessage: null
    };
  },
  computed: {
    totalPages() {
      // 총 페이지 수 계산
      return Math.ceil(this.packageProductList.length / this.itemsPerPage);
    },
    paginatedPackageList() {
      // 현재 페이지에 해당하는 상품 리스트만 반환
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.packageProductList.slice(start, end);
    }
  },
  async created() {
    this.farmId = this.$route.params.farmId;

    try {
      const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/product-service/product/no-auth/for-sale/${this.farmId}`);
      this.packageProductList = response.data;
    } catch (e) {
      this.errorMessage = '데이터를 불러오는 중 오류가 발생했습니다.';
      console.error(e);
    }
  },
  methods: {
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    }
  }
};

</script>

<style scoped>
.package-name {
    font-size: 16px;
    font-weight: bold;
    margin-top: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.package-price {
    font-size: 14px;
    color: #8e8e8e;
}
</style>
