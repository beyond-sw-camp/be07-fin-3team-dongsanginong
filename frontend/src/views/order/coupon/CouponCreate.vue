<template>
  <v-dialog :model-value="dialog" persistent max-width="600px" @update:model-value="updateDialog">
    <v-card class="custom-card">
      <v-card-title class="custom-title">
        <span class="headline">쿠폰 생성</span>
      </v-card-title>
      <v-card-text>
        <div class="coupon-form no-border">
          <!-- 쿠폰 이름 입력 -->
          <div class="form-group">
            <label for="couponName" class="form-label">쿠폰 이름</label>
            <input
              type="text"
              id="couponName"
              v-model="coupon.couponName"
              class="input-field full-width-input"
              required
            />
          </div>

          <!-- 할인율 입력 -->
          <div class="form-group">
            <label for="discountPercentage" class="form-label">할인율</label>
            <div class="discount-input">
              <input
                type="number"
                id="discountPercentage"
                v-model="coupon.discountPercentage"
                class="input-field short-input"
                required
              />
              <span class="percent-sign">%</span>
            </div>
          </div>

          <!-- 쿠폰 소멸 일자 선택 -->
          <div class="form-group">
            <label for="expiration" class="form-label">쿠폰 소멸 일자</label>
            <div class="expiration-input">
              <input
                type="text"
                id="expiration"
                v-model="formattedExpiration"
                class="input-field full-width-input"
                readonly
              />
              <v-icon class="calendar-icon" @click="datePickerDialog = true">mdi-calendar</v-icon>
            </div>
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="action-buttons">
        <v-btn class="custom-button" @click="validateAndCreateCoupon">등록</v-btn>
        <v-btn class="custom-cancel-button" @click="updateDialog(false)">닫기</v-btn>
      </v-card-actions>
    </v-card>

    <!-- 날짜 선택 모달 -->
    <v-dialog v-model="datePickerDialog" persistent max-width="330px">
      <v-card>
        <v-card-title class="headline">날짜 선택</v-card-title>
        <v-date-picker v-model="selectedDate" @update:model-value="openTimePicker" />
      </v-card>
    </v-dialog>

    <!-- 시간 선택 모달 -->
    <v-dialog v-model="timePickerDialog" max-width="350px">
      <v-card>
        <v-card-title class="headline">시간 선택</v-card-title>
        <div class="form-group time-input">
          <div class="time-picker-container">
            <input
              type="time"
              id="time"
              v-model="selectedTime"
              class="input-field short-time-input centered-input"
            />
          </div>
        </div>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text class="custom-button" @click="setDateTime">확인</v-btn>
          <v-btn text class="custom-cancel-button" @click="timePickerDialog = false">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 알림 모달 -->
    <v-dialog v-model="alertDialog" max-width="400px">
      <v-card class="modal" style="padding: 10px; padding-right: 20px; text-align: center;">
        <v-card-text>{{ alertMessage }}</v-card-text>
        <v-btn @click="alertDialog = false;" class="submit-btn">close</v-btn>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script>
import axios from 'axios';

