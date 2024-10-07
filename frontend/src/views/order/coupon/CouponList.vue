<template>
  <SellerSidebar />

  <v-container fluid>
    <v-row justify="center">
      <!-- Coupon Table -->
      <v-col cols="12" md="8" offset-md="0">
        <v-row>
          <v-btn class="create-btn" @click="openCouponCreateModal">쿠폰 생성</v-btn>
        </v-row>
        <div class="table-container">
          <v-card class="excel-table">
            <thead>
              <tr>
                <th class="excel-header">쿠폰명</th>
                <th class="excel-header">할인율(%)</th>
                <th class="excel-header">유효기간</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="coupon in paginatedCoupons" :key="coupon.id">
                <td class="excel-cell">{{ coupon.couponName }}</td>
                <td class="excel-cell">{{ coupon.discountPercentage }}%</td>
                <td class="excel-cell">{{ formatDateTime(coupon.expiration) }}</td>
              </tr>
            </tbody>
          </v-card>
        </div>
      </v-col>
    </v-row>

    <!-- Pagination Buttons -->
    <v-row justify="center" class="pagination-buttons">
      <v-btn icon @click="prevPage" :disabled="currentPage === 1">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <v-btn icon @click="nextPage" :disabled="isLastPage">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </v-row>

    <!-- 쿠폰 생성 모달 -->
    <CouponCreate v-model:dialog="isCouponCreateModalOpen" @new-coupon="getCouponList" />
  </v-container>
</template>

<script>
import axios from 'axios';
import SellerSidebar from '@/components/sidebar/SellerSidebar.vue';
import CouponCreate from '@/views/order/coupon/CouponCreate.vue';

export default {
  components: {
    SellerSidebar,
    CouponCreate, // 쿠폰 생성 컴포넌트 등록
  },
  data() {
    return {
      couponList: [], // 전체 쿠폰 리스트
      currentPage: 1, // 현재 페이지
      itemsPerPage: 10, // 한 번에 보여줄 쿠폰 수 (10개로 설정)
      isLastPage: false, // 마지막 페이지 여부
      isCouponCreateModalOpen: false, // 쿠폰 생성 모달 상태
    };
  },
  computed: {
    paginatedCoupons() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.couponList.slice(start, end); // 현재 페이지에 해당하는 쿠폰 리스트 반환
    },
  },
  mounted() {
    this.getCouponList(); // 처음 페이지 로드 시 쿠폰 리스트를 불러옴
  },
  methods: {
    async getCouponList() {
      try {
        const farmId = this.$route.params.farm_id;
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/order-service/coupons/${farmId}/list`);
        
        // 쿠폰 리스트를 id 기준으로 내림차순 정렬
        this.couponList = response.data.sort((a, b) => b.id - a.id);

        this.checkIfLastPage();
      } catch (error) {
        console.error('Error fetching coupon list:', error);
      }
    },
    nextPage() {
      if (!this.isLastPage) {
        this.currentPage++;
        this.checkIfLastPage();
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.isLastPage = false; // 이전 페이지로 이동 시 마지막 페이지가 아님
      }
    },
    checkIfLastPage() {
      const totalItems = this.couponList.length;
      const totalPages = Math.ceil(totalItems / this.itemsPerPage);
      this.isLastPage = this.currentPage >= totalPages;
    },
    formatDateTime(dateString) {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
      return date.toLocaleString(undefined, options); // 날짜와 시간을 보기 좋게 포맷
    },
    openCouponCreateModal() {
      this.isCouponCreateModalOpen = true; // 모달 열기
    },
  },
};
</script>

<style scoped>
.table-container {
  max-width: 100%;
  overflow-x: auto;
  margin-left: -120px; /* 왼쪽으로 100px 이동 */
  margin-top: 15px;
}

.excel-table {
  width: 900px;
  margin-left: auto;
  margin-right: auto;
  border-collapse: collapse;
  border-radius: 10px;
  overflow-x: hidden;
  margin-top: 5px;
}

.excel-header {
  background-color: #e0e0e0;
  font-weight: bold;
  text-align: center;
  padding: 16px;
  border: 1px solid #e0e0e0;
  font-size: 18px;
  position: sticky;
  top: 0;
  z-index: 1;
}

.excel-cell {
  width: 300px;
  height: 60px;
  padding: 16px;
  text-align: center;
  border: 1px solid #ddd;
  font-size: 16px;
}

.v-progress-circular {
  margin-top: 20px;
}

.v-btn {
  margin: 10px;
}

.pagination-buttons {
  margin-left: -250px; /* 페이지네이션 버튼 왼쪽으로 100px 이동 */
  margin-bottom: 50px; /* 페이지네이션 버튼 밑으로 50px */
}

.create-btn {
  background-color: #BCC07B;
  color: black;
  border-radius: 30px;
  padding: 10px 40px;
  font-size: 15px;
  font-weight: bold;
  line-height: 1.5;
  margin-left: 650px;
  margin-top: 50px;
}
</style>
