<template>
  <v-layout>
    <v-flex xs5 sm10 offset-sm2>
      <v-card>
        <v-card-title>
            <h6 class="card-title">{{ title }}</h6>
        </v-card-title>
        <v-container fluid>
          <v-layout row wrap>
            <v-flex xs5>
              <v-card flat tile>
                <v-card-media>
                  <vue-chart type="pie" :data="chartData"></vue-chart>
                </v-card-media>
              </v-card>
            </v-flex>
            <v-flex xs7>
              <v-card flat tile>
                <AlertaList :usuario='usuario' :data='alertas' :headers='headers' :onRemove='onExclamationRemoved' title='Sensores'></AlertaList>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>

import axios from 'axios';
import AlertaList from './alerta_list_sensores.vue';

var success = 1;
var warning = 1;
var error = 1;
export default {
  props: {
    title: {
      type: String,
      default: '',
    }

  },
  data: () => ({

    chartData: {labels: ['Bien', 'Advertencia', 'Alerta'],
        datasets: [{
        data: [success, warning, error],
        backgroundColor: [
            '#1deb10',
            '#ffff00',
            '#ff0200'

        ]
      }]
    },
    headers: [
      { text: '#', value: 'id', align: 'center' },
      { text: 'Nombre', value: 'nombre', align: 'center' },
      { text: '%Hum', value: 'fecha', align: 'center' },
      { text: 'Estado', value: 'cliente', align: 'center' }
    ],
    usuario: {
      scopes: [],
    },
    alertas: [],
  }),
  beforeMount() {
    axios.all([
      axios.get('/api/usuario'),
      axios.get('/api/alertas'),
    ]).then(([{ data: usuarioData }, { data: alertasData }]) => {
      this.usuario = usuarioData.user;
      this.alertas = alertasData.alertas;
      this.fillData();
    });
    this.timer = setInterval(this.refreshList, 4000);
  },
  components: {
    AlertaList,
  },
  methods: {
    fillData(){
      var i=0;
      var success = 0;
      var warning = 0;
      var error = 0;
      console.log(this.alertas.length);
      for (i = 0; i < this.alertas.length; i++) {
        var humedad = this.alertas[i].humedad;
        if(humedad < 40){
          error++;
        }else if(humedad > 41 && humedad < 70){
          warning++;
        }else {
          success++;
        }
      }
      this.chartData.datasets[0].data=[success, warning, error];
    },
    refreshList() {
      axios.all([
        axios.get('/api/usuario'),
        axios.get('/api/alertas'),
      ]).then(([{ data: usuarioData }, { data: alertasData }]) => {
        this.usuario = usuarioData.user;
        this.alertas = alertasData.alertas;
        this.fillData();
      });
      console.log(this.chartData);
      console.log("Actualizando...")
    },
    onExclamationAdded(text) {
      axios.post('/api/exclamations', { text }).then(({ data }) => {
        this.exclamations = [data.exclamation].concat(this.exclamations);
      });
    },
    canAdd() {
      return this.user.scopes.includes('add');
    },
    onExclamationRemoved(id) {
      axios.delete(`/api/exclamations/${id}`)
        .then(() => {
          this.exclamations = this.exclamations.filter(e => e.id !== id);
        });
    },
  },
  beforeDestry(){
    clearInterval(this.timer);
  }
};
</script>
