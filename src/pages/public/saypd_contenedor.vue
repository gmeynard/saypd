<template>
  <v-app toolbar>
    <v-navigation-drawer v-if="isLogged" absolute persistent light :mini-variant.sync="mini" v-model="drawer" overflow>
      <v-toolbar flat class="transparent">
        <v-list class="pa-0">
          <v-list-tile avatar tag="div">
            <v-list-tile-avatar>
              <img src="../images/alert.jpg" />
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>Portal SAYPD</v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-btn icon @click.native.stop="mini = !mini">
                <v-icon>chevron_left</v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
      </v-toolbar>
      <v-list>
        <v-divider></v-divider>
        <v-list-item v-for="item in items" :key="item.title">
            <v-list-tile :to="item.to" :router="item.router">
                <v-list-tile-action>
                    <v-icon indigo v-html="item.icon"></v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                    <v-list-tile-title v-html="item.title"></v-list-tile-title>
                </v-list-tile-content>
            </v-list-tile>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar fixed class="indigo darken-4" dark>
      <v-toolbar-side-icon v-if='isLogged' @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title v-if='isLogged'>
            {{ title }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
        <v-btn v-if='!isLogged' icon dark to="/login" v-tooltip:left="{ html: 'Iniciar Sesión' }">
          <v-icon>account_circle</v-icon>
        </v-btn>
        <v-flex v-if='isLogged' xs4>{{usuario.name}} {{usuario.lastname}}</v-flex>
        <v-btn v-if='isLogged' icon dark @click="logout" v-tooltip:left="{ html: 'Cerrar Sesión' }">
          <v-icon>account_circle</v-icon>
        </v-btn>
    </v-toolbar>
    <main>
      <router-view></router-view>
    </main>
  </v-app>
</template>

<script>
  import ToolBar from '../../common/saypd_toolbar.vue';
  import MenuSaypd from '../../common/saypd_menu.vue';
  import axios from 'axios';

  export default {
    name: 'AlertaHome',
    data: () => ({
      isLogged: false,
      usuario: {},
      drawer: true,
      items: [
        { title: 'Alertas', icon: 'info' , to: '/alerts', router: true },
        { title: 'Sensores', icon: 'featured_play_list' },
        { title: 'Proyectos', icon: 'archive', to: '/proyectos', router: true },
        { title: 'Clientes', icon: 'account_circle' },
        { divider: true },

        { title: 'Usuarios', icon: 'account_circle', to: '/users' },
        { title: 'Configuración', icon: 'settings' }
      ],
      mini: false,
      right: null
    }),
    beforeMount() {
      //console.log(this.$vm.isLogged);
      axios.get('/api/usuario').then(({ data: usuarioData }) => {
        this.usuario = usuarioData.user;
        if(this.usuario != null){
          this.isLogged = true;
        }
      });
    },
    components: {
      MenuSaypd,
      ToolBar,
    },
    methods: {
      logout () {
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
  };
</script>
