<template>

    <div class="bg-background text-on-background font-body-md min-h-screen">

        <navbarComponent />

        <!-- Hero & Search Section -->
        <section class="mb-16 mt-10">
            <div class="text-center mb-10">
                <h1 class="text-4xl font-bold text-base-content mb-4">
                    Reserva ahora todo aquello que quieres
                </h1>
                <p class="text-base text-base-content/70 max-w-2xl mx-auto">
                    Reserva espacios, servicios y artículos de forma simple
                </p>
            </div>

            <!-- Search -->
            <div
                class="bg-base-100 p-4 rounded-xl shadow border border-base-300 flex flex-col md:flex-row items-center gap-4 max-w-5xl mx-auto">

                <div class="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">

                    <input class="input input-bordered w-full" placeholder="Nombre del Recurso" v-model="name" />

                    <select class="select select-bordered w-full" v-model="resourceType">
                        <option value="TLR">Todos los recursos</option>
                        <option value="sala">Salas</option>
                        <option value="equipo">Equipos</option>
                        <option value="espacio">Espacios</option>
                    </select>

                </div>

                <button class="btn btn-secondary w-full md:w-auto" v-on:click="searchResource">
                    Buscar recursos
                </button>
            </div>
        </section>

        <availableResourceListComponent :data="filteredResources" />

    </div>
</template>

<script>

import navbarComponent from '../components/navbar.component.vue'
import availableResourceListComponent from '../components/availableResourceList.component.vue';
import axios from "axios"

export default {
    components: {
        navbarComponent,
        availableResourceListComponent
    },
    data() {
        return {
            resources: [],
            filteredResources:[],
            name: "",
            resourceType: "TLR"
        }
    },
    methods: {
        async getResources() {

            try {

                const token = localStorage.getItem("accessToken")

                const request = await axios.get(
                    import.meta.env.VITE_BACKEND_HOST + "/api/v1/resources/"
                )

                this.resources = request.data

            } catch (error) {

                console.error(error)

            }

        },
        searchResource() {
            const data = this.resources.filter(resource => {

                const matchName =
                    this.name === "" ||
                    resource.name
                        .toLowerCase()
                        .includes(this.name.toLowerCase())

                const matchType =
                    this.resourceType === "TLR" ||
                    resource.resourceType === this.resourceType

                return matchName && matchType

            })

            this.filteredResources = data
            

        }
    },
    mounted() {
        this.getResources()
    },
}
</script>