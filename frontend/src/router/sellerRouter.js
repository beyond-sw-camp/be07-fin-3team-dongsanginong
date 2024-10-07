import DeliveryManageList from "@/views/order/delivery/DeliveryManageList.vue"
import SellerSalesDetail from "@/views/product/seller/SellerSalesDetail.vue"
import CouponCreate from "@/views/order/coupon/CouponCreate.vue"
import CouponList from "@/views/order/coupon/CouponList.vue"
import SellerSignUp from "@/views/product/seller/SellerSignUp.vue"
import SellerWithDraw from "@/views/product/seller/SellerWithDraw.vue"
import ProductCreate from "@/views/product/package/ProductCreate.vue"
import ProductList from "@/views/product/seller/ProductList.vue"
import ProductUpdate from "@/views/product/seller/ProductUpdate.vue"
import FarmNoticeSellerList from "@/views/product/seller/FarmNoticeSellerList.vue";
import FarmNoticeSellerDetail from "@/views/product/seller/FarmNoticeSellerDetail.vue";

export const sellerRouter = [

    {
        path: '/seller/sales-detail',
        name: 'sellerSalesDetail',
        component: SellerSalesDetail
    },
    {
        path: '/coupons/create',
        name: 'CouponCreate',
        component: CouponCreate
    },
    {
        path: '/coupons/:farm_id/list',
        name: 'CouponList',
        component: CouponList
    },
    {
        path: '/seller/delivery-management',
        name: 'DeliveryManageList',
        component: DeliveryManageList
    },
    {
        path: '/seller/sign-up',
        name: 'sellerSignUp',
        component: SellerSignUp
    },
    {
        path: '/seller/withdraw',
        name: 'SellerWithdraw',
        component: SellerWithDraw
    },
    {
        path: '/seller/create-product',
        name: 'ProductCreate',
        component: ProductCreate
    },
    {
        path: '/seller/product-list',
        name: 'ProductList',
        component: ProductList
    },
    {
        path: '/seller/update-product/:id',
        name: 'ProductUpdate',
        component: ProductUpdate
    },
    {
        path: '/seller/:farmId/notice/list',
        name: 'FarmNoticeSellerList',
        component: FarmNoticeSellerList,
    },
    {
        path: '/seller/:farmId/notice/:notice_id',
        name: 'FarmNoticeSellerDetail',
        component: FarmNoticeSellerDetail,
    }
]
