<template>
    <v-navigation-drawer app permanent>
        <v-list dense>
            <v-list-item-group>
                <v-list-item style="text-align: center;">
                    <v-list-item-title class="item-title"><strong>동상이농 사장님 서비스</strong></v-list-item-title>
                </v-list-item>
                <v-col class="text-center">
                    <v-btn class="cat_btn" :to="{path:'/seller/delivery-management'}">주문 및 배송 관리</v-btn><br>
                    <v-btn class="cat_btn" :to="{path:'/seller/sales-detail'}">매출 내역 관리</v-btn><br>
                    <v-btn class="cat_btn" :to="{path: '/seller/product-list'}">상품 관리</v-btn><br>
                    <v-btn class="cat_btn">커뮤니티 관리</v-btn><br>
                    <v-btn class="cat_btn">리뷰 관리</v-btn><br>
                    <v-btn class="cat_btn">쿠폰 관리</v-btn><br>
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