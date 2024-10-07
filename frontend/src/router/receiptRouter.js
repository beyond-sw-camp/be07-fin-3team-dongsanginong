import MemberPaymentReceipt from "@/views/order/receipt/MemberPaymentReceipt.vue";

export const receiptRouter = [
    {
        path: '/receipt/:receiptId',
        name: 'MemberPaymentReceipt',
        component: MemberPaymentReceipt
    },
]