<template>
    <!-- 사이드바 자리 -->
    <SellerSidebar />

    <v-container fluid>
        <h3>매출 내역 조회</h3>
        <!-- 첫 구독만 표시와 날짜 선택 -->
        <v-row style="height: 100px;" align="center">
            <v-col cols="5" style="align-items: center; justify-content: center">
                <v-checkbox v-model="this.checked" label="첫 구독만 표시" />
            </v-col>
            <v-col cols="2.5">
                <v-text-field density="compact" label="시작일" v-model="this.formattedStartDate" readonly
                    @click.stop="startDialog = true" append-icon="mdi-calendar"
                    style="height: 30px; line-height: 30px;" />
                <v-dialog v-model="this.startDialog" max-width="290">
                    <v-date-picker v-model="this.startTime" @change="updateStartDate"></v-date-picker>
                </v-dialog>
            </v-col>
            <v-col cols="1" class="text-center">~</v-col>
            <v-col cols="2.5">
                <v-text-field density="compact" label="종료일" v-model="this.formattedEndDate" readonly
                    @click.stop="endDialog = true" append-icon="mdi-calendar"
                    style="height: 30px; line-height: 30px;" />
                <v-dialog v-model="this.endDialog" max-width="290">
                    <v-date-picker v-model="this.endTime" @change="updateEndDate"></v-date-picker>
                </v-dialog>
            </v-col>
            <v-col cols="1">
                <v-btn style="border-radius: 50px;" :disabled="btnDisable" color="deep_green"
                    @click="loadData">적용</v-btn>
            </v-col>
        </v-row>
        <!-- 상단 그래프 영역 -->
        <v-row>
            <v-col cols="12" sm="6">
                <div class="chart-container">
                    <p>일별 매출 추이</p>
                    <!-- 그래프1 -->
                    <canvas ref="LineChart" />
                </div>
            </v-col>
            <v-col cols="12" sm="6">
                <div class="chart-container">
                    <p>월별 매출 추이</p>
                    <canvas ref="BarChart" />
                </div>
            </v-col>
        </v-row>


        <!-- 매출 내역 확인 영역 -->
        <v-row>
            <v-col cols="12">
                <v-card>
                    <v-card-title>
                        매출 내역 확인
                    </v-card-title>
                    <v-card-subtitle>
                        건수: {{ this.salesData.totalCount }}, 총 매출액: {{ this.salesData.totalAmount }}
                    </v-card-subtitle>

                    <!-- 매출 내역 테이블 -->
                    <v-data-table :search="search">
                        <thead>
                            <tr>
                                <th>결제 아이디</th>
                                <th>결제일</th>
                                <th>패키지 명</th>
                                <th>구매자 이름</th>
                                <th>누적 결제 횟수</th>
                                <th>금액</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="salesDetail in this.salesList" :key="salesDetail.orderId">
                                <td>{{ salesDetail.orderId }}</td>
                                <td>{{ extractYearAndMonthAndDay(salesDetail.paidAt) }}</td>
                                <td>{{ salesDetail.packageName }}</td>
                                <td>{{ salesDetail.customerName }}</td>
                                <td>-</td>
                                <td>{{ salesDetail.paidAmount }}</td>
                            </tr>
                        </tbody>
                    </v-data-table>
                </v-card>
            </v-col>
        </v-row>
    </v-container>

    <v-dialog v-model="this.dateCheckDialog" style="width: 500px;">
        <v-card>
            <v-card-text>
                ⚠️ 시작 날짜가 종료 날짜보다 나중일 수 없습니다.
            </v-card-text>
            <div style="text-align: right; padding: 20px;">
                <v-btn color="deep_green" style="width:10%; border-radius: 50px" @click="this.dateCheckDialog = false">
                    닫기
                </v-btn>
            </div>
        </v-card>
    </v-dialog>
</template>

