<template>
  <v-dialog v-model="dialog" max-width="600" class="custom-dialog">
    <v-card class="custom-card">
      <v-card-title class="custom-title">
        <span class="headline">커뮤니티 수정</span>
      </v-card-title>
      <v-card-text>
        <form @submit.prevent="updateNotice">
          <div>
            <input 
              type="text" 
              v-model="notice.title" 
              id="title" 
              placeholder="제목을 입력하세요" 
              required 
              class="custom-input" />
          </div>
          <div>
            <textarea 
              v-model="notice.content" 
              id="content" 
              placeholder="내용을 입력하세요" 
              required 
              class="custom-input"></textarea>
          </div>
          <div>
            <input 
              type="file" 
              @change="handleFileSelection" 
              class="custom-input" 
              ref="fileInput" 
              multiple />
          </div>
          <div v-if="filePreviews.length">
            <h3>선택된 파일:</h3>
            <ul class="preview-list">
              <li v-for="(preview, index) in filePreviews" :key="index" class="preview-container">
                <div class="image-wrapper">
                  <img :src="preview.url" class="preview-image" alt="선택된 이미지" />
                  <v-btn icon @click="removeFile(index)" class="remove-btn">
                    <v-icon color="#BCC07B">mdi-close-circle</v-icon>
                  </v-btn>
                </div>
              </li>
            </ul>
          </div>
        </form>
      </v-card-text>
      <v-card-actions class="action-buttons">
        <v-spacer />
        <v-btn 
          color="light_green" 
          class="custom-button"
          @click="updateNotice"
        >
          수정
        </v-btn>
        <v-btn 
          color="light_green" 
          class="custom-button" 
          text 
          @click="dialog = false"
        >
          닫기
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    noticeId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      notice: {
        title: '',
        content: '',
        imageUrls: []
      },
      dialog: false,
      selectedFiles: [],
      filePreviews: [],
    };
  },
  methods: {
    getFarmIdFromToken() {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.farmId; // 토큰에서 farmId 추출
      }
      return null;
    },
    async openEditDialog() {
      this.dialog = true;
      try {
        const token = localStorage.getItem('accessToken');
        const farmId = this.getFarmIdFromToken(); // 동적으로 farmId 가져오기
        const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/product-service/farm/no-auth/${farmId}/notice/${this.noticeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        this.notice.title = data.title;
        this.notice.content = data.content;
        this.notice.imageUrls = data.noticeImages || [];
        this.filePreviews = this.notice.imageUrls.map(url => ({ url }));
      } catch (error) {
        console.error('Error fetching notice data:', error);
      }
    },
    handleFileSelection(event) {
      const files = Array.from(event.target.files);
      files.forEach(file => {
        this.selectedFiles.push(file);
        const previewUrl = URL.createObjectURL(file);
        this.filePreviews.push({ url: previewUrl, file });
      });
      this.$refs.fileInput.value = null;
    },
    removeFile(index) {
      this.selectedFiles.splice(index, 1);
      this.filePreviews.splice(index, 1);
    },
    async uploadFiles() {
      const uploadedImageUrls = [];
      for (let file of this.selectedFiles) {
        const imageUrl = await this.uploadImage(file);
        uploadedImageUrls.push(imageUrl);
      }
      this.notice.imageUrls = [...this.notice.imageUrls, ...uploadedImageUrls];
    },
    async uploadImage(blob) {
      const accessToken = localStorage.getItem('accessToken');
      const body = {
        prefix: "community-notice",
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

      const getUrlResult = await getUrl.text();
      const awsUrl = {
        data: `${getUrlResult.split("?")[0]}`,
        auth: `?${getUrlResult.split("?")[1]}`,
      };

      const options = {
        method: "PUT",
        headers: {
          "Content-Type": blob.type,
        },
        body: blob,
      };
      await fetch(awsUrl.data + awsUrl.auth, options);

      return awsUrl.data;
    },
    async updateNotice() {
      await this.uploadFiles();
      const requestData = {
        title: this.notice.title,
        content: this.notice.content,
        imageUrls: this.notice.imageUrls,
      };
      const accessToken = localStorage.getItem('accessToken');
      try {
        await fetch(`${process.env.VUE_APP_API_BASE_URL}/product-service/farm/notice/${this.noticeId}/update`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });
        this.$emit('notice-updated');
        this.dialog = false;
      } catch (error) {
        console.error('공지사항 수정 실패:', error);
      }
    },
  },
};
</script>

<style scoped>
/* form 스타일 */
form {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

button {
  margin-top: 1em;
}

.custom-input {
  width: 100%;
  padding: 0.5em;
  border: 1px solid #ccc; /* 테두리 추가 */
  border-radius: 4px; /* 모서리 둥글게 */
  box-sizing: border-box;
  font-size: 1em;
}

textarea.custom-input {
  resize: vertical; /* 텍스트 영역 크기 조정 가능 */
  min-height: 300px; /* 텍스트 영역 최소 높이 설정 */
}

/* 선택된 파일 목록 */
.preview-list {
  display: flex; /* 가로로 나열 */
  gap: 10px; /* 각 이미지 사이 간격 */
  list-style-type: none; /* 리스트 기본 스타일 제거 */
  padding: 0;
  margin-bottom: 10px; /* 파일 목록과 버튼 간 간격 좁힘 */
}

.preview-container {
  position: relative; /* 이미지에 상대적인 위치로 버튼 배치 */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
}

.preview-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: black; /* 버튼 배경색 수정 */
  border-radius: 50%;
  width: 20px;
  height: 20px;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 모달 커스텀 스타일 */
.custom-dialog {
  padding: 20px; /* 모달 내부 패딩 */
}

.custom-card {
  border-radius: 30px; /* 모달 테두리 둥글기 더 둥글게 수정 */
  padding: 20px; /* 모달 내부 패딩 */
}

.custom-title {
  background-color: #BCC07B;
  border-radius: 30px; /* 상단과 하단 모두 둥글게 */
  text-align: center;
  width: calc(97% - 30px); /* 좌우 여백 맞추기 */
  margin: 0 auto; /* 가운데 정렬 */
  padding: 10px;
}

.action-buttons {
  margin-bottom: 10px; /* 버튼들 아래쪽 여백을 줄임 */
  gap: 5px; /* 버튼 간격을 좁게 조정 */
}

.custom-button {
  color: black !important; /* 텍스트 색상 검정으로 설정 */
  transition: background-color 0.3s ease; /* 배경색 변경 시 부드럽게 전환 */
  border-radius: 50px; /* 모서리 둥글기 50px로 설정 */
}

.custom-button:hover {
  background-color: #BCC07B; /* 마우스 호버 시 배경색 변경 */
}

/* 완료 메시지 모달 */
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

