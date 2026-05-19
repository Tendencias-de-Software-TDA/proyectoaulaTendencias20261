def obtener_tasa_cobro(facturas):

    total_emitidas = facturas.count()

    total_pagadas = facturas.filter(
        estado='pagada'
    ).count()

    porcentaje = 0

    if total_emitidas > 0:
        porcentaje = round(
            (total_pagadas / total_emitidas) * 100,
            2
        )

    return {
        'facturas_emitidas': total_emitidas,
        'facturas_pagadas': total_pagadas,
        'porcentaje': porcentaje
    }