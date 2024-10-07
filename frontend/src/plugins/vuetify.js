// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

// Vuetify
import { createVuetify } from 'vuetify'
// mdi 이모지
import { mdi } from 'vuetify/iconsets/mdi'; 

export default createVuetify({
  components,
  directives,
  theme: {
      themes: {
          light: {
              dark: false,
              colors: {
                  light_green: "#DBE098",
                  deep_green: "#BCC07B",
                  yellow: "#FFE2A6",
                  light_orange: "#FFCC80",
                  deep_orange: "#FFAF6E",
              }
          },
      },
  },  
  icons: {
  defaultSet: 'mdi',
  sets: {
      mdi,
  }
  },
  
});
