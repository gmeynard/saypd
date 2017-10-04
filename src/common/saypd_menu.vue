
<template>
  <v-navigation-drawer v-if="isLogged" absolute persistent light :mini-variant.sync="mini" v-model="drawer" overflow>
    <v-toolbar flat class="transparent">
      <v-list class="pa-0">
        <v-list-tile avatar tag="div">
          <v-list-tile-avatar>
            <img src="../images/alert.jpg" />
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title>{{usuario.fullname}}</v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-btn icon @click.native.stop="mini = !mini">
              <v-icon>chevron_left</v-icon>
            </v-btn>
          </v-list-tile-action>
        </v-list-tile>
      </v-list>
    </v-toolbar>
    <v-list class="pt-0" dense>
      <v-divider></v-divider>
      <v-list-item v-for="item in items" :key="item.title">
        <v-layout row v-if="item.heading" align-center:key="i">
          <v-flex xs6>
            <v-subheader v-if="item.heading">
              {{ item.heading }}
            </v-subheader>
          </v-flex>
        </v-layout>
        <v-divider dark v-if="item.divider"></v-divider>
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
</template>
<script>
export default {
  name: 'MenuSaypd',
  props: {
    isLogged: false,
    usuario :{}
  },
  data: () => ({
    drawer: true,
    items: [
      { title: 'Alertas', icon: 'info' , to: '/alerts', router: true },
      { title: 'Sensores', icon: 'featured_play_list' },
      { title: 'Proyectos', icon: 'archive', to: '/proyectos', router: true },
      { title: 'Clientes', icon: 'account_circle' },
      { divider: true },
      { heading: 'Configuración'},
      { title: 'Usuarios', icon: 'account_circle', to: '/users' },
      { title: 'Configuración', icon: 'settings' }
    ],
    mini: false,
    right: null
  }),
}
</script>
