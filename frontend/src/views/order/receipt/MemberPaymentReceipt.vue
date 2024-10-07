<template>
    <div class="receipt-page">
        <div class="receipt-container">
            <div class="logo">
                <img src="/inongLogo.png" alt="로고" />
            </div>

            <div class="receipt-details">
                <div class="detail">
                    <span class="label">구매 패키지</span>
                    <span>{{ receipt.productName }}</span>
                </div>

                <div class="detail">
                    <span class="label">판매 농장</span>
                    <span>{{ receipt.farmName }}</span>
                </div>

                <hr class="dotted-line" />

                <div class="detail">
                    <span class="label">패키지 금액</span>
                    <span>{{ formatPrice(receipt.beforePrice) }}</span>
                </div>

                <div class="detail">
                    <span class="label">할인 금액</span>
                    <span>- {{ formatPrice(receipt.discountPrice) }}</span>
                </div>

                <div class="detail">
                    <span class="label">결제 금액</span>
                    <span>{{ formatPrice(receipt.totalPrice) }}</span>
                </div>

                <div class="detail">
                    <span class="label">결제일</span>
                    <span>{{ formatDate(receipt.paidAt) }}</span>
                </div>
            </div>

            <!-- PDF 다운로드 버튼 -->
            <div class="pdf-download">
                <button @click="downloadPDF">PDF 내려받기</button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default {
    data() {
        return {
            receipt: {},
        };
    },
    mounted() {
        this.getReceiptInfo();
    },
    methods: {
        async getReceiptInfo() {
            const receiptId = this.$route.params.receiptId;
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/order-service/receipt`, {
                    params: { id: receiptId },
                });
                this.receipt = response.data;
                console.log(this.receipt);
            } catch (error) {
                console.error("영수증 정보를 가져오는 중 오류가 발생했습니다.", error);
            }
        },
        formatPrice(value) {
            if (value == null) {
                return "0원";
            }
            return parseInt(value).toLocaleString('ko-KR') + ' 원';
        },
        formatDate(paidAt) {
            if (!paidAt) {
                return "정보 없음";
            }

            const datePart = paidAt.split("T")[0]; // 날짜 부분
            const timePart = paidAt.split("T")[1]; // 시간 부분
            return `${datePart} ${timePart}`; // 공백으로 결합
        },
        async downloadPDF() {
            const element = document.querySelector(".receipt-container");
            const downloadButton = document.querySelector(".pdf-download");

            // pdf 다운로드 버튼 숨기기
            downloadButton.style.display = "none";

            // 화면 캡처
            const canvas = await html2canvas(element);
            const imgData = canvas.toDataURL("image/png");
            const doc = new jsPDF();
            const imgWidth = 190;
            const pageHeight = doc.internal.pageSize.height;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                doc.addPage();
                doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // PDF 다운로드
            doc.save(`동상이농_결제 영수증_${this.receipt.paidAt}.pdf`);

            // 버튼 다시 표시
            downloadButton.style.display = "block";
        },
    },
};
</script>

<style scoped>
.receipt-page {
    width: 100%;
    max-width: 400px;
    margin: 20px auto;
    text-align: center;
}

.receipt-container {
    margin-top: 80px;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 10px;
    background-color: white;
    height: 600px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.logo img {
    width: 150px;
    margin-bottom: 20px;
}

.receipt-details {
    padding: 0 30px;
    margin-bottom: 20px;
}

.detail {
    display: flex;
    justify-content: space-between;
    margin: 20px 0;
}

.label {
    font-weight: bold;
}

.dotted-line {
    border: none;
    border-top: 1px dotted #ddd;
    margin: 20px 0;
}

.pdf-download {
    margin-top: 30px;
}

.pdf-download button {
    background-color: #bcc07b;
    color: black;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.pdf-download button:hover {
    background-color: #98a159;
}
</style>
