from collections import defaultdict
from decimal import Decimal

from django.utils import timezone


def clasificar_antiguedad(hoy, fecha_vencimiento) -> tuple[str, int]:
    """
    Retorna (código_tramo, dias_para_vencer) donde dias_para_vencer es
    (fecha_vencimiento - hoy).days: positivo = aún dentro de plazo / por vencer;
    cero = vence hoy; negativo = hace tanto días vencida la factura.

    Tramos sobre morosidad (solo si fecha_vencimiento < hoy o igual con saldo).
    Rangos inclusivos típicos: 1-30, 31-60, … contando desde el día siguiente
    al vencimiento; el día del vencimiento cuenta como inicio bucket 0-30.
    """
    dias_para_vencer = (fecha_vencimiento - hoy).days

    if dias_para_vencer > 0:
        return ('por_vencer', dias_para_vencer)

    dias_mora = dias_para_vencer * -1  # dias_mora >= 0 si dias_para_vencer <= 0

    if dias_mora <= 30:
        return ('0_30', dias_para_vencer)
    if dias_mora <= 60:
        return ('31_60', dias_para_vencer)
    if dias_mora <= 90:
        return ('61_90', dias_para_vencer)
    return ('mas_90', dias_para_vencer)


def obtener_reporte_cartera(facturas_queryset):
    """
    Lista facturas con saldo por cliente, clasificación por antigüedad.

    Espera queryset filtrado (pendientes de cobro).
    """
    hoy = timezone.now().date()
    orden_tramos = (
        'por_vencer',
        '0_30',
        '31_60',
        '61_90',
        'mas_90',
    )

    por_cliente = defaultdict(lambda: {
        'cliente_id': None,
        'cliente_nombre': '',
        'saldo_total_adeudado': Decimal('0.00'),
        'totales_por_tramo': {k: Decimal('0.00') for k in orden_tramos},
        'facturas': [],
    })

    for fa in facturas_queryset.select_related('cliente').order_by(
        'cliente__nombre',
        'fecha_vencimiento',
        'numero',
    ):
        saldo = fa.saldo_pendiente if fa.saldo_pendiente is not None else Decimal('0')
        if saldo <= Decimal('0.00'):
            continue

        tramo, dias_para_vencer = clasificar_antiguedad(hoy, fa.fecha_vencimiento)
        cliente = fa.cliente
        key = cliente.id
        bloc = por_cliente[key]
        bloc['cliente_id'] = cliente.id
        bloc['cliente_nombre'] = cliente.nombre
        bloc['saldo_total_adeudado'] += saldo
        bloc['totales_por_tramo'][tramo] += saldo
        bloc['facturas'].append({
            'id': fa.id,
            'numero': fa.numero,
            'estado': fa.estado,
            'fecha_emision': fa.fecha_emision.isoformat() if fa.fecha_emision else None,
            'fecha_vencimiento': fa.fecha_vencimiento.isoformat(),
            'saldo_pendiente': str(saldo),
            'dias_para_vencer': dias_para_vencer,
            'clasificacion_antiguedad': tramo,
        })

    clientes_list = []
    total_general = Decimal('0.00')
    tot_general_tramo = {k: Decimal('0.00') for k in orden_tramos}

    for _cid, data in sorted(
        por_cliente.items(),
        key=lambda kv: kv[1]['cliente_nombre'].lower(),
    ):
        sd = Decimal('0')
        tp = {}
        for k in orden_tramos:
            v = data['totales_por_tramo'][k]
            tp[k] = str(v)
            tot_general_tramo[k] += v
            sd += v

        total_general += sd

        clientes_list.append({
            'cliente_id': data['cliente_id'],
            'cliente_nombre': data['cliente_nombre'],
            'saldo_total_adeudado': str(sd),
            'totales_por_tramo': tp,
            'facturas': data['facturas'],
        })

    tot_gen_tramo_str = {k: str(v) for k, v in tot_general_tramo.items()}

    return {
        'fecha_corte': hoy.isoformat(),
        'total_cartera_adeudado': str(total_general),
        'totales_global_por_tramo': tot_gen_tramo_str,
        'clientes': clientes_list,
        'catalogo_tramos': {
            'por_vencer': 'Por vencer (sin mora)',
            '0_30': 'Morosidad 0–30 días',
            '31_60': 'Morosidad 31–60 días',
            '61_90': 'Morosidad 61–90 días',
            'mas_90': 'Morosidad mayor a 90 días',
        },
    }
