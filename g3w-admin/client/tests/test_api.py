# coding=utf-8
""""Tests for client module API

.. note:: This program is free software; you can redistribute it and/or modify
    it under the terms of the Mozilla Public License 2.0.

"""

__author__ = 'elpaso@itopen.it'
__date__ = '2019-06-03'
__copyright__ = 'Copyright 2019, Gis3w'

import os
import json
from django.conf import settings
from django.test import override_settings
from qdjango.models import Project
from django.core.cache import caches
from core.tests.base import CoreTestBase
from core.models import MacroGroup
from core.utils.structure import FIELD_TYPES_MAPPING

# Re-use test data from qdjango module
DATASOURCE_PATH = os.path.join(os.getcwd(), 'qdjango', 'tests', 'data')

@override_settings(MEDIA_ROOT=DATASOURCE_PATH)
@override_settings(DATASOURCE_PATH=DATASOURCE_PATH)
class ClientApiTest(CoreTestBase):
    """Test client API"""

    # These are stored in core module
    fixtures = CoreTestBase.fixtures + [
        # except for this one which is in qdjango:
        "G3WSampleProjectAndGroup.json",
    ]

    @classmethod
    def setUpClass(cls):
        super(ClientApiTest, cls).setUpClass()

        # Fill the cache with getprojectsettings response so we don't need a QGIS instance running
        # TODO: eventually move to QgsServer
        cls.prj_test = Project.objects.get(title='Un progetto')

        # new properties has to save before caching, signal on svaing project invalidate cache['django']

        cls.prj_test.thumbnail = '/fake/project.png'
        cls.prj_test.save()



        cache_key = settings.QDJANGO_PRJ_CACHE_KEY.format(cls.prj_test.pk)
        cache = caches['qdjango']
        cache.set(cache_key, open(os.path.join(DATASOURCE_PATH, 'getProjectSettings_gruppo-1_un-progetto_qgis310.xml'),
                                  'rb').read())

    def testGroupConfigApiView(self):
        """Test call to config"""

        response = self._testApiCall('group-map-config', ['gruppo-1', 'qdjango', '1'])
        resp = json.loads(response.content)
        self.assertEqual(resp["vectorurl"], "/vector/api/")
        self.assertEqual(resp["group"]["crs"], 4326)
        self.assertEqual(resp["group"]["proj4"], "+proj=longlat +datum=WGS84 +no_defs ")
        self.assertEqual(resp["group"]["mapcontrols"], ['zoomtoextent', 'zoom', 'zoombox', 'query', 'querybbox', 'querybypolygon', 'overview', 'scaleline', 'geolocation', 'streetview', 'nominatim', 'addlayers', 'length', 'area', 'mouseposition', 'scale'])
        self.assertEqual(resp["group"]["header_logo_img"], "logo_img/qgis-logo.png")
        self.assertEqual(resp["group"]["name"], "Gruppo 1")
        self.assertIsNone(resp["group"]["header_logo_link"])
        self.assertEqual(resp["group"]["initproject"], "qdjango:1")
        self.assertEqual(resp["group"]["header_terms_of_use_link"], "")
        self.assertTrue(resp["group"]["powered_by"])
        self.assertEqual(resp["group"]["baselayers"], [{'crs': 3857, 'servertype': 'OSM', 'attribution': "<a href='https://www.openstreetmap.org/copyright'>OpenStreetMap contributors</a>", 'name': 'OpenStreetMap', 'title': 'OSM', 'scalebasedvisibility': False, 'maxscale': 0, 'minscale': 100000000, 'id': 3, 'icon': None}])
        self.assertEqual(resp["group"]["header_terms_of_use_text"], "")
        self.assertEqual(resp["group"]["header_custom_links"], [])
        self.assertEqual(resp["group"]["background_color"], "#ffffff")
        self.assertEqual(resp["group"]["id"], 1)
        self.assertEqual(resp["group"]["slug"], 'gruppo-1')
        self.assertEqual(len(resp["group"]["projects"]), 1)

        project = resp["group"]["projects"][0]
        to_compare = {'description': '<p>progetto 1<br></p>', 'title': 'Un progetto',
          'thumbnail': '/fake/project.png', 'gid': 'qdjango:1', 'type': 'qdjango', 'id': 1}
        for k in list(to_compare.keys()):
            self.assertEqual(project[k], to_compare[k])

        self.assertIsNone(resp["group"]["overviewproject"])
        self.assertIsNone(resp["main_map_title"])
        self.assertEqual(resp["mediaurl"], "/media/")
        self.assertEqual(resp["baseurl"], "/")
        self.assertEqual(resp["credits"], "/en/credits/")
        self.assertEqual(resp["client"], "client/")
        self.assertEqual(resp["staticurl"], "/static/")
        self.assertEqual(resp["user"]["username"], "admin01")
        self.assertEqual(resp["user"]["first_name"], "")
        self.assertEqual(resp["user"]["last_name"], "")
        self.assertEqual(resp["user"]["admin_url"], "/en/")
        self.assertEqual(resp["user"]["logout_url"], "/en/logout/?next=/en/map/gruppo-1/qdjango/1/")
        self.assertEqual(resp["user"]["groups"], [])
        self.assertEqual(resp["user"]["i18n"], "en")
        self.assertEqual(resp["g3wsuite_logo_img"], "g3wsuite_logo_h40.png")
        self.assertEqual(resp['i18n'], json.loads(json.dumps(settings.LANGUAGES)))


    def testClientConfigApiView(self):
        """Test call to project config"""

        response = self._testApiCall('group-project-map-config', ['gruppo-1', 'qdjango', '1'])
        resp = json.loads(response.content)

        self.assertEqual(resp["layerstree"], [
            {'visible': True, 'expanded': False, 'name': 'spatialite_points',
             'id': 'spatialite_points20190604101052075'},
            {'visible': True, 'expanded': False, 'name': 'world', 'id': 'world20181008111156525'},
            {'visible': True, 'expanded': True, 'name': 'bluemarble', 'id': 'bluemarble20181008111156906'}])
        self.assertEqual(resp["search"], [])
        self.assertFalse(resp["wms_use_layer_ids"])
        self.assertEqual(resp["qgis_version"], "2.18.16")
        self.assertEqual(resp["no_legend"], [])
        self.assertEqual(resp["feature_count"], 5)
        self.assertEqual(resp["widget"], [])
        self.assertEqual(resp["relations"], [])
        self.assertEqual(resp["id"], 1)
        self.assertEqual(resp["initextent"], [-189.0, -130.14542038524587, 189.0, 123.92015338524588])
        self.assertEqual(resp["extent"], [-189.0, -130.14542038524587, 189.0, 123.92015338524588])
        self.assertEqual(resp["ows_method"], "GET")
        self.assertEqual(resp["print"], [])
        self.assertEqual(resp["querymultilayers"], [])
        self.assertEqual(resp["initbaselayer"], 3)
        self.assertEqual(resp["metadata"]["accessconstraints"], "copyright")
        self.assertEqual(resp["metadata"]["name"], "WMS")
        self.assertEqual(resp["metadata"]["title"], "Yet another WMS serving anything")
        self.assertEqual(resp["metadata"]["abstract"], "Lorem ipsum sit amet")
        self.assertEqual(resp["metadata"]["contactinformation"]["contactelectronicmailaddress"], "mail@email.com")
        self.assertEqual(resp["metadata"]["contactinformation"]["contactvoicetelephone"], "1234578")
        #self.assertEqual(resp["metadata"]["wms_url"], "")
        self.assertEqual(resp["metadata"]["fees"], "no conditions apply")
        self.assertEqual(resp["metadata"]["keywords"], ['infoMapAccessService', 'keyword1', 'keyword2'])
        self.assertEqual(resp["thumbnail"], '/media/fake/project.png')
        self.assertEqual(resp["name"], "Un progetto")

        # check for layers and fields
        self.assertEqual(len(resp['layers']), 3)
        for l in resp['layers']:
            if l['id'] == 'world20181008111156525':

                # check fields
                self.assertEqual(len(l['fields']), 5)
                self.assertEqual([
                    {'name': 'NAME', 'type': FIELD_TYPES_MAPPING['QSTRING'], 'label': 'NAME', 'show': True},
                    {'name': 'CAPITAL', 'type': FIELD_TYPES_MAPPING['QSTRING'], 'label': 'CAPITAL', 'show': True},
                    {'name': 'APPROX', 'type': FIELD_TYPES_MAPPING['QLONGLONG'], 'label': 'APPROX', 'show': True},
                    {'name': 'AREA', 'type': FIELD_TYPES_MAPPING['DOUBLE'], 'label': 'AREA', 'show': True},
                    {'name': 'SOURCETHM', 'type': FIELD_TYPES_MAPPING['QSTRING'], 'label': 'SOURCETHM', 'show': True}]
                , l['fields'])

            if l['id'] == 'spatialite_points20190604101052075':

                # check fields
                self.assertEqual(len(l['fields']), 2)
                self.assertEqual([
                    {'name': 'pkuid', 'type': FIELD_TYPES_MAPPING['QLONGLONG'], 'label': 'pkuid', 'show': True},
                    {'name': 'name', 'type': FIELD_TYPES_MAPPING['QSTRING'], 'label': 'name', 'show': True}]
                , l['fields'])

    def testClientConfigApiThumbnailView(self):
        """ Test api project config for thumbnail param """

        response = self._testApiCall('group-project-map-config', ['gruppo-1', 'qdjango', '1'])
        resp = json.loads(response.content)
        self.assertEqual(resp["thumbnail"], '/media/fake/project.png')

        # add group to macrogroup
        macrogorup = MacroGroup(name='thgroup_test', title='thgroup_test', logo_img='/fake/macrogroup.png')
        macrogorup.save()
        macrogorup.group_set.add(self.prj_test.group)

        response = self._testApiCall('group-project-map-config', ['gruppo-1', 'qdjango', '1'])
        resp = json.loads(response.content)
        self.assertEqual(resp["thumbnail"], '/media/fake/project.png')

        # Check use_logo_client
        macrogorup.use_logo_client = True
        macrogorup.save()

        response = self._testApiCall('group-project-map-config', ['gruppo-1', 'qdjango', '1'])
        resp = json.loads(response.content)
        self.assertEqual(resp["thumbnail"], '/media/fake/macrogroup.png')
