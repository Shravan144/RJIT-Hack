from django.db import migrations, models
from django.db.models import Count
import django.contrib.auth.validators


def blank_email_to_null(apps, schema_editor):
    CustomUser = apps.get_model('users', 'CustomUser')

    for user in CustomUser.objects.filter(email='').only('id'):
        user.email = f'legacy-{user.id}@local.invalid'
        user.save(update_fields=['email'])

    duplicate_groups = CustomUser.objects.values('email').annotate(total=Count('id')).filter(total__gt=1)
    for group in duplicate_groups:
        duplicate_ids = list(
            CustomUser.objects.filter(email=group['email']).order_by('id').values_list('id', flat=True)
        )
        if len(duplicate_ids) > 1:
            for user_id in duplicate_ids[1:]:
                CustomUser.objects.filter(id=user_id).update(email=f'legacy-dup-{user_id}@local.invalid')


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(blank_email_to_null, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='customuser',
            name='username',
            field=models.CharField(
                error_messages={
                    'invalid': 'Enter a valid username. This value may contain only letters, numbers, and @/./+/-/_ characters.'
                },
                help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.',
                max_length=150,
                validators=[django.contrib.auth.validators.UnicodeUsernameValidator()],
            ),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='email',
            field=models.EmailField(blank=True, max_length=254, null=True, unique=True, verbose_name='email address'),
        ),
    ]
