<template>
    <div class="navbar bg-base-100 shadow-sm">
        <div class="navbar-start">
            <div class="dropdown">
                <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6h16M4 12h8m-8 6h16" />
                    </svg>
                </div>
            </div>
            <a class="btn btn-ghost text-xl">BookingThings</a>
        </div>
        <div class="navbar-end gap-3">
            <p v-if="sessionInfo != null" class="font-bold">¡Hola {{ sessionInfo.userName }}!</p>
            <ul class="menu menu-horizontal px-1" v-if="sessionInfo?.role == 'admin'">
                <li>
                    <details>
                        <summary>Opciones</summary>
                        <ul class="bg-base-100 rounded-t-none p-2">
                            <li><a>Recursos</a></li>
                            <li><a>Reservas</a></li>
                        </ul>
                    </details>
                </li>
            </ul>
            <div class="dropdown dropdown-end">
                <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar avatar-online"
                    v-if="sessionInfo != null">
                    <div class="w-10 rounded-full">
                        <img alt="Tailwind CSS Navbar component"
                            :src="'https://api.dicebear.com/9.x/thumbs/svg?seed=' + sessionInfo.userName" />
                    </div>
                </div>
                <ul tabindex="-1"
                    class="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                    <li><a>Mis Reservas</a></li>
                    <li><a v-on:click="logOut" href="#">Cerrar Sesión</a></li>
                </ul>
            </div>
            <router-link v-if="sessionInfo == null" class="btn btn-secondary" to="/signin">Comenzar</router-link>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            sessionInfo: null
        }
    },
    methods: {
        logOut() {
            localStorage.removeItem("accessToken")
            localStorage.removeItem("sessionInfo")

            this.$router.push("/signin")
        }
    },
    mounted() {
        this.sessionInfo = JSON.parse(localStorage.getItem("sessionInfo"))
    },
}
</script>