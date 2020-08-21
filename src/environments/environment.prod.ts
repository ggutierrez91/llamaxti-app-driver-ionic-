export const environment = {
  production: true,
  URL_SERVER: 'https://admin.llamataxiperu.com',
  // URL_SERVER: 'http://192.168.1.40:3000',
  // OS_APP: 'caa68993-c7a5-4a17-bebf-6963ba72519b',
  // OS_KEY : 'YTE5MmRjYjQtMjRkZi00Y2Q0LThkZDMtYWY3YjEyNjg0NzRh',

  // nuevas credenciales grupo 8
  OS_APP: '8e919063-5003-4974-b566-b15a1da7eabe',
  OS_KEY : 'MGMwMzViY2YtMmJmYi00ZmZmLWJhZGMtNGQxY2EwMDQ2ZGRk',
  styleMapDiur: [
    {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ saturation: '-100'  }]
    },
    {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off'  }]
    },
    {
        featureType: 'poi',
        elementType: 'labels.text.stroke',
        stylers: [ { visibility: 'off' }]
    },
    {
        featureType: 'road',
        elementType: 'labels.text',
        stylers: [ { color: '#545454' }]
    },
    {
        featureType: 'road',
        elementType: 'labels.text.stroke',
        stylers: [ { visibility: 'off' }]
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry.fill',
        stylers: [ { saturation: '-87' }, { lightness: '-40' }, { color: '#ffffff'}]
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ visibility: 'off' }]
    },
    {
        featureType: 'road.highway.controlled_access',
        elementType: 'geometry.fill',
        stylers: [{ color: '#f0f0f0'}, { saturation: '-22'}, { lightness: '-16'} ]
    },
    {
        featureType: 'road.highway.controlled_access',
        elementType: 'geometry.stroke',
        stylers: [{ visibility: 'off' }]
    },
    {
        featureType: 'road.highway.controlled_access',
        elementType: 'labels.icon',
        stylers: [{ visibility: 'on' }]
    },
    {
        featureType: 'road.arterial',
        elementType: 'geometry.stroke',
        stylers: [{    visibility: 'off'}]
    },
    {
        featureType: 'road.local',
        elementType: 'geometry.stroke',
        stylers: [{    visibility: 'off'}]
    },
    {
        featureType: 'water',
        elementType: 'geometry.fill',
        stylers: [{    saturation: '-52'}, {hue: '#00e4ff'}, {lightness: '-16'} ]
    }
  ],
  // styleMapDiur: [
  //     {featureType: 'landscape', elementType: 'all', stylers: [{visibility: 'on'} ] },
  //     {featureType: 'poi.business', elementType: 'all', stylers: [{visibility: 'simplified'} ] },
  //     {featureType: 'poi.business', elementType: 'labels', stylers: [{visibility: 'simplified'} ] },
  //     {featureType: 'poi.park', elementType: 'all', stylers: [{visibility: 'off'} ] },
  //     {featureType: 'poi.school', elementType: 'all', stylers: [{visibility: 'on'} ] },
  //     {featureType: 'poi.sports_complex', elementType: 'all', stylers: [{visibility: 'off'} ] },
  //     {featureType: 'transit.station.bus', elementType: 'all', stylers: [{visibility: 'on'},
  //     {saturation: '21'}, {weight: '4.05'} ] }
  // ],

  styleMapNocturn: [
    {
      elementType: 'geometry',
      stylers: [
        {
          color: '#242f3e'
        }
      ]
    },
    {
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#746855'
        }
      ]
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [
        {
          color: '#242f3e'
        }
      ]
    },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#d59563'
        }
      ]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#d59563'
        }
      ]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [
        {
          color: '#263c3f'
        }
      ]
    },
    {
      featureType: 'poi.park',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#6b9a76'
        }
      ]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [
        {
          color: '#38414e'
        }
      ]
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [
        {
          color: '#212a37'
        }
      ]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#9ca5b3'
        }
      ]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [
        {
          color: '#746855'
        }
      ]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [
        {
          color: '#1f2835'
        }
      ]
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#f3d19c'
        }
      ]
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [
        {
          color: '#2f3948'
        }
      ]
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#d59563'
        }
      ]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [
        {
          color: '#17263c'
        }
      ]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [
        {
          color: '#515c6d'
        }
      ]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [
        {
          color: '#17263c'
        }
      ]
    }
  ],
};
