# Generated by Django 2.2.3 on 2019-08-09 00:31

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='LiveMatch',
            fields=[
                ('id', models.CharField(max_length=32, primary_key=True, serialize=False)),
                ('start_time', models.DateField(auto_now=True)),
                ('player1_is_connected', models.BooleanField(default=False)),
                ('player2_is_connected', models.BooleanField(default=False)),
                ('player1_move', models.CharField(choices=[('ROCK', 'ROCK'), ('PAPER', 'PAPER'), ('SCISSORS', 'SCISSORS'), ('LIZARD', 'LIZARD'), ('SPOCK', 'SPOCK')], max_length=20, null=True)),
                ('player2_move', models.CharField(choices=[('ROCK', 'ROCK'), ('PAPER', 'PAPER'), ('SCISSORS', 'SCISSORS'), ('LIZARD', 'LIZARD'), ('SPOCK', 'SPOCK')], max_length=20, null=True)),
                ('player1', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='livematch_as_p1', to=settings.AUTH_USER_MODEL)),
                ('player2', models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='livematch_as_p2', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]