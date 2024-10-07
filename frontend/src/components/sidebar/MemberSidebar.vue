<template>
    <v-navigation-drawer app permanent>
        <v-list dense>
            <v-list-item-group>
                <v-list-item style="text-align: center;">
                    <v-list-item-title class="item-title" :to="{path:'/member/my-page'}"><strong>마이 페이지</strong></v-list-item-title>
                </v-list-item>
                <v-col class="text-center">
                    <v-btn class="cat_btn" :to="{path:'/member/update/phone'}">전화번호 변경</v-btn><br>
                    <v-btn class="cat_btn" :to="{path:'/member/update/address'}">주소지 변경</v-btn><br>
                    <v-btn class="cat_btn" :to="{path:'/coupons/downloaded-coupons'}">보유한 쿠폰 조회</v-btn><br>
                    <v-btn class="cat_btn" :to="{path:'/member/favorite'}">구독 조회 / 변경</v-btn><br>
                    <v-btn class="cat_btn" :to="{path:'/member/payment/list'}">결제 내역 조회</v-btn><br>
                    <v-btn class="cat_btn" :to="{path:'/member/delivery/list'}">배송 조회</v-btn><br>
                </v-col>
            </v-list-item-group>
        </v-list>
    </v-navigation-drawer>
</template>
<script>
export default {

}
</script>
<style scoped>
.item-title {
    background-color: #BCC07B; 
    border-radius: 50px;
    padding-left: 5px;
    padding-right: 5px;
    padding-top: 10px;
    padding-bottom: 10px;

}
.cat_btn{
    border: none;
    box-shadow: none;
    justify-content: center;
    width: 100%;
}
</style>