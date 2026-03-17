from django.db import migrations


def activate_self_registered_dealers(apps, schema_editor):
    Dealer = apps.get_model('core', 'Dealer')
    Dealer.objects.filter(
        is_approved=False,
        is_flagged=False,
        license_status='pending',
        license_number__startswith='PENDING_',
    ).update(is_approved=True, license_status='active')


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_dealer_core_dealer_is_appr_9e58b5_idx_and_more'),
    ]

    operations = [
        migrations.RunPython(activate_self_registered_dealers, migrations.RunPython.noop),
    ]
