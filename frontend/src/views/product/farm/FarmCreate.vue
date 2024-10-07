<template>
  <div class="farm-create-page">
    <h2 class="title">농장 정보 입력</h2>

    <!-- 배너 이미지 업로드 -->
    <div class="image-upload banner-upload">
      <img :src="bannerImageUrl || defaultBanner" alt="배너 이미지" class="banner-image" @click="triggerBannerUpload" />
      <input type="file" @change="onBannerImageUpload" class="image-input" ref="bannerInput" />

      <!-- 배너 이미지 위에 + 모양 버튼 추가 -->
      <div class="upload-button banner-upload-button" @click="triggerBannerUpload">+</div>

      <!-- 프로필 이미지 업로드: 배너 이미지 위에 겹치도록 변경 -->
      <div class="profile-upload-wrapper">
        <img :src="profileImageUrl" class="profile-image" @click="triggerProfileUpload" />
        <input type="file" @change="onProfileImageUpload" class="image-input" ref="profileInput" />

        <!-- 프로필 이미지 위에 + 모양 버튼 추가 -->
        <div class="upload-button profile-upload-button" @click="triggerProfileUpload">+</div>
      </div>
    </div><br>

    <input type="text" v-model="farmName" placeholder="농장 이름을 입력해주세요." class="farm-name-input" /><br>

    <!-- 선택한 카테고리 공간 -->
    <div class="selected-category-space">
      <h4 class="left-align">선택된 카테고리</h4><br />
      <div v-show="true" class="selected-categories">
        <span v-for="categoryId in selectedCategories" :key="categoryId" class="category-chip">
          {{ getCategoryName(categoryId) }}
          <button @click="removeCategory(categoryId)">
            <span style="font-size: 12px;">X</span></button>
        </span>
      </div>
    </div>
    <br />

    <!-- 농장 카테고리 선택 -->
    <div class="category-selection">
      <h4 class="left-align">농장 카테고리 선택</h4><br />
      <div class="category-list">
        <button v-for="category in categories" :key="category.id"
                @click="selectCategory(category.id)"
                class="category-button"
                :class="{selected: selectedCategories.includes(category.id)}">
          {{ category.title }}
        </button>
      </div>
    </div>
    <br />

    <!-- 농장 설명 -->
    <div class="farm-intro">
      <h4 class="left-align">농장 설명을 적어주세요.</h4><br />
      <textarea v-model="farmIntro" class="intro-textarea"></textarea>
    </div>

    <!-- 제출 버튼 -->
    <button @click="submitFarm" class="submit-button">저장</button>
  </div>

  <v-dialog v-model="alertModal" max-width="260px">
            <v-card class="modal" style="padding: 10px; padding-right: 20px; text-align: center;">
                <v-card-text>완료되었습니다.</v-card-text>
                <v-btn @click="closeModalAndRedirect" class="submit-btn">close</v-btn>
            </v-card>
        </v-dialog>

</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      farmName: '',
      farmIntro: '',
      bannerImageUrl: '', // 업로드된 배너 이미지 URL
      profileImageUrl: '', // 업로드된 프로필 이미지 URL
      projectImageFile: null, // 업로드할 이미지 파일
      categories: [], // 카테고리 목록
      selectedCategories: [], // 선택한 카테고리
      defaultBanner: '/baseBannerImage.png', // 기본 배너 이미지
      defaultProfile: '', // 기본 프로필 이미지
      alertModal: false,
    };
  },
  created() {
    // 카테고리 목록 불러오기 (API 요청)
    this.loadCategories();
  },
  methods: {
    async uploadImage(blob) {
      const accessToken = localStorage.getItem('accessToken');
      const body = {
        prefix: "Farm",
        url: `${blob?.name}`,
      };
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      };
      const getUrl = await fetch(`${process.env.VUE_APP_API_BASE_URL}/product-service/api/upload/presigned-url`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      });

      const urlContentType = getUrl.headers.get("content-type");
      let getUrlResult;
      if (urlContentType && urlContentType.includes("application/json")) {
        getUrlResult = await getUrl.json(); // JSON으로 파싱
      } else {
        getUrlResult = await getUrl.text(); // 텍스트로 파싱
      }

      const awsUrl = {
        data: `${getUrlResult.split("?")[0]}`,
        auth: `?${getUrlResult.split("?")[1]}`,
      };

      // 파일을 S3에 업로드
      const options = {
        method: "PUT", // PUT 메서드 사용
        headers: {
          "Content-Type": blob.type, // Blob의 MIME 타입 설정
        },
        body: blob, // 업로드할 파일 데이터
      };
      await fetch(awsUrl.data + awsUrl.auth, options);

      return awsUrl.data;
    },

    async onBannerImageUpload(event) {
      this.projectImageFile = event?.target?.files[0];
      this.bannerImageUrl = await this.uploadImage(this.projectImageFile);
    },

    async onProfileImageUpload(event) {
      this.projectImageFile = event?.target?.files[0];
      this.profileImageUrl = await this.uploadImage(this.projectImageFile);
    },

    triggerProfileUpload() {
      this.$refs.profileInput.click();
    },

    triggerBannerUpload() {
      this.$refs.bannerInput.click();
    },

    async loadCategories() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/product-service/farm/categories`); // 카테고리 API
        this.categories = response.data;
      } catch (error) {
        console.error('카테고리 불러오기 실패:', error);
      }
    },

    selectCategory(categoryId) {
      if (!this.selectedCategories.includes(categoryId)) {
        this.selectedCategories.push(categoryId);
      }
    },

    removeCategory(categoryId) {
      this.selectedCategories = this.selectedCategories.filter(id => id !== categoryId);
    },

    getCategoryName(categoryId) {
      const category = this.categories.find(cat => cat.id === categoryId);
      return category ? category.title : '';
    },

    closeModalAndRedirect() {
      this.alertModal = false; // 모달을 닫기
      this.$router.push('/'); // 페이지 이동
    },

    async submitFarm() {
      try {
        const farmData = {
          farmName: this.farmName,
          farmIntro: this.farmIntro,
          bannerImageUrl: this.bannerImageUrl, // 업로드된 배너 이미지 URL
          profileImageUrl: this.profileImageUrl, // 업로드된 프로필 이미지 URL
          categories: this.selectedCategories,
        };

        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/product-service/farm/create`, farmData);
        this.alertModal = true; // 모달을 표시
      } catch (error) {
        console.error('농장 생성 실패:', error);
        alert(error.response?.data?.message || "농장 생성 중 문제가 발생했습니다.");
      }
    }
  }
};
</script>

