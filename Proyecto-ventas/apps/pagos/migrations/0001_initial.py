import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('facturacion', '0002_factura_saldo_pendiente'),
    ]

    operations = [
        migrations.CreateModel(
            name='Pago',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('medio_pago', models.CharField(choices=[('efectivo', 'Efectivo'), ('transferencia', 'Transferencia'), ('tarjeta', 'Tarjeta'), ('cheque', 'Cheque'), ('otro', 'Otro')], max_length=30)),
                ('monto', models.DecimalField(decimal_places=2, max_digits=20)),
                ('fecha_pago', models.DateField(default=django.utils.timezone.now)),
                ('comprobante', models.CharField(max_length=255)),
                ('factura', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='pagos', to='facturacion.factura')),
            ],
        ),
    ]
