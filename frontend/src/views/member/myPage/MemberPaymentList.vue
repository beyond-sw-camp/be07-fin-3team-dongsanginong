<template>
    <div class="member-page" style="padding-right: 300px;">
        <MemberSidebar />
        <div class="payment-list">
            <h2>결제 내역 조회</h2>
            <hr class="horizontal-divider" />
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>주문 상품</th>
                            <th>주문 농장</th>
                            <th>결제일</th>
                            <th>결제 수단</th>
                            <th>결제 금액</th>
                            <th>결제 영수증</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="payments === 0">
                            <td colspan="6">결제 내역이 없습니다.</td>
                        </tr>
                        <tr v-for="payment in payments" :key="payment.id">
                            <td>{{ payment.packageName }}</td>
                            <td>{{ payment.farmName }}</td>
                            <td>{{ formatDate(payment.orderAt) }}</td>
                            <td>{{ payment.paymentMethod }}</td>
                            <td>{{ formatPrice(payment.totalPrice) }}</td>
                            <td class="receipt-icon-cell">
                                <a :href="'/receipt/' + payment.receiptId" target="_blank" class="receipt-btn">
                                    <img src="https://cdn-icons-png.flaticon.com/512/201/201282.png" alt="영수증 아이콘" class="receipt-icon" />
                                </a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="pagination">
                <button @click="prevPage" :disabled="currentPage === 1">이전</button>
                <span>페이지 {{ currentPage }} / {{ totalPages }}</span>
                <button @click="nextPage" :disabled="currentPage === totalPages">다음</button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import MemberSidebar from '@/components/sidebar/MemberSidebar.vue';

export default {
    components: {
        MemberSidebar,
    },
    data() {
        return {
            payments: [],
            currentPage: 0,
            totalPages: 0,
            itemsPerPage: 8,
        };
    },
    mounted() {
        this.getPaymentList();
    },
    methods: {
        formatPrice(value) {
            if (value == null) {
                return "0원";
            }
            return parseInt(value).toLocaleString('ko-KR') + ' 원'; // 한국어 화폐 양식으로 변환
        },
        async getPaymentList(page = 1) {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/order-service/order/list`, {
                    params: {
                        page: page - 1, // API에서 페이지는 0부터 시작하므로 -1
                        size: this.itemsPerPage,
                    }
                });
                console.log(response.data);
                this.payments = response.data.content || []; // 페이지 내용
                this.totalPages = response.data.totalPages || 1; // 총 페이지 수
                this.currentPage = page; // 현재 페이지 업데이트
            } catch (error) {
                console.error("결제 리스트를 불러오는 중 오류가 발생했습니다.", error);
            }
        },
        formatDate(dateTime) {
            return dateTime.split('T')[0];
        },
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.getPaymentList(this.currentPage + 1);
            }
        },
        prevPage() {
            if (this.currentPage > 1) {
                this.getPaymentList(this.currentPage - 1);
            }
        },
    },
};
</script>

<style scoped>
.member-page {
    margin-left: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px;
    flex-direction: column;
}

h2 {
    margin-bottom: 10px;
}

.payment-list {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    padding: 40px;
    width: 1000px;
    min-height: 650px;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
}

.table-wrapper {
    flex: 1; 
    margin-bottom: 20px; 
}

table {
    width: 100%;
    table-layout: fixed; 
    border-collapse: separate;
    border-spacing: 0 20px;
}

th, td {
    overflow: hidden; 
    text-overflow: ellipsis; 
    white-space: nowrap;
    height: 50px;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    min-height: 50px;
}

.pagination button {
    padding: 10px 15px;
    background-color: #BCC07B;
    color: black;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin: 0 5px;
}

.pagination button:disabled {
    background-color: #ddd;
    cursor: not-allowed;
}

.pagination span {
    margin: 0 15px;
}

.receipt-icon {
    width: 24px;
    height: 24px;
}

tbody td {
    text-align: center;
    padding: 10px;
    border-bottom: 1px solid #ddd;
}

.receipt-icon-cell {
    text-align: center;
}

.horizontal-divider {
    width: 100%;
    border: none;
    border-top: 1px solid #ccc;
    margin: 20px 0 10px;
}
</style>