<style scoped>
.farm-create-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.image-upload {
  margin-bottom: 20px;
  text-align: center;
  position: relative; /* 배너 위에 프로필을 겹치기 위해 상대 위치 지정 */
}

.banner-upload img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  position: relative;
  border: 1px solid #ccc;
}

.profile-upload-wrapper {
  position: absolute;
  bottom: -70px;
  left: 10%;
  transform: translateX(-50%); /* 가로 중앙 정렬 */
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #5f5f5f; /* 배경색 */
  border: 1px solid #ccc;
}

.profile-upload-wrapper img {
  background-color: #5f5f5f;
  width: 110%;
  height: 110%;
  object-fit: cover;
}

.image-input {
  display: none;
}

/* + 모양 버튼 스타일 */
.upload-button {
  position: absolute;
  width: 30px;
  height: 30px;
  background-color: lightgray;
  color: white;
  font-size: 24px;
  text-align: center;
  border-radius: 50%;
  cursor: pointer;
  line-height: 30px;
}

.banner-upload-button {
  top: 120px;
  right: 370px;
}

.profile-upload-button {
  bottom: 43px;
  right: 44px;
}


.farm-name-input {
  width: calc(100% - 150px); /* 프로필 이미지와 수평을 맞추기 위해 너비를 조정 */
  padding: 10px;
  font-size: 16px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-left: 152px; /* 프로필 이미지 크기에 맞게 왼쪽으로 마진을 설정 */
  position: relative; /* 상대 위치 설정 */
  top: -30px; /* 위로 이동 */
}

.selected-category-space {
  margin-bottom: 20px;
  text-align: center;
}

.selected-categories {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 10px;
  background-color: #f0f0f0;  
  border-radius: 8px;
  border: 1px solid #ccc;
  min-height: 70px; /* 초기 높이를 설정합니다 */
  overflow: visible; /* 스크롤이 생기지 않게 설정합니다 */
}

.category-chip {
  background-color: #BCC07B;
  padding: 5px 10px;
  border-radius: 20px;
  margin-right: 10px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between; /* 양쪽에 텍스트와 버튼을 배치 */
  color: white;
}

.category-chip button {
  margin-left: 8px;
  background-color: #FFE2A6;
  border: none;
  border-radius: 50%;
  color: black;
  width: 20px;
  height: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center; /* X 버튼을 중앙에 위치 */
}

.category-selection {
  margin-bottom: 20px;
  text-align: center;
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.category-button {
  margin-right: 10px;
  margin-bottom: 10px;
  background-color: #e0e0e0;
  padding: 5px 10px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.category-button.selected {
  background-color: #BCC07B;
  color: black;
}

.farm-intro {
  margin-bottom: 20px;
  text-align: center;
}

.intro-textarea {
  width: 100%;
  height: 200px;
  padding: 10px;
  font-size: 16px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.submit-button {
  background-color: #bcc07b;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
}

.profile-image {
  top: -2%;
  right: 2%;
}

.left-align {
  text-align: left;
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
