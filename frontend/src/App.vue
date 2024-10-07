<template>
  <v-app>
    <v-main>
      <MainHeader/>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>
import MainHeader from './components/header/MainHeader.vue';
export default {
  name: 'App',
  components: {
    MainHeader, 
  },
  data: () => ({
    //
  }),
}
</script>

