<template>
    <main class="grow flex items-center justify-center px-6 py-16 bg-base-200">
        <div class="w-full max-w-md">

            <!-- Brand -->
            <div class="flex justify-center mb-12">
                <router-link to="/" class="text-4xl font-bold text-secondary tracking-tight">BookingThings</router-link>
            </div>

            <!-- Card -->
            <div class="card bg-base-100 shadow-xl border border-base-300">
                <div class="card-body p-8">

                    <header class="mb-6">
                        <h1 class="card-title text-3xl font-bold text-base-content mb-1">
                            Bienvenido de Nuevo
                        </h1>
                        <p class="text-sm text-base-content/70">
                            Ingresa tus datos para continuar
                        </p>
                    </header>

                    <form class="space-y-4" v-on:submit.prevent="signIn">

                        <div role="alert" class="alert alert-error" v-if="requestFail">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{{ requestMessage }}</span>
                        </div>


                        <!-- user -->
                        <div class="form-control w-full">
                            <label class="label pt-0" for="user">
                                <span class="label-text font-semibold text-base-content/70">
                                    Usuario
                                </span>
                            </label>

                            <label
                                class="input input-bordered flex items-center gap-3 focus-within:outline-secondary w-full">
                                <span class="material-symbols-outlined text-base-content/50 text-[20px]">person</span>
                                <input id="user" type="text" placeholder="JhonDoe" v-model="formData.username"
                                    class="grow border-none focus:outline-none" />
                            </label>
                        </div>

                        <!-- Password -->
                        <div class="form-control w-full">
                            <div class="flex justify-between items-center mb-1">
                                <label class="label p-0" for="password">
                                    <span class="label-text font-semibold text-base-content/70">
                                        Contraseña
                                    </span>
                                </label>
                            </div>

                            <label
                                class="input input-bordered flex items-center gap-3 focus-within:outline-primary w-full">
                                <span class="material-symbols-outlined text-base-content/50 text-[20px]">
                                    lock
                                </span>
                                <input id="password" type="password" placeholder="••••••••" v-model="formData.password"
                                    class="grow border-none focus:outline-none" />
                            </label>
                        </div>

                        <!-- Button -->
                        <button class="btn btn-secondary w-full mt-4 normal-case text-white font-semibold"
                            :disabled="isLoading ? true : false" type="submit">
                            {{ isLoading ? 'Cargando' : 'Iniciar Sesión' }}
                            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>

                    </form>

                    <footer class="mt-8 text-center">
                        <p class="text-sm text-base-content/70">
                            No tienes una cuenta?
                            <router-link class="text-secondary font-bold hover:underline" to="/signup">
                                Regístrate
                            </router-link>
                        </p>
                    </footer>

                </div>
            </div>

        </div>
    </main>
</template>

<script>

import axios from "axios"

export default {
    data() {
        return {
            formData: {
                username: "",
                password: ""
            },
            requestFail: false,
            requestMessage: "",
            isLoading: false
        }
    },
    methods: {
        async signIn() {

            this.isLoading = true

            const payload = {
                username: this.formData.username,
                password: this.formData.password
            }

            try {
                const request = await axios.post(import.meta.env.VITE_BACKEND_HOST + "/login/", payload)

                console.log(request)

                if (request.status == 200) {

                    this.isLoading = false

                    localStorage.setItem("accessToken", request.data.access)
                    localStorage.setItem("sessionInfo", JSON.stringify({ email: request.data.email, userName: this.formData.username, role: request.data.role }))
                    this.$router.push("/")

                } else {
                    this.requestFail = true
                    this.requestMessage = request.data.detail
                }
            } catch (error) {
                this.requestFail = true
                this.requestMessage = error.message
            }

            this.isLoading = false
        }
    }
}
</script>