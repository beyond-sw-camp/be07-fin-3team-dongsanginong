<template>
  <div v-if="isModalOpen" class="modal">
      <div class="modal-content">
          <h3 class="modal-title">{{ title }}</h3>
          <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input type="email" v-model="formData.email" placeholder="이메일을 입력해 주세요." class="form-input" />
          </div>
          <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input type="password" v-model="formData.password" placeholder="비밀번호를 입력해 주세요." class="form-input" @keydown.enter="onLogin" />
          </div>
          <div class="button-group">
              <button @click="onLogin" class="login-button">로그인</button>
              <button @click="closeModal" class="close-button">닫기</button>
          </div>
      </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  props: ["isModalOpen", "title"],
  data() {
      return {
          formData: {
              email: '',
              password: ''
          }
      };
  },
  methods: {
      closeModal() {
          this.$emit("close");
      },
      async onLogin() {
          try {
              const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/product-service/seller/sign-in`, this.formData);
              const token = response.data.accessToken;
              
              localStorage.setItem('accessToken', token);
              localStorage.setItem('sellerId', response.data.sellerId)
              localStorage.setItem('role', response.data.role)
  
              this.$emit("login", this.formData);   
              this.closeModal();

              window.location.href = '/';
          } catch (error) {
              alert(error.response?.data?.message || "로그인에 실패했습니다.");
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
  padding: 30px;
  border-radius: 5px;
  width: 450px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 16px;
  color: #555;
  margin-bottom: 8px;
  text-align: left;
}

.form-input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  font-weight: bold;
}

.login-button {
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

.login-button:hover {
    background-color: #a4b06f;
  }
  
  .close-button:hover {
    background-color: #CFCFCF;
  }
</style>
