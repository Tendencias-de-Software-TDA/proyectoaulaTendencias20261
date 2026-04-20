from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pagos', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='pago',
            name='medio_pago',
            field=models.CharField(
                choices=[
                    ('efectivo', 'Efectivo'),
                    ('transferencia', 'Transferencia'),
                    ('tarjeta', 'Tarjeta'),
                    ('otro', 'Otro'),
                ],
                max_length=30,
            ),
        ),
    ]
