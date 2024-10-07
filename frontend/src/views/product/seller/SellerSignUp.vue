<template>
    <div class="register-form">
      <h2>회원 가입</h2>
      <hr class="divider" />
      <form @submit.prevent="sendAuthCode">
        <div class="form-group">
          <label for="name">이름</label>
          <input type="text" id="name" v-model="formData.name" placeholder="이름을 입력해주세요." />
        </div>
  
        <div class="form-group">
          <label for="email">이메일</label>
          <input type="email" id="email" v-model="formData.email" placeholder="이메일을 입력해주세요." />
        </div>
  
        <!-- 비밀번호 입력 폼 -->
        <div class="form-group">
          <label for="password">비밀번호</label>
          <input type="password" id="password" v-model="formData.password" placeholder="비밀번호를 입력해주세요." />
        </div>
  
        <div class="form-group">
          <label for="confirm-password">비밀번호 확인</label>
          <input type="password" id="confirm-password" v-model="formData.confirmPassword" placeholder="비밀번호를 다시 입력해주세요." />
        </div>
  
        <div class="form-group">
          <label for="phone">전화번호</label>
          <input type="text" id="phone" v-model="formData.phone" placeholder="전화번호를 입력해주세요." />
        </div>
  
        <div class="form-group">
          <label for="business-name">상호명</label>
          <input type="text" id="business-name" v-model="formData.businessName" placeholder="상호명을 입력해주세요." />
        </div>
  
        <div class="form-group">
          <label for="business-number">사업자번호</label>
          <input type="text" id="business-number" v-model="formData.businessNumber" placeholder="사업자번호를 입력해주세요." />
        </div>
  
        <div class="form-group">
          <label for="zipcode">우편번호</label>
          <input type="text" id="zipcode" v-model="formData.zipcode" placeholder="우편번호를 입력해주세요." />
          <input type="button" value="우편번호 찾기" @click="sample6_execDaumPostcode" />
        </div>
  
        <div class="form-group">
          <label for="address">주소</label>
          <input type="text" id="address" v-model="formData.address" placeholder="주소를 입력해주세요." />
        </div>
  
        <div class="form-group">
          <label for="detail-address">상세주소</label>
          <input type="text" id="detail-address" v-model="formData.addressDetail" placeholder="상세 주소를 입력해주세요." />
        </div>
  
        <!-- 이메일 인증하기 버튼 -->
        <button type="submit" class="submit-button">이메일 인증 하기</button>
      </form>
  
      <!-- 모달 창 -->
      <div v-if="isModalOpen" class="modal">
        <div class="modal-content">
          <h3>이메일 인증</h3>
  
          <!-- 인증번호 입력 필드 -->
          <div class="verification-code">
            <input type="text" id="verification-code" v-model="formData.verificationCode" placeholder="인증번호를 입력해주세요." />
          </div>
  
          <!-- 등록 및 취소 버튼 -->
          <div class="button-group">
            <button type="button" class="modal-button" @click="verifyAuthCode">등록</button>
            <button type="button" class="modal-button cancel-button" @click="closeModal">취소</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  /* global daum */
  
  import axios from 'axios';
  
  export default {
    data() {
      return {
        formData: {
          name: '',
          email: '',
          verificationCode: '',
          password: '',
          confirmPassword: '',
          phone: '',
          businessName: '',
          businessNumber: '',
          zipcode: '',
          address: '',
          addressDetail: ''
        },
        isVerified: false, // 이메일 인증 상태
        isModalOpen: false // 모달 창 열기 상태
      };
    },
    mounted() {
      const script = document.createElement('script');
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      document.head.appendChild(script);
    },
    methods: {
      // 이메일 인증번호 발송 후 모달 창 열기
      async sendAuthCode() {
        try {
          await axios.post(`${process.env.VUE_APP_API_BASE_URL}/product-service/seller/sign-up`, {
            email: this.formData.email,
            name: this.formData.name,
            password: this.formData.password,
            businessNumber: this.formData.businessNumber,
            businessName: this.formData.businessName,
            zipcode: this.formData.zipcode,
            address: this.formData.address,
            addressDetail: this.formData.addressDetail
          });
          alert("인증번호가 전송되었습니다.");
          this.openModal(); // 모달 창 열기
        } catch (error) {
          alert(error.response?.data?.message || "인증번호 전송에 실패했습니다.");
        }
      },
  
      openModal() {
        this.isModalOpen = true;
      },
      closeModal() {
        this.isModalOpen = false;
      },
  
      // 인증번호 확인 및 회원가입
      async verifyAuthCode() {
        try {
          await axios.post(`${process.env.VUE_APP_API_BASE_URL}/product-service/seller/sign-up/verified`, {
            email: this.formData.email,
            code: this.formData.verificationCode
          });
          alert("인증이 완료되었습니다.");
          this.closeModal(); // 모달 닫기
          window.location.href = '/member/sign-in';
        } catch (error) {
          alert(error.response?.data?.message || "인증번호가 올바르지 않습니다.");
        }
      },
  
      // Daum 주소 API 사용
      sample6_execDaumPostcode() {
        new daum.Postcode({
          oncomplete: (data) => {
            let addr = ''; // 주소 변수
            if (data.userSelectedType === 'R') {
              addr = data.roadAddress;
            } else {
              addr = data.jibunAddress;
            }
  
            // 우편번호와 주소 정보를 formData에 저장
            this.formData.zipcode = data.zonecode;
            this.formData.address = addr;
  
            // 상세 주소 필드로 포커스 이동
            document.getElementById("detail-address").focus();
          }
        }).open();
      }
    }
  };
  </script>
  
  <style scoped>
  /* 기존 스타일 */
  .register-form {
    width: 28%;
    margin: 50px auto;
    font-family: 'Noto Sans KR', sans-serif;
  }
  
  h2 {
    text-align: center;
    font-size: 22px;
    font-weight: bold;
    margin-bottom: 20px;
  }
  
  .divider {
    border: none;
    border-top: 1px solid #e0e0e0;
    margin-bottom: 20px;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 10px;
    font-size: 16px;
    font-weight: bold;
    color: #4a4a4a;
  }
  
  .form-group input {
    width: 100%;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    color: #4a4a4a;
  }
  
  .submit-button {
    width: 100%;
    padding: 15px;
    background-color: #BCC07B;
    color: black;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
  }
  
  .submit-button:hover {
    background-color: #a4b06f;
  }
  
  /* 모달 창 스타일 */
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
    padding: 20px;
    border-radius: 5px;
    text-align: center;
    width: 400px;
    font-family: 'Noto Sans KR', sans-serif;
  }
  
  h3 {
    font-size: 22px;
    font-weight: bold;
    margin-bottom: 30px;
  }
  
  .verification-code input {
    font-size: 14px;
    padding: 14px;
    width: 100%;
    border: none;
    background-color: #f0f0f0;
    border-radius: 10px;
    margin-bottom: 30px;
  }
  
  .send-auth-code-button {
    margin-bottom: 20px;
    background-color: #FFE2A6;
    color: black;
    border: none;
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 16px;
    cursor: pointer;
    font-weight: bold;
  }
  
  .send-auth-code-button:hover {
    background-color: #FFD48C;
  }
  
  .button-group {
    display: flex;
    justify-content: center;
    gap: 5px;
  }
  
  .modal-button {
    background-color: #BCC07B;
    border: none;
    padding: 10px 40px;
    border-radius: 20px;
    font-size: 16px;
    cursor: pointer;
    font-weight: bold;
  }
  
  .cancel-button {
    background-color: #E0E0E0;
  }
  
  .modal-button:hover {
    background-color: #a4b06f;
  }
  
  .cancel-button:hover {
    background-color: #CFCFCF;
  }
  </style>
  