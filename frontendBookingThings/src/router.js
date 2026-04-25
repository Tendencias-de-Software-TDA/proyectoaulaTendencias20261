import { createRouter, createWebHistory} from "vue-router"


import Index from "./pages/Index.vue";
import SignUp from "./pages/SignUp.vue";
import SignIn from "./pages/SignIn.vue";

const routes = [
    {path:'/', component:Index},
    {path:'/signup', component:SignUp},
    {path:'/signin', component:SignIn},
]


const history = createWebHistory()
const router = createRouter({
    history,routes
})


router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem("accessToken")

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/signin')
    } else {
        next()
    }
})


export default router