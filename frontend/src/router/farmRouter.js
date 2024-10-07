import FarmCreate from "@/views/product/farm/FarmCreate.vue"
import FarmList from "@/views/product/farm/FarmList.vue";
import FarmDetailDescription from "@/views/product/farm/FarmDetailDescription.vue";
import FarmPackageList from "@/views/product/farm/FarmPackageList.vue";

export const farmRouter = [
    {
        path: '/farm/farm-create',
        name: 'farmCreate',
        component: FarmCreate
    },
    {
        path: '/farm',
        name: 'farmList',
        component: FarmList
    },
    {
        path: '/farm/:farmId',
        name: 'farmDetailDescription',
        component: FarmDetailDescription
    },
    {
        path: '/farm/:farmId/packages',
        name: 'farmPackages',
        component: FarmPackageList
    }
]

