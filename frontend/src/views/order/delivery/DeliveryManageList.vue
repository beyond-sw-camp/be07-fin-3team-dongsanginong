<template>
    <!-- 사이드바 자리 -->
    <SellerSidebar />

    <v-container fluid>
        <h3 style="padding: 10px; padding-left: 70px;">주문 및 배송 관리</h3>
        <v-col class="delivery-first-col">
            <h4>다가오는 배송</h4>
            <v-card class="delivery-card elevation-0" outlined>
                <v-table class="table-header">
                    <thead>
                        <tr>
                        <th class="table-header">주문자 이름</th>
                        <th class="table-header">패키지 명</th>
                        <th class="table-header">날짜</th>
                        <th class="table-header">운송장 번호 등록</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="delivery in responseBefore" :key="delivery.id">
                        <td>{{ delivery.memberName }}</td>
                        <td>{{ delivery.packageProductName }}</td>
                        <td>{{ delivery.deliveryDueDate }}</td>
                        <td>
                            <v-btn class="billing-btn"
                                @click="openBillingDialog(delivery.id)">
                                <v-icon>mdi-plus</v-icon>
                            </v-btn>
                        </td>
                        </tr>
                    </tbody>
                </v-table>
                <!-- 페이징 처리 -->
                <v-pagination
                        v-model="currentPage"
                        :length="pageCount"
                    ></v-pagination>
            </v-card>
        </v-col>

        <!-- 운송장 번호 -->
        <v-dialog v-model="dialog" max-width="500px">
            <v-card class="billingModal">
                <v-card-title class="card-title">운송장 번호 등록</v-card-title>
                <v-card-text>
                    <v-text-field
                        v-model="billingNumber"
                        label="운송장 번호"
                        outlined
                    ></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn class="modal-btn" text @click="cancelDialog">취소</v-btn>
                    <v-btn class="modal-btn" text @click="submitBillingNumber">등록</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-col class="delivery-second-col">
            <h4>처리된 배송</h4>
            <v-card class="delivery-card elevation-0" outlined>
                <v-table class="table-header">
                    <thead>
                        <tr>
                            <th class="table-header">주문자 이름</th>
                            <th class="table-header">패키지 명</th>
                            <th class="table-header">날짜</th>
                            <th class="table-header">운송장 번호 등록</th>
                            <th class="table-header">배송 상태</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="delivery in responseProcessed" :key="delivery.id">
                            <td>{{ delivery.memberName }}</td>
                            <td>{{ delivery.packageProductName }}</td>
                            <td>{{ delivery.formattedDate }}</td>
                            <td>{{ delivery.billingNumber }}</td>
                            <td><span style="background-color: #FFE2A6; padding:2px;">{{ delivery.deliveryStatus }}</span></td>
                        </tr>
                    </tbody>
                </v-table>
                <!-- 페이징 처리 -->
                <v-pagination
                    v-model="processedCurrentPage"
                    :length="processedPageCount"
                ></v-pagination>
            </v-card>
        </v-col>
    </v-container>
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
            // 다가오는 배송 
            currentPage: 1, // 페이지 1번부터 시작 
            pageSize: 5, // 한 페이지에 15개씩 출력 
            totalItems: 0,  
            responseBefore: [],

            // 처리된 배송
            processedCurrentPage: 1, // 처리된 배송의 페이지
            processedPageSize: 5, // 처리된 배송의 페이지 당 항목 수
            processedTotalItems: 0, // 처리된 배송의 총 항목 수
            responseProcessed: [], // 처리된 배송의 데이터

            dialog: false,
            billingNumber: '',
            selectedDeliveryId: null,
        }
    },
    computed: {
        pageCount() {
            return Math.ceil(this.totalItems / this.pageSize);
        },
        // 처리된 배송의 페이지 수
        processedPageCount() {
            return Math.ceil(this.processedTotalItems / this.processedPageSize);
        }
    },
    watch: {
        currentPage(newPage) {
            this.upcomingDelivery(newPage);
        },
        processedCurrentPage(newPage) {
            this.processedDelivery(newPage);
        }
    },
    created() {
        this.upcomingDelivery(this.currentPage)
        this.processedDelivery(this.processedCurrentPage);
    },
    methods: {
        async upcomingDelivery(page) {
            try {

                    const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/order-service/delivery/upcoming/list`, {
                            params: {
                                page: page - 1,
                                size: this.pageSize  
                            }
                        });
                    this.responseBefore = response.data.content;
                    this.totalItems = response.data.totalElements;
            } catch (e) {
                console.log(e.message);
            }
        },
        async processedDelivery(page) {
            try {

                // 처리된 배송 데이터 요청
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/order-service/delivery/completed/list`, {
                    params: {
                        page: page - 1, // 0-based pagination
                        size: this.processedPageSize
                    },
                });

                // 처리된 배송의 데이터 및 총 항목 수 업데이트
                this.responseProcessed = response.data.content;
                this.responseProcessed = response.data.content.map(delivery => {
                    const [date, time] = delivery.deliveryAt.split('T');
                    return {
                        ...delivery,
                        formattedDate: `${date} ${time.split('.')[0]}`
                    };
                });
                this.processedTotalItems = response.data.totalElements;
            } catch (e) {
                console.log(e.message);
            }
        },
        openBillingDialog(id) {
            this.selectedDeliveryId = id;
            this.dialog = true;
        },
        async submitBillingNumber() {
            if (!this.billingNumber) {
                alert('운송장 번호를 입력해주세요.');
                return;
            }
            try {

                const data = {
                    billingNumber: this.billingNumber
                };
                await axios.patch(`${process.env.VUE_APP_API_BASE_URL}/order-service/delivery/createBillingNumber/${this.selectedDeliveryId}`, data);

                this.dialog = false;
                this.billingNumber = '';
                this.selectedDeliveryId = null;

                this.processedDelivery(this.processedCurrentPage);
                window.location.reload();
            } catch (e) {
                console.error('Error submitting billing number:', e);
            }
        },
        cancelDialog() {
            this.dialog = false;
        }
    }
}
</script>

<style scoped>
.delivery-first-col {
    padding: 10px;
    padding-left: 70px;
}
.delivery-second-col {
    padding: 10px;
    padding-left: 70px;
}
.delivery-card {
    margin-top: 20px;
    width: 900px;
    height: 380px;
    border: 1px solid #d4d4d4;
    border-radius: 10px;

    padding-right: 30px;
    padding-left: 30px;
}
.table-header {
    text-align: center !important;
    font-size: 14px;
    background-color: none;
    border-bottom: 1px solid #d4d4d4;
}
.billing-btn {
    background-color: #BCC07B; 
    border-radius: 50px;
}
.modal-btn {
  color: black !important;
  transition: background-color 0.3s ease;
  border-radius: 50px;
}
.modal-btn:hover {
  background-color: #BCC07B; 
}
.billingModal {
    padding :15px;
    padding-top: 20px;
}
.card-title {
    text-align: center;
    background-color: #BCC07B;
    border-radius: 50px;
    width: 90%;
    margin: 0 auto;
    padding-bottom: 10px;
}

.search-bar {
    max-width: 600px;
  }
  
  .sort-select {
    width: 120px;
    margin-right: 8px;
  }
</style>