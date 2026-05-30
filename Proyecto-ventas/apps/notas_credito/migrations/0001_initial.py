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
            name='NotaCredito',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('numero', models.PositiveIntegerField(editable=False, unique=True)),
                ('motivo', models.CharField(choices=[('devolucion', 'Devolución'), ('descuento_posterior', 'Descuento posterior'), ('correccion', 'Corrección')], max_length=30)),
                ('monto', models.DecimalField(decimal_places=2, max_digits=20)),
                ('fecha', models.DateField(default=django.utils.timezone.now)),
                ('observaciones', models.TextField(blank=True, default='')),
                ('factura', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='notas_credito', to='facturacion.factura')),
            ],
        ),
    ]
