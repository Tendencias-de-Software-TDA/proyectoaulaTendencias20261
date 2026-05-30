<template>
    <main class="max-w-7xl mx-auto px-6 py-12">
        <section>
            <div class="flex justify-between items-center mb-8" v-if="data.length>0">
                <h2 class="text-2xl font-semibold text-base-content">Resultados de la Búsqueda</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" v-if="data.length>0">

                <!-- CARD -->
                <div class="card bg-base-100 border border-base-300 shadow" v-for="item in data">
                    <figure class="h-48">
                        <img src="https://img.magnific.com/premium-vector/empty-cart-illustration-perfect-user-interface-uiux-projects_854078-2082.jpg?semt=ais_hybrid&w=740&q=80" class="w-full h-full object-cover" />
                    </figure>

                    <div class="card-body">
                        <div class="flex justify-between">
                            <h4 class="card-title">{{ item.name }}</h4>
                        </div>

                        <span>{{ item.description }}</span>

                        <ul>
                            <li v-for="day in item.availableSchedule.avialableDays">{{ day.day }} {{ day.startAt }}-{{ day.endsAt }}</li>
                        </ul>

                        <p class="text-sm text-base-content/70">
                            {{ item.capacity }} Personas • {{ item.resourceType }}
                        </p>

                        <div class="card-actions mt-4">
                            <button class="btn btn-secondary flex-1" v-on:click="openBookingModal(item)">Reservar Ahora</button>
                        </div>
                    </div>
                </div>
            </div>

            <h1 class="text-center font-light" v-if="!data.length>0">No hay resultados para la búsqueda</h1>

        </section>

        <bookingResourceModalComponent :resource=selectedItem />

    </main>
</template>

<script>

import bookingResourceModalComponent from "./bookingResourceModal.component.vue"

export default {
    components:{bookingResourceModalComponent},
    props: {
        data: Array,
    },
    data() {
        return {
            selectedItem: {}
        }
    },
    methods: {
        openBookingModal(element){
            console.log(element)
            this.selectedItem = element
            bookingResourceModal.showModal()
        }
    },
}
</script>