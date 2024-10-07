<template>
    <div class="member-page" style="padding-right: 300px;">
        <MemberSidebar />
        <div class="delivery-list">
            <h2>결제 내역 조회</h2>
            <hr class="horizontal-divider" />
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>주문 상품</th>
                            <th>주문 농장</th>
                            <th>배송 일자</th>
                            <th>배송 현황</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="filteredDeliveries.length === 0">
                            <td colspan="4">배송 조회할 목록이 없습니다.</td>
                        </tr>
                        <tr v-for="delivery in filteredDeliveries" :key="delivery.id">
                            <td>{{ delivery.packageName }}</td>
                            <td>{{ delivery.farmName }}</td>
                            <td>{{ formatDate(delivery.deliveryAt) }}</td>
                            <td @click="openDeliveryStatus(delivery.deliveryStatus, delivery.trackingData)"
                                class="delivery-status">
                                <span style="cursor: pointer;">
                                    {{ formatDeliveryStatus(delivery.deliveryStatus) }}
                                </span>
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

        <!-- 배송중 및 배송완료 모달 -->
        <div v-if="isModalOpen" class="modal">
            <div class="modal-content">
                <h3>{{ modalTitle }}</h3>
                <div class="tracking-container">
                    <div class="steps">
                        <div class="step" v-for="(step, index) in steps" :key="index"
                            :class="{ completed: index <= completedStep }">
                            <img :src="step.icon" :alt="step.label" class="icon" />
                            <p>{{ step.label }}</p>
                        </div>
                    </div>
                    <table class="tracking-table">
                        <thead>
                            <tr>
                                <th style="text-align: center;">날짜</th>
                                <th style="text-align: center;">시간</th>
                                <th style="text-align: center;">발생국</th>
                                <th style="text-align: center;">처리현황</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in trackingData" :key="item.date">
                                <td>{{ item.date }}</td>
                                <td>{{ item.time }}</td>
                                <td>{{ item.location }}</td>
                                <td>{{ item.status }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="modal-footer">
                    <button @click="closeModal" class="close-btn">닫기</button>
                </div>
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
            deliveries: [],
            currentPage: 0,
            totalPages: 0,
            itemsPerPage: 8,
            isModalOpen: false,
            modalTitle: '',
            trackingData: [],
            steps: [
                { label: 'STEP1. 접수', icon: 'https://cdn-icons-png.flaticon.com/512/5393/5393031.png' },
                { label: 'STEP2. 발송', icon: 'https://cdn-icons-png.flaticon.com/512/756/756940.png' },
                { label: 'STEP3. 배달준비', icon: 'https://cdn-icons-png.flaticon.com/512/870/870181.png' },
                { label: 'STEP4. 배달완료', icon: 'https://cdn-icons-png.flaticon.com/512/12963/12963915.png' }
            ],
            completedStep: 0
        };
    },
    mounted() {
        this.getdeliveryList();
    },
    computed: {
        filteredDeliveries() {
            return this.deliveries.filter(delivery => delivery.deliveryStatus !== null && delivery.deliveryAt !== null);
        },
    },
    methods: {
        formatPrice(value) {
            if (value == null) {
                return "0원";
            }
            return parseInt(value).toLocaleString('ko-KR') + ' 원';
        },
        async getdeliveryList(page = 1) {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/order-service/order/delivery/list`, {
                    params: {
                        page: page - 1,
                        size: this.itemsPerPage,
                    }
                });
                this.deliveries = response.data.content || [];
                const filteredDeliveries = this.deliveries.filter(delivery => delivery.deliveryStatus !== null && delivery.deliveryAt !== null);
                this.totalPages = Math.ceil(filteredDeliveries.length / this.itemsPerPage) || 1;
                this.currentPage = page;
            } catch (error) {
                console.error("결제 리스트를 불러오는 중 오류가 발생했습니다.", error);
            }
        },
        formatDate(dateTime) {
            return dateTime.split('T')[0];
        },
        formatDeliveryStatus(status) {
            switch (status) {
                case 'IN_DELIVERY':
                    return '배송 중';
                case 'AFTER_DELIVERY':
                    return '배송 완료';
                default:
                    return '상태 미정';
            }
        },
        openDeliveryStatus(status) {
            if (status === 'AFTER_DELIVERY') {
                this.trackingData = [
                    { date: '2023.09.23', time: '17:01', location: '동천안우체국', status: '집하완료' },
                    { date: '2023.09.23', time: '17:12', location: '동천안우체국', status: '접수' },
                    { date: '2023.09.23', time: '18:08', location: '동천안우체국', status: '발송' },
                    { date: '2023.09.23', time: '19:38', location: '광역우편물류센터', status: '도착' },
                    { date: '2023.09.23', time: '23:47', location: '광역우편물류센터', status: '발송' },
                    { date: '2023.09.25', time: '01:57', location: '안양우편물류센터', status: '도착' },
                    { date: '2023.09.25', time: '05:52', location: '안양우편물류센터', status: '배송 완료' }
                ];
                this.completedStep = 3;
            } else if (status === 'IN_DELIVERY') {
                this.trackingData = [
                    { date: '2023.09.23', time: '17:01', location: '동서울우체국', status: '집하완료' },
                    { date: '2023.09.23', time: '17:12', location: '동서울우체국', status: '접수' },
                    { date: '2023.09.23', time: '18:08', location: '동서울우체국', status: '발송' },
                    { date: '2023.09.23', time: '19:38', location: '광역우편물류센터', status: '도착' },
                    { date: '2023.09.23', time: '23:47', location: '광역우편물류센터', status: '발송' },
                    { date: '2023.09.25', time: '01:57', location: '동서울물류센터', status: '도착' },
                ];
                this.completedStep = 2;
            }

            this.isModalOpen = true;
        },
        closeModal() {
            this.isModalOpen = false;
        },
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.getdeliveryList(this.currentPage + 1);
            }
        },
        prevPage() {
            if (this.currentPage > 1) {
                this.getdeliveryList(this.currentPage - 1);
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

.delivery-list {
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
    text-align: center;
    width: 100%;
    table-layout: fixed;
    border-collapse: separate;
    border-spacing: 0 20px;
}

th,
td {
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

.modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 80%;
    max-width: 600px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.tracking-container {
    width: 100%;
}

.steps {
    display: flex;
    justify-content: space-around;
    margin-top: 20px;
    margin-bottom: 20px;
}

.step {
    text-align: center;
    opacity: 0.4;
    /* 기본적으로 회색 느낌 */
}

.step.completed {
    opacity: 1;
    /* 완료된 단계는 원래 색상 유지 */
}

.icon {
    width: 50px;
    height: 50px;
    margin-bottom: 10px;
}

.tracking-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
}

.tracking-table th,
.tracking-table td {
    border: 1px solid #ddd;
    padding: 8px;
}

.tracking-table th {
    background-color: #FFCC80;
    text-align: left;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}

.close-btn {
    background-color: #BCC07B;
    color: black;
    border-radius: 50px;
    padding: 10px 15px;
}
</style>
