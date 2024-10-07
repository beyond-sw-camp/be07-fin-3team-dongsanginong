<template>
    <div class="product-update-page-wrapper">
      <SellerSidebar />
  
      <div class="product-update-page">
        <!-- 패키지 이미지 수정 -->
        <div class="image-upload package-upload">
          <h3 class="title" style="text-align: center">패키지 이미지 수정</h3>
  
          <!-- 이미지 슬라이더 -->
          <div class="image-slider">
            <button class="slider-btn prev-btn" @click="prevImage" :disabled="currentIndex === 0">
              <v-icon>mdi-chevron-left</v-icon>
            </button>
  
            <div class="slider-wrapper">
              <!-- 이미지가 있는 경우 보여주는 부분 -->
              <div v-if="currentIndex < imageUrls.length" class="image-slide">
                <img :src="imageUrls[currentIndex]" alt="패키지 이미지" class="image-preview" />
                <button class="delete-btn" @click="removeImage(currentIndex)">
                  <v-icon>mdi-delete</v-icon>
                </button>
              </div>
  
              <!-- 새로운 이미지 추가 슬라이드 -->
              <div v-else class="image-slide" @click="triggerImageUpload">
                <div class="add-image-box">
                  <input type="file" @change="onImageUpload" class="image-input" ref="imageInput" />
                  <div class="upload-icon">+</div>
                </div>
              </div>
            </div>
  
            <button class="slider-btn next-btn" @click="nextImage" :disabled="currentIndex >= imageUrls.length">
              <v-icon>mdi-chevron-right</v-icon>
            </button>
          </div>
        </div>
  
        <!-- 상품 정보 수정 폼 -->
        <div class="product-info">
          <div class="input-group">
            <label for="productName">상품 명</label>
            <input type="text" id="productName" v-model="productName" placeholder="이름을 입력해주세요." />
          </div>
  
          <div class="input-group">
            <label for="productDescription">상품 설명</label>
            <textarea id="productDescription" v-model="productDescription" placeholder="설명을 입력해주세요."></textarea>
          </div>
  
          <div class="input-group">
            <label for="price">가격</label>
            <input type="number" id="price" v-model="price" placeholder="가격을 입력해주세요." />
          </div>
  
          <div class="input-group">
            <label for="deliveryPeriod">배송주기</label>
            <input type="text" id="deliveryPeriod" v-model="deliveryPeriod" placeholder="배송주기를 입력해주세요." />
          </div>
  
          <div class="input-group">
            <label for="origin">원산지</label>
            <input type="text" id="origin" v-model="origin" placeholder="원산지를 입력해주세요." />
          </div>
  
          <!-- 패키지 수정 버튼 -->
          <button @click="updateProduct" class="submit-button">패키지 수정</button>
        </div>
      </div>
  
      <!-- 성공 모달 -->
      <v-dialog v-model="successModal" max-width="260px">
        <v-card class="successModal" style="padding: 10px; padding-right: 20px; text-align: center;">
          <v-card-text>
            상품이 성공적으로<br>수정되었습니다.
          </v-card-text>
          <v-btn @click="closeSuccessModal" class="submit-btn">확인</v-btn>
        </v-card>
      </v-dialog>
  
      <!-- 검증 실패 모달 -->
      <v-dialog v-model="validationModal" max-width="260px">
        <v-card class="validationModal" style="padding: 10px; padding-right: 20px; text-align: center;">
          <v-card-text style="font-weight: bold;">
            {{ validationMessage }}
          </v-card-text>
          <v-btn @click="closeValidationModal" class="submit-btn">확인</v-btn>
        </v-card>
      </v-dialog>
    </div>
  </template>
  
  <script>
  import SellerSidebar from '@/components/sidebar/SellerSidebar.vue';
  import axios from 'axios';
  
  export default {
    components: {
      SellerSidebar
    },
  
    data() {
      return {
        productId: this.$route.params.id, // 상품 ID
        productName: '',
        productDescription: '',
        price: '',
        deliveryPeriod: '',
        origin: '',
        imageUrls: [], // 기존 이미지 리스트
        newImageUrls: [], // 새로 추가된 이미지 리스트
        deleteImageUrls: [], // 삭제할 이미지 리스트
        currentIndex: 0, // 슬라이더에서 현재 인덱스
        successModal: false,
        validationModal: false,
        validationMessage: ''
      };
    },
  
    created() {
      this.fetchProductDetails();
    },
  
    methods: {
      // 상품 정보를 API로 불러오기
      async fetchProductDetails() {
        try {
          const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/product-service/product/no-auth/detail/${this.productId}`);
          const productData = response.data;
          this.productName = productData.packageName;
          this.productDescription = productData.productDescription;
          this.price = productData.price;
          this.deliveryPeriod = productData.delivery_cycle;
          this.origin = productData.farmName;
          this.imageUrls = productData.imageUrls;
          console.log(response)
        } catch (error) {
          console.error('상품 정보 로드 실패:', error);
        }
      },
  
      // 이미지 업로드 트리거
      triggerImageUpload() {
        this.$refs.imageInput.click();
      },
  
      // 이미지 업로드 처리
      async onImageUpload(event) {
      const files = Array.from(event.target.files);
      for (let file of files) {
        const imageUrl = await this.uploadImage(file);
        if (imageUrl) {
          this.imageUrls.push(imageUrl); // 업로드된 이미지 URL을 리스트에 추가
          this.newImageUrls.push(imageUrl);
          this.currentIndex = this.imageUrls.length - 1; // 방금 추가한 이미지를 표시
        }
      }
    },
  
      async uploadImage(blob) {
        const accessToken = localStorage.getItem('accessToken');
        const body = {
          prefix: 'package',
          url: `${blob?.name}`
        };
        const headers = {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        };
        const getUrl = await fetch(`${process.env.VUE_APP_API_BASE_URL}/product-service/api/upload/presigned-url`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(body)
        });
  
        const getUrlResult = await getUrl.text();
        const awsUrl = {
          data: `${getUrlResult.split('?')[0]}`,
          auth: `?${getUrlResult.split('?')[1]}`
        };
  
        // 이미지 S3에 업로드
        const options = {
          method: 'PUT',
          headers: {
            'Content-Type': blob.type
          },
          body: blob
        };
        await fetch(awsUrl.data + awsUrl.auth, options);
  
        return awsUrl.data; // 업로드된 이미지 URL 반환
      },
  
      removeImage(index) {
        this.deleteImageUrls.push(this.imageUrls[index]); // 삭제할 이미지 리스트에 추가
        this.imageUrls.splice(index, 1); // 이미지 리스트에서 삭제
      },

      nextImage() {
        if (this.currentIndex <= this.imageUrls.length) {
          this.currentIndex++;
        }
      },

      prevImage() {
        if (this.currentIndex > 0) {
          this.currentIndex--;
        }
      },
  
      // 상품 정보 수정
      async updateProduct() {
        if (!this.productName || !this.productDescription || !this.price || !this.deliveryPeriod || !this.origin) {
          this.validationMessage = '모든 필수 입력 항목을 입력해주세요.';
          this.validationModal = true;
          return;
        }
  
        try {
          const accessToken = localStorage.getItem('accessToken');
          const sellerId = localStorage.getItem('sellerId');
  
          const updateData = {
            packageName: this.productName,
            productDescription: this.productDescription,
            price: this.price,
            deliveryCycle: this.deliveryPeriod,
            origin: this.origin,
            newImageUrls: this.newImageUrls,
            deleteImageUrls: this.deleteImageUrls
          };
          
          console.log('삭제할 이미지 URLs:', this.deleteImageUrls);
          console.log('새로운 이미지 URLs:', this.newImageUrls);
  
          const headers = {
            Authorization: `Bearer ${accessToken}`,
            sellerId: sellerId
          };
  
          await axios.put(`${process.env.VUE_APP_API_BASE_URL}/product-service/seller/packages/${this.productId}/update`, updateData, {
            headers: headers
          });
          this.successModal = true;
        } catch (error) {
          console.error('상품 수정 실패:', error);
        }
      },
  
      closeSuccessModal() {
      this.successModal = false;
      this.$nextTick(() => {
        // 모달이 닫힌 후 페이지 이동
        this.$router.push({ name: 'ProductList' });
      })
    },
  
      closeValidationModal() {
        this.validationModal = false;
      }
    }
  };
  </script>

<style scoped>
  .product-update-page-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 40px;
  }
  
  .product-update-page {
    display: flex;
    justify-content: space-between;
    padding: 20px;
    width: 80%;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: white;
    margin-left: 20px;
    margin-right: 20px;
  }
  
  .image-upload {
    width: 35%;
    position: relative;
  }
  
  .title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  .image-slider {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 100%;
  }
  
  .slider-wrapper {
    display: flex;
    justify-content: center;
    width: 300px;
    overflow: hidden;
    position: relative;
  }
  
  .image-slide {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .image-preview {
    width: 300px;
    height: 300px;
    object-fit: cover;
    border-radius: 8px;
  }
  
  .delete-btn {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background-color 0.3s ease, transform 0.3s ease;
  }
  
  .delete-btn:hover {
    background-color: rgba(0, 0, 0, 0.7);
    transform: scale(1.1);
  }
  
  .delete-icon {
    font-size: 20px;
  }
  
  .add-image-box {
    width: 300px;
    height: 300px;
    background-color: #f0f0f0;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
  
  .image-input {
    display: none;
  }
  
  .upload-icon {
    font-size: 36px;
    color: #666;
    cursor: pointer;
  }
  
  .slider-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 50%;
    padding: 10px;
    border: none;
    cursor: pointer;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
    transition: background-color 0.3s ease;
  }
  
  .slider-btn:hover {
    background-color: rgba(107, 104, 104, 0.7);
  }
  
  .prev-btn {
    left: -1px;
  }
  
  .next-btn {
    right: -1px;
  }
  
  .slider-btn v-icon {
    font-size: 24px;
    color: black;
  }
  
  .product-info {
    width: 50%;
    position: relative;
    left: -70px;
  }
  
  .input-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  input,
  textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 14px;
    background-color: #f9f9f9;
  }
  
  textarea {
    resize: none;
    height: 100px;
  }
  
  .submit-button {
    width: 30%;
    padding: 10px;
    background-color: #bcc07b;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    font-size: 16px;
    color: black;
    margin-top: 20px;
    margin-left: 70%;
  }
  
  .submit-button:hover {
    background-color: #9ca06b;
  }
  
  .successModal {
    background-color: rgb(255, 255, 255);
    border: none;
    box-shadow: none;
    border-radius: 10px;
    width: 300px;
  }
  </style>

