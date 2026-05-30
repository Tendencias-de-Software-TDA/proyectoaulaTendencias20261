<template>
    <dialog id="bookingResourceModal" class="modal modal-top">

        <div class="modal-box w-11/12 max-w-3xl mx-auto mt-2">

            <!-- Encabezado -->
            <h3 class="text-2xl font-bold mb-2">
                Reservar {{ resource?.name }}
            </h3>

            <ul>
                <li v-for="day in resource?.availableSchedule?.avialableDays">{{ day.day }} {{ day.startAt }}-{{
                    day.endsAt }}
                </li>
            </ul>

            <p class="text-base-content/60 mb-6">
                Selecciona una fecha y uno o varios horarios disponibles.
            </p>

            <!-- Fecha -->
            <div class="form-control mb-6">
                <label class="label">
                    <span class="label-text font-semibold">
                        Fecha de reserva
                    </span>
                </label>

                <input type="date" class="input input-bordered w-full" v-model="bookingDate">
            </div>
            <button class="btn btn-secondary btn-block" v-on:click="searchAvailability" :disabled="isLoading">{{
                isLoading ? 'Buscando' : 'Buscar Disponibilidad' }}</button>

            <div class="form-control">
                <h2 class="text-center mt-2">{{ slots.length > 0 ? 'Horarios Disponibles' : 'No hay horarios para la fecha' }}</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3" v-if="slots.length > 0">
                    <label v-for="item in slots" :key="item"
                        class="label cursor-pointer justify-start gap-3 border rounded-lg p-4 hover:bg-base-200"
                        :class="{ 'border-secondary bg-secondary/10': selectedSlot === item }">
                        <input type="radio" name="availableSlot" class="radio radio-secondary" :value="item"
                            v-model="selectedSlot">
                        <span class="label-text font-medium">
                            {{ item }}
                        </span>
                    </label>

                    <div class="form-control mb-6">
                        <label class="label">
                            <span class="label-text font-semibold">
                                Razón de Reserva
                            </span>
                        </label>

                        <textarea class="input w-full" v-model="reason"></textarea>
                    </div>

                    <div class="form-control mb-6">
                        <label class="label">
                            <span class="label-text font-semibold">
                                Lista de Espera
                            </span>
                        </label>

                        <input type="checkbox" :checked="whiteList" class="toggle mt-8" />
                    </div>

                </div>
            </div>

            <div class="modal-action justify-between mt-8">
                <form method="dialog">
                    <button class="btn btn-ghost">
                        Cancelar
                    </button>
                </form>
                <button class="btn btn-secondary" v-on:click="booking" :disabled="isLoading">
                    {{ isLoading ? 'Procesando' : 'Reservar' }}
                </button>
            </div>

        </div>

    </dialog>

    <div class="toast toast-top toast-end" v-if="isSuccess">
        <div class="alert alert-success">
            <span>Reserva creada exitosamente.</span>
        </div>
    </div>
</template>

<script>

import axios from "axios"

export default {
    props: {
        resource: Object,
    },
    data() {
        return {
            bookingDate: "",
            slots: [],
            isLoading: false,
            reason: "",
            selectedSlot: null,
            whiteList: false,
            isSuccess: false
        }
    },
    methods: {
        async searchAvailability() {

            this.isLoading = true

            try {

                const token = localStorage.getItem("accessToken")

                const resourceId = this.resource.id
                const bookingDate = this.bookingDate

                const request = await axios.get(
                    import.meta.env.VITE_BACKEND_HOST + "/api/v1/resources/" + resourceId + "/availability/?date=" + bookingDate,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )

                this.slots = request.data.availableSlot

            } catch (error) {

                console.log(error.response?.status)
                console.log(error.response?.data)

            }

            this.isLoading = false
        },
        async booking() {
            const reason = this.reason
            const bookingDate = this.bookingDate
            const whiteList = this.whiteList
            const [startTime, endTime] = this.selectedSlot.split("-")

            const body = {
                "date": bookingDate,
                "startAt": startTime,
                "endsAt": endTime,
                "reason": reason,
                "resource": this.resource.id,
                "waitList": whiteList
            }

            this.isLoading = true

            try {

                const token = localStorage.getItem("accessToken")


                const request = await axios.post(import.meta.env.VITE_BACKEND_HOST + "/api/v1/reservations/", body,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    },
                )

                if (request.data.id) {
                    bookingResourceModal.close()
                    this.isSuccess = true
                }



            } catch (error) {
                alert("error")
                console.log(error.response?.status)
                console.log(error.response?.data)

            }

            this.isLoading = false

        }
    },
}
</script>