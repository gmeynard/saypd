<template>
  <v-container fluid>
    <v-card flat tile>
      <AlertaList :data='alertas' :headers='headers' title='Alertas'></AlertaList>
    </v-card>
  </v-container>
</template>

  <script>
    import axios from 'axios';
    import AlertaList from './../../../alerta_list_alertas.vue';

    export default {
      name: 'AlertaContenedor',
      data: () => ({
        headers: [
          { text: '#', value: 'idAlerta', align: 'center' },
          { text: 'Tipo', value: 'tipo', align: 'center' },
          { text: 'Nombre', value: 'nombre', align: 'center' },
          { text: 'Fecha', value: 'fecha', align: 'center' },
          { text: 'Hora', value: 'hora', align: 'center' },
          { text: 'Estado', value: 'cliente', align: 'center' },
          { text: '', value: 'estado', align: 'center' },
          { text: 'Accion', value: 'cliente', align: 'center' }
        ],
        usuario: {
          scopes: [],
        },
        alertas: [],
      }),
      beforeMount() {
        axios.get('/api/alertas')
          .then(( { data: alertasData }) => {
              this.alertas = alertasData.alertas;
          });
        this.timer = setInterval(this.refreshList, 4000);
      },
      components: {
        AlertaList,
      },
      methods: {
        refreshList() {
          axios.get('/api/alertas')
            .then(({ data: alertasData }) => {
              this.alertas = alertasData.alertas;
          });
        }
      },
      beforeDestry(){
        clearInterval(this.timer);
      }
    };
  </script>
