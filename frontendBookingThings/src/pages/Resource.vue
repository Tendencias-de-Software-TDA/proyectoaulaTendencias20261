<template>

    <div class="bg-background text-on-background font-body-md min-h-screen">

        <navbarComponent />

        <div class="flex items-center justify-between m-8">
            <h1 class="text-2xl font-bold text-base-content">
                Gestión de Recursos
            </h1>

            <button class="btn btn-secondary" v-on:click="createResource()">
                Nuevo Recurso
            </button>
        </div>

        <div class="grid grid-cols-1 gap-2 m-2" v-if="resources.length > 0">
            <div class="col-span-1" v-for="item in resources" :key="item.id">
                <div class="card card-side bg-base-100 shadow-md border border-base-200 w-[80%] mx-auto">

                    <figure class="w-52 bg-white flex items-center justify-center">
                        <div class="text-center p-4">
                            <img src="https://img.magnific.com/premium-vector/empty-cart-illustration-perfect-user-interface-uiux-projects_854078-2082.jpg?semt=ais_hybrid&w=740&q=80"
                                class="mt-4">
                        </div>
                    </figure>

                    <div class="card-body">

                        <div class="flex justify-between items-start">
                            <div>
                                <h2 class="card-title">
                                    {{ item.name }}
                                </h2>

                                <p class="text-base-content/70">
                                    {{ item.description }}
                                </p>
                            </div>

                            <div class="badge badge-success">
                                {{ item.status }}
                            </div>
                        </div>

                        <div class="divider my-1"></div>

                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">

                            <div>
                                <p class="text-xs opacity-60">Capacidad</p>
                                <p class="font-semibold">{{ item.capacity }} Personas</p>
                            </div>

                            <div>
                                <p class="text-xs opacity-60">Tipo</p>
                                <p class="font-semibold">{{ item.resourceType }}</p>
                            </div>

                            <div>
                                <p class="text-xs opacity-60">Disponibilidad</p>
                                <p class="font-semibold">{{ item.availableSchedule?.avialableDays?.length }} horarios
                                </p>
                            </div>

                        </div>

                        <div class="divider my-1"></div>

                        <div class="flex flex-wrap gap-2">

                            <!-- <div class="badge badge-outline" v-for="shift in item.availableSchedule?.avialableDays">
                                {{ shift.day }} {{ shift.startAt }} - {{ shift.endsAt }}
                            </div> -->
                        </div>

                        <div class="card-actions justify-end mt-2">
                            <button class="btn btn-secondary btn-sm">
                                Editar
                            </button>
                        </div>

                    </div>

                </div>
            </div>
        </div>

        <createResourceModalComponent/>

    </div>
</template>

<script>

import navbarComponent from '../components/navbar.component.vue'
import availableResourceListComponent from '../components/availableResourceList.component.vue';
import createResourceModalComponent from '../components/createResourceModal.component.vue'
import axios from "axios"

export default {
    components: {
        navbarComponent,
        availableResourceListComponent,
        createResourceModalComponent
    },
    data() {
        return {
            resources: []
        }
    },
    methods: {
        async getResources() {

            try {

                const token = localStorage.getItem("accessToken")

                const request = await axios.get(
                    import.meta.env.VITE_BACKEND_HOST + "/api/v1/resources/",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

                this.resources = request.data

            } catch (error) {

                console.error(error)

            }

        },
        createResource(){
            createResourceModal.showModal()
        }
    },
    mounted() {
        this.getResources()
    },
}
</script>