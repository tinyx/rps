# Generated by Django 2.2.5 on 2019-09-06 22:04

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_auto_20190906_2204'),
        ('livematch', '0002_auto_20190904_0128'),
    ]

    operations = [
        migrations.AddField(
            model_name='livematch',
            name='config',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, to='core.MatchConfig'),
        ),
    ]