<script>
import axios from 'axios';
import { Chart, registerables } from 'chart.js'
import SellerSidebar from '@/components/sidebar/SellerSidebar.vue';
Chart.register(...registerables)
export default {
    components: {
        SellerSidebar
    },
    computed: {
        // 계산된 getter
        formattedStartDate: function () {
            // `this` 는 vm 인스턴스를 가리킵니다.
            return this.extractYearAndMonthAndDay(this.startTime);
        },
        formattedEndDate: function () {
            return this.extractYearAndMonthAndDay(this.endTime);
        }
    },
    data() {
        return {
            btnDisable: false,
            currentPage: 0,
            pageCount: 0,
            startDialog: false,
            endDialog: false,
            startTime: new Date(),
            endTime: new Date(),
            checked: false,
            salesList: [],
            headers: [
                { text: '결제 아이디', align: 'center', sortable: false, value: 'orderId' },
                { text: '결제일', align: 'center', sortable: false, value: 'paidAt' },
                { text: '상품명', align: 'center', sortable: false, value: 'packageName' },
                { text: '구매자 명', align: 'center', sortable: false, value: 'customerName' },
                { text: '금액', align: 'center', sortable: false, value: 'paidAmount' },
            ],
            salesData: "",
            lineChart: null,
            barChart: null,
            dateCheckDialog: false,
            monthData: {
                labels: [],
                datasets: [{
                    label: 'number of sales',
                    data: [],
                    backgroundColor: [
                        'rgba(219, 224, 152, 0.4)',
                    ],
                    borderColor: [
                        'rgba(219, 224, 152, 1)',
                    ],
                    borderWidth: 1
                }]
            },
            dayData: {
                labels: [],
                datasets: [{
                    label: 'number of sales',
                    data: [],
                    backgroundColor: [
                        'rgba(255, 175, 110, 0.3)'
                    ],
                    borderColor: [
                        'rgba(255, 175, 110, 1)'
                    ],
                    borderWidth: 1
                }]
            },
        }
    },
    async created() {
        this.endTime = new Date();
        this.startTime.setMonth(this.endTime.getMonth() - 1);
        await this.loadData();
    },
    watch: {
        currentPage(newPage) {
            this.farmNoticeDetail(newPage);
        }
    },
    methods: {
        async createLineChart() {
            if (this.lineChart) {
                this.lineChart.destroy();
            }

            this.lineChart = await new Chart(this.$refs.LineChart, {
                type: 'line',
                data: this.dayData
            });
        },
        async createBarChart() {
            if (this.barChart) {
                this.barChart.destroy();
            }

            this.barChart = await new Chart(this.$refs.BarChart, {
                type: 'bar',
                data: this.monthData
            });
        },
        createDataForBarChart() { // 차트를 그리기 위한 데이터를 만들기
            // 1. 월 label 생성
            this.monthData.labels = this.getMonthsBetween(this.startTime, this.endTime);

            // 인덱스 맵 만들기
            const labelMap = this.createLabelIndexMap(this.monthData.labels);

            // 2. 숫자 넣기
            this.monthData.datasets[0].data = new Array(this.monthData.labels.length).fill(Number(0));

            this.salesList.forEach(element => {
                const yearMonth = this.extractYearAndMonth(element.paidAt);
                const idx = labelMap.get(yearMonth);
                this.monthData.datasets[0].data[idx] += 1;
            });
        },
        createDataForLineChart() { // 차트를 그리기 위한 데이터를 만들기
            // 1. 월 label 생성
            this.dayData.labels = this.getDaysBetween(this.startTime, this.endTime);

            // 인덱스 맵 만들기
            const labelMap = this.createLabelIndexMap(this.dayData.labels);

            // 2. 숫자 넣기
            this.dayData.datasets[0].data = new Array(this.dayData.labels.length).fill(Number(0));

            this.salesList.forEach(element => {
                const yearMonthDay = this.extractYearAndMonthAndDay(element.paidAt);
                const idx = labelMap.get(yearMonthDay);
                this.dayData.datasets[0].data[idx] += 1;
            });
        },
        extractYearAndMonth(dateString) { // 년, 월을 추출
            const date = new Date(dateString);
            const year = date.getFullYear();      // 연도 추출
            const month = date.getMonth() + 1;    // 월 추출 (0부터 시작하므로 1을 더해줌)

            return year + "." + month;
        },
        extractYearAndMonthAndDay(dateString) { // 년.월.일을 추출
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();

            return year + "." + month + "." + day;
        },
        getMonthsBetween(startTime, endTime) {
            const startDate = new Date(startTime);
            const endDate = new Date(endTime);
            const monthsArray = [];

            // startDate가 endDate보다 이전일 때까지 반복
            while (startDate <= endDate) {
                // 년, 월 데이터를 배열에 추가
                monthsArray.push(this.extractYearAndMonth(startDate.toISOString()));

                // 다음 달로 이동
                startDate.setMonth(startDate.getMonth() + 1);
            }

            return monthsArray;
        },
        getDaysBetween(startTime, endTime) {
            const startDate = new Date(startTime);
            const endDate = new Date(endTime);
            const monthsArray = [];

            // startDate가 endDate보다 이전일 때까지 반복
            while (startDate <= endDate) {
                // 년, 월 데이터를 배열에 추가
                monthsArray.push(this.extractYearAndMonthAndDay(startDate.toISOString()));
                // 다음 날로 이동
                startDate.setDate(startDate.getDate() + 1);
            }

            return monthsArray;
        },
        createLabelIndexMap(labels) {
            const map = new Map();

            // 배열을 순회하며 각 값을 키로, 인덱스를 값으로 저장
            labels.forEach((label, index) => {
                map.set(label, index);
            });
            return map;
        },
        updateStartDate() {
            this.formattedStartDate = this.startTime ? this.startTime.toISOString().slice(0, 10) : '';
            this.startDialog = false;
        },
        updateEndDate() {
            this.formattedEndDate = this.endTime ? this.endTime.toISOString().slice(0, 10) : '';
            this.endDialog = false;
        },
        async loadData() {
            this.btnDisable = true;

            try {
                const body = {
                    "onlyFirstSubscription": this.checked,
                    "startTime": this.startTime,
                    "endTime": this.endTime
                }

                if (this.startTime > this.endTime) {
                    this.dateCheckDialog = true;
                    return;
                }

                const resData = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/order-service/farm/backoffice/sales-data`, body);
                const resList = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/order-service/farm/backoffice/sales-list`, body, { params: { page: 0 } });


                this.salesData = resData.data;
                this.salesList = resList.data;

                console.log(this.salesData);
                console.log(this.salesList);

                // 월별 데이터 생성
                this.createDataForBarChart();
                this.createDataForLineChart();
            } catch (e) {
                console.log(e);
            }

            try {
                // 차트 그리기
                this.$nextTick(() => {
                    this.createLineChart();
                    this.createBarChart();
                });
            } catch (e) {
                console.log(e);

            }
            setTimeout(() => {
                this.btnDisable = false;
            }, "1100");
        }
    }
};
</script>

<style>
.chart-container {
    border: 1px solid #ccc;
    padding: 16px;
    text-align: center;
    width: 100%;
    /* 부모 컨테이너 너비 */
    height: 280px;
    overflow-x: hidden;
    /* 가로 스크롤 활성화 */
    overflow-y: hidden;
    /* 세로 스크롤 비활성화 */
}

.chart-container canvas {
    width: 1000px;
    /* 캔버스 너비 (컨테이너 너비를 초과하도록 설정) */
    height: 280px;
}
</style>