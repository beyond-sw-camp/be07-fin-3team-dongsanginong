import LiveList from '@/views/live/live/LiveList.vue'
import LiveSession from '@/views/live/live/LiveSession.vue'

export const liveRouter = [

    {
        path: '/live/list',
        name: 'LiveList',
        component: LiveList
    },
    {
        path: '/live/:sessionId', //⭐
        name: 'LiveSession',
        component: LiveSession,
      },
]
