<template>
    <div v-if="isModalOpen" class="modal">
      <div class="modal-content">
        <h3 class="modal-title">회원 탈퇴</h3>
        <p>비밀번호를 입력해 주세요.</p>
  
        <!-- 비밀번호 입력 -->
        <input 
          type="password" 
          v-model="password" 
          placeholder="비밀번호를 입력하세요." 
          class="form-input"
          @keydown.enter="submitWithdraw" 
        />
  
        <!-- 에러 메시지 표시 -->
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  
        <div class="button-group">
          <button @click="submitWithdraw" class="withdraw-button">탈퇴하기</button>
          <button @click="closeModal" class="close-button">취소</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    props: {
      isModalOpen: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        password: '', // 입력된 비밀번호
        errorMessage: '' // 에러 메시지
      };
    },
    methods: {
    closeModal() {
      this.$emit('close'); // 부모 컴포넌트로 모달 닫기 이벤트 전송
    },
    async submitWithdraw() {
      try {
        // 비밀번호 검증 및 탈퇴 요청 전송
        const response = await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/product-service/seller/withdraw`, {
          data: this.password
        });

        if (response.status === 200) {
          alert('회원 탈퇴가 완료되었습니다.');

          // 로컬 스토리지에서 sellerId 및 accessToken 삭제
          localStorage.removeItem('sellerId');
          localStorage.removeItem('accessToken');

          this.$emit('withdraw-success'); // 부모에게 탈퇴 성공 알림
          this.closeModal(); // 모달 닫기

          // 홈 페이지로 이동 (로그아웃 처리 후)
          window.location.href = '/';
        }
      } catch (error) {
        if (error.response?.status === 401) {
            this.errorMessage = '비밀번호가 일치하지 않습니다.';
        } else {
            this.errorMessage = error.response?.data?.message || '탈퇴 처리 중 오류가 발생했습니다.';
        }
      }
    }
}

  };
  </script>
  
  <style scoped>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .modal-content {
    background-color: white;
    padding: 40px;
    border-radius: 5px;
    width: 500px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
  
  .modal-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #333;
  }
  
  .form-input {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-sizing: border-box;
    margin-bottom: 20px;
  }

  .modal-title + p {
  margin-bottom: 20px; /* 문구와 입력 필드 사이의 간격 조정 */
}

  .error-message {
    color: red;
    margin-bottom: 10px;
  }
  
  .button-group {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    font-weight: bold;
  }
  
  .withdraw-button {
    background-color: #BCC07B;
    color: black;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    flex: 1;
    margin-right: 10px;
  }
  
  .close-button {
    background-color: #e0e0e0;
    color: black;
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    flex: 1;
  }
  
  .withdraw-button:hover {
    background-color: #a4b06f;
  }
  
  .close-button:hover {
    background-color: #CFCFCF;
  }
  </style>
  