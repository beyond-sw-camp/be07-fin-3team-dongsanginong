
import FarmNoticeList from "@/views/product/farmNotice/FarmNoticeList.vue";
import FarmNoticeCreate from "@/views/product/farmNotice/FarmNoticeCreate.vue";
import FarmNoticeUpdate from "@/views/product/farmNotice/FarmNoticeUpdate.vue";
import NoticeDetailWithComment from "@/views/product/farmNotice/NoticeDetailWithComment.vue";

export const farmNoticeRouter = [
    {
        path: '/farm/notice/create',
        name: 'FarmNoticeCreate',
        component: FarmNoticeCreate
    },
    {
        path: '/farm/notice/update',
        name: 'FarmNoticeUpdate',
        component: FarmNoticeUpdate
    },
    {
        path: '/farm/:farmId/notice/list',
        name: 'FarmNoticeList',
        component: FarmNoticeList,
    },
    {
        path: '/farm/:farmId/notice/:notice_id',
        name: 'NoticeDetailWithComment',
        component: NoticeDetailWithComment,
    }
]
