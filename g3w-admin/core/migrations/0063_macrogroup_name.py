# Generated by Django 2.2.9 on 2020-03-11 10:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0062_auto_20200302_0848'),
    ]

    operations = [
        migrations.AddField(
            model_name='macrogroup',
            name='name',
            field=models.CharField(help_text='Internal identification Macrogroup name', max_length=255, null=True, verbose_name='Identification name'),
        ),
    ]