export default {
  props: {
    dialog: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      coupon: {
        couponName: '',
        discountPercentage: 0,
        expirationDate: '', // YYYY-MM-DD 형식
        expirationTime: '', // HH:mm 형식
      },
      selectedDate: null, // 선택된 날짜
      selectedTime: '12:00', // 선택된 시간
      formattedExpiration: '', // 화면에 표시할 날짜 및 시간 형식
      datePickerDialog: false, // 날짜 선택 모달 상태
      timePickerDialog: false, // 시간 선택 모달 상태
      alertDialog: false, // 알림 모달 상태
      alertMessage: '', // 알림 메시지
    };
  },
  methods: {
    resetFormData() {
      this.coupon = {
        couponName: '',
        discountPercentage: 0,
        expirationDate: '',
        expirationTime: '',
      };
      this.selectedDate = null;
      this.selectedTime = '12:00';
      this.formattedExpiration = '';
    },
    updateDialog(value) {
      if (!value) {
        this.resetFormData();
      }
      this.$emit('update:dialog', value);
    },
    openTimePicker() {
      if (this.selectedDate) {
        this.timePickerDialog = true;
      }
    },
    setDateTime() {
      if (this.selectedDate && this.selectedTime) {
        const year = this.selectedDate.getFullYear();
        const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(this.selectedDate.getDate()).padStart(2, '0');
        
        const formattedDate = `${year}-${month}-${day}`;
        
        this.coupon.expirationDate = formattedDate;
        this.coupon.expirationTime = this.selectedTime;
        this.formattedExpiration = `${formattedDate} ${this.selectedTime}`;
        
        this.datePickerDialog = false;
        this.timePickerDialog = false;
      }
    },
    showAlert(message) {
      this.alertMessage = message;
      this.alertDialog = true;
    },
    validateAndCreateCoupon() {
      if (!this.coupon.couponName) {
        this.showAlert('쿠폰 이름을 입력하세요.');
        return;
      }

      if (this.coupon.discountPercentage <= 0) {
        this.showAlert('할인율은 1% 이상이어야 합니다.');
        return;
      }

      if (!this.coupon.expirationDate || !this.coupon.expirationTime) {
        this.showAlert('쿠폰 소멸 일자를 선택하세요.');
        return;
      }

      this.createCoupon();
    },
    async createCoupon() {
      const requestData = {
        couponName: this.coupon.couponName,
        discountPercentage: this.coupon.discountPercentage,
        expirationDate: this.coupon.expirationDate,
        expirationTime: this.coupon.expirationTime,
      };

      const token = localStorage.getItem('Bearer Token');
      const sellerId = localStorage.getItem('sellerId');

      try {
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/order-service/coupons/create`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              sellerId: sellerId,
            },
          }
        );
        this.showAlert('쿠폰이 성공적으로 생성되었습니다.');
      } catch (error) {
        console.error('쿠폰 생성 실패:', error.response?.data || error.message);
        this.showAlert('쿠폰 생성에 실패했습니다.');
      }
    },
  },
};
</script>

<style scoped>
.coupon-form-container {
  padding: 50px;
  background-color: white;
}

.custom-card {
  border-radius: 30px;
  padding: 20px;
}

.custom-title {
  background-color: #BCC07B;
  border-radius: 30px;
  text-align: center;
  width: calc(97% - 30px);
  margin: 0 auto;
  padding: 10px;
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.input-field {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
}

.full-width-input {
  width: 100%;
}

.short-input {
  width: 80px;
}

.short-time-input {
  width: 70%;
}

.centered-input {
  margin: 0 auto;
}

.time-picker-container {
  display: flex;
  justify-content: center;
}

.discount-input {
  display: flex;
  align-items: center;
}

.percent-sign {
  font-size: 18px;
  margin-left: 10px;
}

.expiration-input {
  display: flex;
  align-items: center;
}

.expiration-input .mdi-calendar {
  margin-left: 10px;
  font-size: 24px;
  color: #333;
  cursor: pointer;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.custom-button {
  background-color: #BCC07B;
  color: black;
  border-radius: 30px;
  padding: 10px 40px;
  font-size: 15px;
  font-weight: bold;
  line-height: 1.5;
}

.custom-cancel-button {
  background-color: #e0e0e0;
  color: black;
  border-radius: 30px;
  padding: 10px 40px;
  font-size: 15px;
  font-weight: bold;
  line-height: 1.5;
}

.modal {
  background-color: rgb(255, 255, 255);
  border: none;
  box-shadow: none;
  border-radius: 10px;
}

.submit-btn {
  margin-left: 100px;
  margin-top: 20px;
  background-color: #BCC07B;
  color: black;
  border-radius: 50px;
  width: 50%; /* 가로 크기를 절반으로 줄임 */
}
</style>
