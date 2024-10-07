<template>
  <div>
    <v-btn @click="dialog = true" class="custom-create-button">공지 생성</v-btn> <!-- 버튼 클릭 시 모달 열림 -->

    <!-- 모달 -->
    <v-dialog v-model="dialog" max-width="600" class="custom-dialog">
      <v-card class="custom-card">
        <v-card-title class="custom-title">
          <span class="headline">커뮤니티</span>
        </v-card-title>
        <v-card-text>
          <form @submit.prevent="createNotice">
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
              <!-- 파일 업로드 -->
              <input 
                type="file" 
                @change="handleFileSelection" 
                class="custom-input" 
                ref="fileInput" 
                multiple /> <!-- 다중 파일 업로드 -->
            </div>
            <!-- 선택된 파일들 표시 -->
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
            @click="createNotice"
          >
            등록
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

    <!-- 완료 메시지 모달 -->
    <v-dialog v-model="alertModal" max-width="260px">
      <v-card class="modal" style="padding: 10px; padding-right: 20px; text-align: center;">
        <v-card-text>{{ alertMessage }}</v-card-text>
        <v-btn @click="alertModal = false;" class="submit-btn">close</v-btn>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      notice: {
        title: '',
        content: '',
        imageUrls: [] // 여러 이미지 URL을 담기 위한 배열
      },
      dialog: false, // 공지사항 생성 모달 상태
      selectedFiles: [], // 선택된 파일을 저장하기 위한 배열
      filePreviews: [], // 파일 미리보기 URL을 저장하기 위한 배열
      alertModal: false, // 완료 메시지 모달 상태
      alertMessage: '' // 모달에 표시될 메시지
    };
  },
  methods: {
    // 파일 선택 시 호출되는 메서드
    handleFileSelection(event) {
      const files = Array.from(event.target.files); // 여러 파일을 배열로 저장
      files.forEach(file => {
        this.selectedFiles.push(file); // 선택된 파일을 배열에 추가
        const previewUrl = URL.createObjectURL(file); // 미리보기 URL 생성
        this.filePreviews.push({ url: previewUrl, file }); // 미리보기 배열에 URL과 파일 추가
      });
      this.$refs.fileInput.value = null; // 파일 입력 필드 초기화
    },
    
    // 선택한 파일을 배열에서 삭제하는 메서드
    removeFile(index) {
      this.selectedFiles.splice(index, 1); // 해당 인덱스의 파일을 배열에서 삭제
      this.filePreviews.splice(index, 1); // 해당 인덱스의 미리보기 URL도 삭제
    },

    // 선택한 여러 파일을 S3에 업로드하는 메서드
    async uploadFiles() {
      const uploadedImageUrls = []; // 업로드된 이미지 URL을 저장할 배열

      for (let file of this.selectedFiles) {
        const imageUrl = await this.uploadImage(file); // 파일을 S3에 업로드 후 URL 반환
        uploadedImageUrls.push(imageUrl); // URL을 배열에 저장
      }

      this.notice.imageUrls = uploadedImageUrls; // 업로드된 이미지 URL 배열을 notice에 저장
    },

    // 패키지 등록과 동일한 방식으로 이미지 업로드
    async uploadImage(blob) {
      const accessToken = localStorage.getItem('accessToken');
      const body = {
        prefix: "notice",
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

      // S3로 이미지 업로드
      const options = {
        method: "PUT",
        headers: {
          "Content-Type": blob.type,
        },
        body: blob,
      };
      await fetch(awsUrl.data + awsUrl.auth, options);

      return awsUrl.data; // 업로드된 이미지 URL 반환
    },

    // 공지사항 생성 메서드
    async createNotice() {
      // 값 검증: title과 content가 비어 있는지 확인
      if (!this.notice.title || !this.notice.content) {
        this.alertMessage = '제목과 내용을 입력하세요.';
        this.alertModal = true;
        return;
      }

      // 파일 업로드 진행
      await this.uploadFiles();

      const requestData = {
        title: this.notice.title,
        content: this.notice.content,
        imageUrls: this.notice.imageUrls // 여러 이미지 URL 배열을 전송
      };

      const accessToken = localStorage.getItem('accessToken');

      try {
        await fetch(`${process.env.VUE_APP_API_BASE_URL}/product-service/farm/notice/create`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });

        this.alertMessage = '공지사항이 성공적으로 생성되었습니다.';
        this.alertModal = true;
      } catch (error) {
        console.error('공지사항 생성 실패:', error);
        this.alertMessage = '공지사항 생성에 실패했습니다.';
        this.alertModal = true;
      } finally {
        this.dialog = false; // 공지사항 생성 모달 닫기
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

.custom-create-button {
  background-color: #BCC07B;
  color: black;
  margin-left: 650px;
  border-radius: 30px;
  padding: 10px 40px;
  font-size: 15px;
  font-weight: bold;
  line-height: 1.5;
}
</style>
