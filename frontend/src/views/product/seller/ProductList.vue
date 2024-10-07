<template>
  <SellerSidebar />
  <v-container fluid>
    <h3 style="padding: 10px; padding-left: 70px;">상품 관리</h3><br><br>


      <v-row class="align-center" style="padding-left: 70px; margin-top: -45px;">
      <v-col>
        <h4>판매중인 상품 조회</h4>
      </v-col>
      <v-col class="text-right">
        <v-btn @click="goToProductCreatePage" class="product-create-btn" style="border-radius: 50px; right: 185px;">
          상품 등록
        </v-btn>
      </v-col>
    </v-row>

    <v-col style="position: relative;"></v-col>
      <v-card class="product-card elevation-0" outlined>
        <v-table class="table-header">
          <thead>
            <tr>
              <th class="table-header">No.</th> <!-- 인덱스 추가 -->
              <th class="table-header">패키지 명</th>
              <th class="table-header">금액</th>
              <th class="table-header">고유번호</th> <!-- 고유번호 추가 -->
              <th class="table-header">관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(product, index) in products" :key="product.id">
              <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td> <!-- 인덱스 계산 -->
              <td>{{ product.packageName }}</td>
              <td>{{ product.price }}</td>
              <td>{{ product.productCode }}</td> <!-- 고유번호 출력 -->
              <td>
                <v-btn @click="goToEditPage(product.id)" class="manage-btn edit-btn">수정</v-btn>
                <v-btn @click="openDeleteModal(product.id)" class="manage-btn delete-btn">삭제</v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>

        <!-- 페이징 처리 -->
        <v-pagination v-model="currentPage" :length="pageCount"></v-pagination>
      </v-card>

      <!-- 삭제 확인 모달 -->
      <v-dialog v-model="deleteModal" max-width="260px">
        <v-card class="successModal" style="padding: 10px; padding-right: 20px; text-align: center;">
          <v-card-text>
            정말 이 상품을<br>삭제하시겠습니까?
          </v-card-text>
          <v-card-actions style="justify-content: center;">
            <v-btn @click="confirmDelete" class="submit-btn" >삭제</v-btn>
            <v-btn @click="cancelDelete" class="submit-btn" style="background-color: #e0e0e0;">취소</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="successModal" max-width="260px">
      <v-card class="successDeleteModal" style="padding: 10px; padding-right: 20px; text-align: center;">
        <v-card-text>
          상품이 성공적으로<br>삭제되었습니다.
        </v-card-text>
        <v-btn @click="closeSuccessModal" class="submit-btn">확인</v-btn>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
import axios from 'axios';
import SellerSidebar from '@/components/sidebar/SellerSidebar.vue';

export default {
  components: {
    SellerSidebar
  },

  data() {
    return {
      products: [], // 상품 목록
      currentPage: 1, // 현재 페이지
      pageSize: 10, // 한 페이지에 표시할 항목 수
      totalItems: 0, // 전체 상품 수
      deleteModal: false, // 삭제 확인 모달
      successModal: false,
      selectedProductId: null, // 선택된 상품 ID
    };
  },
  computed: {
    pageCount() {
      return Math.ceil(this.totalItems / this.pageSize); // 페이지 수 계산
    },
  },
  watch: {
    currentPage(newPage) {
    this.getProductList(newPage);
    },
  },
  created() {
    this.getProductList(this.currentPage); // 페이지 로드 시 상품 목록 가져오기
  },
  methods: {
    async getProductList(page) {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/product-service/seller/packages`, {
          params: {
            page: page - 1, // 백엔드는 0-based pagination 사용
            size: this.pageSize,
          },
        });
        this.products = response.data.content; // 상품 데이터 설정
        this.totalItems = response.data.totalElements; // 전체 상품 수 설정
        console.log(response)
      } catch (error) {
        console.error('Error fetching product list:', error);
      }
    },
    goToEditPage(productId) {
      // 수정 페이지로 이동
      console.log("상품 ID:", productId);
      this.$router.push({ name: 'ProductUpdate', params: { id: productId } });
    },
    openDeleteModal(productId) {
      // 삭제 모달 열기
      this.selectedProductId = productId;
      this.deleteModal = true;
    },
    async confirmDelete() {
      try {
        await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/product-service/seller/packages/${this.selectedProductId}/delete`);
        this.deleteModal = false; // 모달 닫기
        this.getProductList(this.currentPage); // 삭제 후 목록 다시 불러오기
        this.successModal = true;
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    },
    cancelDelete() {
      // 삭제 취소
      this.deleteModal = false;
      this.selectedProductId = null;
    },

    closeSuccessModal() {
      this.successModal = false;
    },
    goToProductCreatePage() {
      // 상품 등록 페이지로 이동
      this.$router.push({ name: 'ProductCreate' });
    }
  },
};
</script>

<style scoped>
.product-card {
  margin-top: 20px;
  width: 80%; /* 테이블 가로 길이 줄임 */
  margin: 0 auto; /* 중앙에 위치 */
  height: auto;
  border: 1px solid #d4d4d4;
  border-radius: 10px;
  padding: 20px;
  right: 62px;
}

.table-header {
  text-align: center !important;
  font-size: 14px;
  background-color: none;
  border-bottom: 1px solid #d4d4d4;
}

.manage-btn {
  margin-right: 10px;
}

.edit-btn {
  background-color: #bcc07b;
}

.delete-btn {
  background-color: #E0E0E0;
}

.product-create-btn {
  background-color: #bcc07b;
  color: black;
}
</style>
