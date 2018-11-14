from django.urls import reverse
import re
from core.utils.structure import FORM_FIELD_TYPE_CHECK, FORM_FIELD_TYPE_SELECT, FORM_FIELD_TYPE_SELECT_AUTOCOMPLETE

# add form input type based on qgis edittypes
FORM_FIELD_TYPE_QGIS_DATETIME = 'datetimepicker'
FORM_FIELD_TYPE_QGIS_RANGE = 'range'
FORM_FIELD_TYPE_QGIS_UNIQUE_VALUE = 'unique'
FORM_FIELD_TYPE_QGIS_EXTERNAL_RESOURCE = 'media'


class QgisEditType(object):
    """
    Class to read edittype project settings and return client editing form structure
    """
    def __init__(self, **kwargs):

        for key, value in kwargs.items():
            setattr(self, key, value)

    @property
    def input_form(self):
        return dict()


class QgisEditTypeCheckBox(QgisEditType):
    """
    Class to read check-box edittype.
    """

    field_type = FORM_FIELD_TYPE_CHECK

    @property
    def input_form(self):
        return {
            'input': {
                'type': self.field_type,
                'options': [
                    {'value': self.CheckedState, 'checked': True},
                    {'value': self.UncheckedState, 'checked': False},
                ]
            }
        }


class QgisEditTypeDateTime(QgisEditType):
    """
    Class to read check-box edittype.
    """

    field_type = FORM_FIELD_TYPE_QGIS_DATETIME

    @property
    def input_form(self):

        return {
            'input': {
                'type': self.field_type,
                'options': [
                    {
                        'date': bool(len(re.findall('/yyyy|MM|dd/', self.field_format))),
                        'time': bool(len(re.findall('/HH|mm|ss/', self.field_format))),
                        'fieldformat': self.field_format,
                        'displayformat': self.display_format,
                        'default': self.default if hasattr(self, 'default') else None
                    },

                ]
            }
        }


class QgisEditTypeRange(QgisEditType):
    """
    Class to read check-box edittype.
    """

    field_type = FORM_FIELD_TYPE_QGIS_RANGE

    @property
    def input_form(self):

        return {
            'input': {
                'type': self.field_type,
                'options': [
                    {
                        'min': self.Min,
                        'max': self.Max,
                        'Step': self.Step,
                        'default': self.default if hasattr(self, 'default') else None
                    },

                ]
            }
        }


class QgisEditTypeValueMap(QgisEditType):
    """
    Class to read check-box edittype.
    """

    field_type = FORM_FIELD_TYPE_SELECT

    @property
    def input_form(self):

        return {
            'input': {
                'type': self.field_type,
                'options': {
                    'values': self.values,
                    'default': self.default if hasattr(self, 'default') else None
                }
            }
        }


class QgisEditTypeValueRelation(QgisEditTypeValueMap):
    """
    Class for Vluer relation and autocomplete.
    """

    field_type = FORM_FIELD_TYPE_SELECT_AUTOCOMPLETE

    @property
    def input_form(self):

        input_form = super(QgisEditTypeValueRelation, self).input_form

        # add params for get value
        input_form['input']['options'].update({
            'key': self.Value,
            'value': self.Key,
            'usecompleter': True if self.UseCompleter == '1' else False,
            'layer_id': self.Layer
        })

        return input_form


class QgisEditTypeUniqueValue(QgisEditType):
    """
    Class to read unique_value edittype.
    """

    field_type = FORM_FIELD_TYPE_QGIS_UNIQUE_VALUE

    @property
    def input_form(self):

        return {
            'input': {
                'type': self.field_type,
                'options': {
                    'values': list(),
                    'editable': True if self.fieldEditable == '1' else False,
                    'default': self.default if hasattr(self, 'default') else None
                }
            }
        }


class QgisEditTypeExternalResource(QgisEditType):
    """
    Class to read external_resource edittype.
    """

    field_type = FORM_FIELD_TYPE_QGIS_EXTERNAL_RESOURCE

    @property
    def input_form(self):

        # try to get url
        try:
            upload_url = reverse('editing-upload')
        except:
            upload_url = None

        return {
            'input': {
                'type': self.field_type,
                'options': {
                    'editable': True if self.fieldEditable == '1' else False,
                    'uploadurl': upload_url,
                    'default': self.default if hasattr(self, 'default') else None

                }
            }
        }


MAPPING_EDITTYPE_QGISEDITTYPE = {
    'CheckBox': QgisEditTypeCheckBox,
    'DateTime': QgisEditTypeDateTime,
    'Range': QgisEditTypeRange,
    'ValueMap': QgisEditTypeValueMap,
    'UniqueValues': QgisEditTypeUniqueValue,
    'ExternalResource': QgisEditTypeExternalResource,
    'ValueRelation': QgisEditTypeValueRelation
}

