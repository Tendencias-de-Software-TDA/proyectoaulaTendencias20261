<template>
    <main class="max-w-7xl mx-auto px-6 py-12">



        <!-- Categories -->
        <section class="mb-16">
            <div class="flex justify-between items-end mb-8">
                <div>
                    <h2 class="text-2xl font-semibold text-base-content">Explora por categoría</h2>
                    <p class="text-base-content/70">Descubre un recurso Especial para ti</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div class="md:col-span-1 md:row-span-2 relative aspect-4/3 rounded-xl overflow-hidden group cursor-pointer">
                    <img alt="Executive Meeting Rooms"
                        class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        data-alt="ultra-modern glass-walled conference room with designer furniture and city skyline view through windows"
                        src="https://sefhor.com/wp-content/uploads/maquinaria-de-obra.jpg" />
                    <div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div class="absolute bottom-6 left-6 text-white">
                        <h3 class="font-headline-md">Equipos</h3>
                        <p class="font-body-sm opacity-90">Reserva de Equipos</p>
                    </div>
                </div>

                <div class="md:col-span-1 md:row-span-2 relative aspect-4/3 rounded-xl overflow-hidden group cursor-pointer">
                    <img alt="Executive Meeting Rooms"
                        class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        data-alt="ultra-modern glass-walled conference room with designer furniture and city skyline view through windows"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxpONiAhXPg2mTXAE7_eyWY9set53Q7JP5vgd2fUSyfIJPMSTiUE4DQCREwZozRZWeUp7zHOST2iqXxxZPV883oVbe5X5_ksk3J38k5b7SW1nz62sEclGUEnyYp7lmZPL116OWeJYV1jsZvd-O1jFReVe_iXXuu3clqkssd5Ld973gtTKBQd3pFLrdid4lOY12pCbxXVyWuRL_60Hi_Q4gSSyzAj5bbpIUBesV7HJTYpUytxS8HQhyOwJnp8lMCP_TTyWJ7pSTtZA" />
                    <div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div class="absolute bottom-6 left-6 text-white">
                        <h3 class="font-headline-md">Salas</h3>
                        <p class="font-body-sm opacity-90">Reserva de Salas</p>
                    </div>
                </div>

                <div class="md:col-span-1 md:row-span-2 relative aspect-4/3 rounded-xl overflow-hidden group cursor-pointer">
                    <img alt="Executive Meeting Rooms"
                        class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        data-alt="ultra-modern glass-walled conference room with designer furniture and city skyline view through windows"
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQez9LIK4vw1zAUR2-q_jH3Ex09dXihaiEJQ&s" />
                    <div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div class="absolute bottom-6 left-6 text-white">
                        <h3 class="font-headline-md">Espacios</h3>
                        <p class="font-body-sm opacity-90">Reserva de Espacios</p>
                    </div>
                </div>

                <!-- resto igual -->
            </div>
        </section>

        <!-- Featured Resources -->
        <section>
            <div class="flex justify-between items-center mb-8">
                <h2 class="text-2xl font-semibold text-base-content">Resultados de Búsqueda</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <!-- CARD -->
                <div class="card bg-base-100 border border-base-300 shadow">
                    <figure class="h-48">
                        <img src="https://recreatecbb.com.mx/wp-content/uploads/2024/12/Beneficios-de-las-canchas-multiusos.jpg" class="w-full h-full object-cover" />
                    </figure>

                    <div class="card-body">
                        <div class="flex justify-between">
                            <h4 class="card-title">Boardroom Alpha</h4>
                            <span class="text-primary font-semibold">$45/hr</span>
                        </div>

                        <p class="text-sm text-base-content/70">
                            12 People • Hybrid Ready
                        </p>

                        <div class="card-actions mt-4">
                            <button class="btn btn-outline btn-primary flex-1">Details</button>
                            <button class="btn btn-secondary flex-1">Book Now</button>
                        </div>
                    </div>
                </div>

            </div>
        </section>

    </main>
</template>