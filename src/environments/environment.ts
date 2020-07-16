// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // URL_SERVER: 'https://admin.llamataxiperu.com',
  URL_SERVER: 'http://192.168.1.40:3000',
  OS_APP: 'caa68993-c7a5-4a17-bebf-6963ba72519b',
  OS_KEY : 'YTE5MmRjYjQtMjRkZi00Y2Q0LThkZDMtYWY3YjEyNjg0NzRh',
  styleMapDiur: [
      {"featureType": "landscape", "elementType": "all", "stylers": [{"visibility": "on"} ] },
      {"featureType": "poi.business", "elementType": "all", "stylers": [{"visibility": "simplified"} ] },
      {"featureType": "poi.business", "elementType": "labels", "stylers": [{"visibility": "simplified"} ] },
      {"featureType": "poi.park", "elementType": "all", "stylers": [{"visibility": "off"} ] },
      {"featureType": "poi.school", "elementType": "all", "stylers": [{"visibility": "on"} ] },
      {"featureType": "poi.sports_complex", "elementType": "all", "stylers": [{"visibility": "off"} ] },
      {"featureType": "transit.station.bus", "elementType": "all", "stylers": [{"visibility": "on"},
      {"saturation": "21"}, {"weight": "4.05"} ] }
  ],

  styleMapNocturn: [
      {"featureType": "all", "elementType": "all", "stylers": [{"invert_lightness": true },
      {"saturation": "-9"}, {"lightness": "0"}, {"visibility": "simplified"} ] },
      {"featureType": "landscape.man_made", "elementType": "all", "stylers": [{"weight": "1.00"} ] },
      {"featureType": "road.highway", "elementType": "all", "stylers": [{"weight": "0.49"} ] },
      {"featureType": "road.highway", "elementType": "labels", "stylers": [{"visibility": "on"},
      {"weight": "0.01"}, {"lightness": "-7"}, {"saturation": "-35"} ] },
      {"featureType": "road.highway", "elementType": "labels.text", "stylers": [{"visibility": "on"} ] },
      {"featureType": "road.highway", "elementType": "labels.text.stroke", "stylers": [{"visibility": "off"} ] },
      {"featureType": "road.highway", "elementType": "labels.icon", "stylers": [{"visibility": "on"} ] } 
  ],
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
