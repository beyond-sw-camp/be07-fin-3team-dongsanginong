<template>
    <br><br>
    <div class="review-container">
      <h2 class="review-header">전체 리뷰({{ reviews.length }})</h2>
  
      <!-- 리뷰 목록 -->
      <v-row v-if="paginatedReviews.length > 0" class="review-row">
        <v-col
          v-for="(review, index) in paginatedReviews"
          :key="index"
          cols="12"
          md="8"
          class="review-item"
        >
          <!-- 리뷰 카드 클릭 시 디테일 페이지로 이동 -->
          <v-card class="review-card" @click="goToReviewDetail(review.id)">
            <div class="card-header">
              <div class="rating">
                <!-- 별점 표시 -->
                <span v-for="star in 5" :key="star">
                  <v-icon v-if="star <= review.rating" class="star-icon">mdi-star</v-icon>
                  <v-icon v-else class="star-icon">mdi-star-outline</v-icon>
                </span>
              </div>
              <!-- 업데이트 날짜 표시 -->
              <div class="review-date">
                {{ formatDate(review.updateAt) }}
              </div>
            </div>
  
            <!-- 상품 이름 표시 (회색) -->
            <div class="package-name">
              상품명: {{ review.packageName }}
            </div>
  
            <div class="review-title">
              <strong>{{ review.title }}</strong>
            </div>
  
            <div class="review-images" v-if="review.imageUrls && review.imageUrls.length">
              <img
                v-for="(imageUrl, i) in review.imageUrls"
                :key="i"
                :src="imageUrl"
                class="review-image"
                alt="리뷰 이미지"
              />
            </div>
          </v-card>
        </v-col>
      </v-row>
  
      <!-- 페이지네이션 -->
      <v-pagination
        v-model="currentPage"
        :length="totalPages"
        @input="paginateReviews"
        class="pagination"
      ></v-pagination>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        reviews: [],
        currentPage: 1,
        reviewsPerPage: 5,
        paginatedReviews: [],
      };
    },
    computed: {
      totalPages() {
        return Math.ceil(this.reviews.length / this.reviewsPerPage);
      },
    },
    mounted() {
      this.fetchReviews();
    },
    methods: {
      async fetchReviews() {
        const farmId = this.$route.params.farmId;
        try {
          const response = await fetch(
            `${process.env.VUE_APP_API_BASE_URL}/product-service/reviews/no-auth/farm/${farmId}/list`
          );
          if (response.ok) {
            this.reviews = await response.json();
            this.reviews.sort((a, b) => b.id - a.id);
            this.paginateReviews(); // 첫 번째 페이지를 설정
          } else {
            console.error("리뷰 목록을 불러오는 중 오류 발생:", response.status);
          }
        } catch (error) {
          console.error("리뷰 목록을 불러오는 중 오류 발생:", error);
        }
      },
      paginateReviews() {
        const start = (this.currentPage - 1) * this.reviewsPerPage;
        const end = start + this.reviewsPerPage;
        this.paginatedReviews = this.reviews.slice(start, end);
      },
      formatDate(date) {
        if (!date) return '';
        return date.split('T')[0]; // 날짜를 'YYYY-MM-DD' 형식으로 잘라서 반환
      },
      // 리뷰 디테일 페이지로 이동하는 함수
      goToReviewDetail(reviewId) {
        this.$router.push({ name: 'ReviewDetail', params: { reviewId } });
      },
    },
  };
  </script>
  
  <style scoped>
  .review-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .review-header {
    text-align: left;
    width: 100%;
    max-width: 1200px; /* 카드와 동일한 최대 폭으로 설정 */
    margin-bottom: 30px;
    padding-left: 0; /* 왼쪽 여백을 없앰 */
  }
  
  .review-row {
    justify-content: center; /* 리뷰 카드들을 가운데 정렬 */
    width: 100%;
  }
  
  .review-card {
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
    background-color: #f9f9f9;
    margin-bottom: 20px;
    text-align: left; /* 카드 내부 내용 왼쪽 정렬 */
    width: 80%;
    max-width: 2000px; /* 카드의 최대 폭 설정 */
    cursor: pointer; /* 클릭 가능한 커서로 변경 */
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  
  .rating {
    display: flex;
    align-items: center;
  }
  
  .star-icon {
    color: #FF462D;
    font-size: 30px;
    padding: 0 5px;
    border-radius: 50%;
  }
  
  .review-date {
    font-size: 14px;
    color: #888;
  }
  
  .review-title {
    margin: 10px 0;
    font-size: 18px;
  }
  
  /* 상품 이름을 회색으로 표시 */
  .package-name {
    font-size: 16px;
    color: #888;
  }
  
  .review-images {
    display: flex;
    gap: 10px;
  }
  
  .review-image {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 10px;
  }
  
  .pagination {
    margin-top: 20px;
  }
  </style>
  