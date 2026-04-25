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

                <div class="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4">

                    <input class="input input-bordered w-full" placeholder="Nombre del Recurso" />

                    <input class="input input-bordered w-full" placeholder="Select date" type="date" />

                    <select class="select select-bordered w-full">
                        <option>Todos los recursos</option>
                        <option>Salas</option>
                        <option>Equipos</option>
                        <option>Espacios</option>
                    </select>

                </div>

                <button class="btn btn-secondary w-full md:w-auto">
                    Buscar recursos
                </button>
            </div>
        </section>

        <availableResourceListComponent />

    </div>
</template>

<script>

import navbarComponent from '../components/navbar.component.vue'
import availableResourceListComponent from '../components/availableResourceList.component.vue';

export default {
    components: {
        navbarComponent,
        availableResourceListComponent
    }
}
</script>