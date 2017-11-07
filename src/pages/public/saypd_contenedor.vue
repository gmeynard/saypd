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
        <template v-for="(item, i) in items">
          <v-layout
            row
            v-if="item.heading && (usuario.perfil == item.perfil || item.perfil == 'ALL')"
            align-center
            :key="i"
          >
            <v-flex xs6>
              <v-subheader v-if="item.heading">
                {{ item.heading }}
              </v-subheader>
            </v-flex>
          </v-layout>
          <v-divider
            dark
            v-else-if="item.divider"
            class="my-4"
            :key="i"
          ></v-divider>
          <v-list-tile
            :key="i"
            v-else-if="(usuario.perfil == item.perfil || item.perfil == 'ALL')"
            :to="item.to" :router="item.router"
          >
            <v-list-tile-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title >
                {{ item.title }}
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </template>
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
        { title: 'Alertas', icon: 'warning' , to: '/alerts', router: true, perfil :'ALL' },
        { title: 'Sensores', icon: 'featured_play_list', perfil :'ALL' },
        { title: 'Proyectos', icon: 'archive', to: '/proyectos', router: true, perfil :'ALL' },
        { divider: true },
        { heading: 'Configuración', perfil : 'SISTEMA'},
        { title: 'Usuarios', icon: 'account_circle', to: '/users', perfil : 'SISTEMA' },
        { title: 'Clientes', icon: 'account_circle', to: '/clients',perfil : 'SISTEMA' },
        { title: 'Tipo Alertas', icon: 'warning', to: '/listTypeAlert', perfil : 'SISTEMA'  },
        { title: 'Tipo Notificacion', icon: 'mail', to: '/listTypeNotification', perfil : 'SISTEMA'},
        { title: 'Suscripciones', icon: 'mail', to: '/listSupcriptions', perfil : 'SISTEMA'  },
        { heading: 'Programacion', perfil : 'SISTEMA'},
        { title: 'Funciones', icon: 'functions', to: '/listFunction', perfil : 'SISTEMA'  },
        { title: 'Ejecuciones Internas', icon: 'play_circle_outline', to: '/listExecution', perfil : 'SISTEMA'  },
        { title: 'Acciones', icon: 'view_list', to: '/listAction', perfil : 'SISTEMA'  }
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
