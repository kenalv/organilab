# -*- coding: utf-8 -*-
# Generated by Django 1.11.15 on 2018-10-12 21:24
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('printOrderManager', '0006_auto_20181011_1157'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='printobject',
            options={'ordering': ('pk',), 'permissions': (('changeInformation_printObject', 'Can edit the print information'),), 'verbose_name': 'Print', 'verbose_name_plural': 'Printers'},
        ),
    ]