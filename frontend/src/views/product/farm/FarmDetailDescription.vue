<template>
    <!-- Main Container -->
    <v-container class="text-center">

      
      <!-- Navigation Links -->
       <FarmMenuComponent
       :currentMenu="1"/>

    </v-container>
  </template>
  
  <script>
import FarmMenuComponent from '@/components/menubar/FarmMenuComponent.vue';

  export default {
    components: {
      FarmMenuComponent
    },
    data() {
      return {};
    }
  };
  </script>
  
  <style scoped>
  .banner-image {
    border-radius: 12px;
  }
  
  .nav-link {
    font-weight: bold;
    font-size: 18px;
  }
  </style>
  