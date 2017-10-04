<template>
  <v-toolbar fixed class="indigo darken-4" dark>
    <!--<v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>-->
    <v-toolbar-title v-if='isLogged'>
          {{ title }}
    </v-toolbar-title>
    <v-spacer></v-spacer>
      <v-btn v-if='!isLogged' icon dark to="/login" v-tooltip:left="{ html: 'Iniciar Sesión' }">
        <v-icon>account_circle</v-icon>
      </v-btn>
      <v-btn v-if='isLogged' icon dark @click="logout" v-tooltip:left="{ html: 'Cerrar Sesión' }">
        <v-icon>account_circle</v-icon>
      </v-btn>
  </v-toolbar>
</template>
<script>
import axios from 'axios';
export default {
  name: 'ToolBar',
  props: {
    title: {
      type: String,
      default: '',
    },
    isLogged: false,
    router: {},
    href :{}
  },
  data: () => ({
    drawer: true,
    usermenus: [
      { title: 'Mi Cuenta'},
      { title: 'Cerrar Sesión'}
    ],
    routes: {
        href: 'login',
        router: true,
        title: 'Home'
    },
    mini: false,
    right: null
  }),
  methods: {
    logout () {
      console.log("entro");
      let self = this;
      axios.get('/api/logout').then(({ data }) => {
        if(data.estado == 'ok'){
          this.alert = false;
          location.reload();
          self.$router.push('/');
        }
      });
    }
  },
}
</script>
<style>
.none-underline {
      text-decoration: none !important;
}
</style>
