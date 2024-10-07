import ReviewCreate from '@/views/product/review/ReviewCreate.vue'
import FarmReviewList from '@/views/product/review/FarmReviewList.vue'
import ReviewDetail from '@/views/product/review/ReviewDetail.vue'

export const reviewRouter = [

    {
        path: '/reviews/:packageProductId/create',
        name: 'ReviewCreate',
        component: ReviewCreate
    },
    {
        path: '/farm/:farmId/reviews',
        name: 'FarmReviewList',
        component: FarmReviewList
    },
    {
        path: '/reviews/:reviewId/detail',
        name: 'ReviewDetail',
        component: ReviewDetail
    },
]
