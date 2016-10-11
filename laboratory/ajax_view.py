'''
Created on /8/2016

@author: natalia
'''
from laboratory.models import Furniture, Shelf, ShelfObject, ObjectFeatures
from django.template.loader import render_to_string
from django_ajax.decorators import ajax
from django_ajax.mixin import AJAXMixin
from django.views.generic.edit import CreateView, DeleteView, UpdateView
from django.urls.base import reverse_lazy
from django.http.response import HttpResponseRedirect
from django.template.context_processors import request

from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
import json
from django.db.models.query import QuerySet
from django import forms


@login_required
def list_furniture_render(request):

    var = request.GET.get('namelaboratoryRoom', '0')

    if var:
        furnitures = Furniture.objects.filter(labroom=var)
    else:
        furnitures = Furniture.objects.all()
    return render_to_string(
        'laboratory/furniture_list.html',
        context={
            'object_list': furnitures
        })


@login_required
@ajax
def list_furniture(request):
    return {
        'inner-fragments': {
            '#furnitures': list_furniture_render(request),
            '.jsmessage': "<script>see_prototype_shelf_field();</script>"

        },
    }
    

def get_shelves(furniture):

    if type(furniture) == QuerySet:
        furniture = furniture[0]

    if furniture.dataconfig:
        dataconfig = json.loads(furniture.dataconfig)
        # hacer algo para pasar de num a shelf
        for crow, row in enumerate(dataconfig):
            for ccol, col in enumerate(row):
                if dataconfig[crow][ccol]:
                    dataconfig[crow][ccol] = Shelf.objects.filter(
                        pk__in=col.split(","))

        return dataconfig
    return []


@login_required
def list_shelf_render(request):
    var = request.GET.get('furniture', '0')
    furniture = Furniture.objects.filter(pk=var)
    shelf = get_shelves(furniture)

    return render_to_string(
        'laboratory/shelf_list.html',
        context={
            'object_list': shelf
        })


@login_required
@ajax
def list_shelf(request):
    return {
        'inner-fragments': {
            '#shelf': list_shelf_render(request)

        },
    }


@login_required
def list_shelfobject_render(request, shelf=0, row=0, col=0):
    if shelf == 0:
        var = request.GET.get('shelf', '0')
    else:
        var = shelf
    if var:
        shelfobject = ShelfObject.objects.filter(object=var)
    else:
        shelfobject = ShelfObject.objects.all()
    return render_to_string(
        'laboratory/shelfObject_list.html',
        context={
            'object_list': shelfobject,
            'data':  Shelf.objects.get(pk=shelf),
            'row': row,
            'col': col
        })


@login_required
@ajax
def list_shelfobject(request):
    return {
        'inner-fragments': {
            '#shelfobject': list_shelfobject_render(request),
            '#shelfposition': request.GET.get('shelf', '0'),
            '#shelfposition1': request.GET.get('shelf', '0')

        },
    }


class ShelfObjectForm(forms.ModelForm):
    col = forms.IntegerField(widget=forms.HiddenInput)
    row = forms.IntegerField(widget=forms.HiddenInput)

    class Meta:
        model = ShelfObject
        fields = "__all__"
        widgets = {
            'shelf': forms.HiddenInput,
        }


class ShelfObjectFormUpdate(forms.ModelForm):
    col = forms.IntegerField(widget=forms.HiddenInput)
    row = forms.IntegerField(widget=forms.HiddenInput)

    class Meta:
        model = ShelfObject
        fields = ['shelf', 'quantity', 'measurement_unit']
        widgets = {
            'shelf': forms.HiddenInput,
        }


@method_decorator(login_required, name='dispatch')
class ShelfObjectCreate(AJAXMixin, CreateView):
    model = ShelfObject
    form_class = ShelfObjectForm
    success_url = reverse_lazy('laboratory:list_shelf')

    def form_valid(self, form):
        self.object = form.save()
        row = form.cleaned_data['row']
        col = form.cleaned_data['col']
        return {
            'inner-fragments': {
                '#row_%d_col_%d_shelf_%d' % (row, col, self.object.shelf.pk): list_shelfobject_render(
                    self.request, self.object.shelf.pk, row, col),
                "#closemodal": '<script>$("#object_create").modal("hide");</script>'
            },
        }

    def get_form_kwargs(self):
        kwargs = CreateView.get_form_kwargs(self)
        kwargs['initial']['shelf'] = self.request.GET.get('shelf')
        kwargs['initial']['row'] = self.request.GET.get('row')
        kwargs['initial']['col'] = self.request.GET.get('col')
        return kwargs


@method_decorator(login_required, name='dispatch')
class ShelfObjectEdit(AJAXMixin, UpdateView):
    model = ShelfObject
    form_class = ShelfObjectFormUpdate
    success_url = reverse_lazy('laboratory:list_shelf')

    def form_valid(self, form):
        self.object = form.save()
        row = form.cleaned_data['row']
        col = form.cleaned_data['col']
        return {
            'inner-fragments': {
                '#row_%d_col_%d_shelf_%d' % (row, col, self.object.shelf.pk): list_shelfobject_render(
                    request, self.object.shelf.pk, row, col),
                "#closemodal": '<script>$("#object_update").modal("hide");</script>'
            },
        }

    def get_form_kwargs(self):
        kwargs = CreateView.get_form_kwargs(self)
        kwargs['initial']['shelf'] = self.request.GET.get('shelf')
        kwargs['initial']['row'] = self.request.GET.get('row')
        kwargs['initial']['col'] = self.request.GET.get('col')
        print('---kwargs')
        print(kwargs)
        return kwargs


@method_decorator(login_required, name='dispatch')
class ShelfObjectDelete(AJAXMixin, DeleteView):
    model = ShelfObject
    success_url = reverse_lazy('laboratory:list_shelf')

    def get_context_data(self, **kwargs):
        context = DeleteView.get_context_data(self, **kwargs)
        context['row'] = self.row
        context['col'] = self.col
        return context

    def get(self, request, *args, **kwargs):
        self.row = request.GET.get("row")
        self.col = request.GET.get("col")
        return DeleteView.get(self, request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        self.row = request.POST.get("row")
        self.col = request.POST.get("col")
        response = DeleteView.post(self, request, *args, **kwargs)

        return {
            'inner-fragments': {
                '#row_%s_col_%s_shelf_%d' % (self.row, self.col, self.object.shelf.pk): list_shelfobject_render(
                    request, self.object.shelf.pk),
                "#closemodal": '<script>$("#object_delete").modal("hide");</script>'
            },
        }
        return response


@login_required
def admin_list_shelf_render(request):
    shelves = Shelf.objects.all()
    return render_to_string(
        'laboratory/admin_shelf_list.html',
        context={
            'object_list': shelves
        })


@login_required
@ajax
def admin_list_shelf(request):
    return {
        'inner-fragments': {
            '#shelves': list_shelf_render(request)
        },
    }


@method_decorator(login_required, name='dispatch')
class ShelvesCreate(AJAXMixin, CreateView):
    model = Shelf
    fields = "__all__"
    success_url = reverse_lazy('laboratory:list_shelf')

    def post(self, request, *args, **kwargs):
        response = CreateView.post(self, request, *args, **kwargs)

        if type(response) == HttpResponseRedirect:
            return list_shelf_render(request)

        return response


@login_required
def list_objectfeatures_render(request):
    objectfeatures = ObjectFeatures.objects.all()
    return render_to_string(
        'laboratory/objectfeatures_list.html',
        context={
            'object_list': objectfeatures
        })


@login_required
@ajax
def list_objectfeatures(request):
    return {
        'inner-fragments': {
            '#objectfeatures': list_objectfeatures_render(request)
        },
    }


@method_decorator(login_required, name='dispatch')
class ObjectFeaturesCreate(AJAXMixin, CreateView):
    model = ObjectFeatures
    fields = "__all__"
    success_url = reverse_lazy('laboratory:objectfeatures_list')

    def post(self, request, *args, **kwargs):
        response = CreateView.post(self, request, *args, **kwargs)

        if type(response) == HttpResponseRedirect:
            return list_objectfeatures_render(request)

        return response
