<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        Proyectos
        <v-spacer></v-spacer>
        <v-text-field
          append-icon="search"
          label="Search"
          single-line
          hide-details
          v-model="search"
        ></v-text-field>
      </v-card-title>
      <v-data-table
          v-bind:headers="headers"
          v-bind:items="items"
          v-bind:search="search"
        >
        <template slot="items" scope="props">
          <td class="text-xs-center">{{ props.item.id }}</td>
          <td class="text-xs-center">{{ props.item.proyecto }}</td>
          <td class="text-xs-center">{{ props.item.cliente }}</td>
          <td class="text-xs-center">{{ props.item.receptores }}</td>
          <td class="text-xs-center">{{ props.item.sensores }}</td>
          <td class="text-xs-center" v-if="props.item.estado == 'I' ">
            <v-icon error>error</v-icon>
          </td>
          <td class="text-xs-center" v-if="props.item.estado == 'I' ">
          </td>
          <td class="text-xs-center" v-if="props.item.estado == 'A' ">
            <v-icon success>check_circle</v-icon>
          </td>

          <td class="text-xs-center" v-if="props.item.estado == 'A' ">
            <v-btn block info class="green darken-4" v-on:click="login">Ir</v-btn>
          </td>
        </template>
        <template slot="pageText" scope="{ pageStart, pageStop }">
          From {{ pageStart }} to {{ pageStop }}
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>

  export default {
    name: 'AlertaListProyectos',
    components: {
    },
    methods: {
      login : function (event) {
        let self = this;
        self.$router.push('/contenedor');
      }
   },
    data () {
      return {
        search: '',
        pagination: {},
        headers: [
          { text: '#', value: 'id', align:'center' },
          { text: 'Proyecto', value: 'proyecto', align:'center' },
          { text: 'Cliente', value: 'cliente', align:'center' },
          { text: 'Receptores', value: 'receptores', align:'center' },
          { text: 'Sensores', value: 'sensores', align:'center' },
          { text: 'Estado', value: 'estado', align:'center' },
          { text: 'Accion', value: 'accion', align:'center' }

        ],
        items: [
          {
            value: false,
            id : 'P001',
            proyecto: 'Proyecto Parque Araucano',
            cliente: 'Municipalidad de las Condes',
            receptores: 1,
            sensores: 6,
            estado: 'A',
          },
          {
            value: false,
            id : 'P002',
            proyecto: 'Proyecto Parque Juan Pablo II',
            cliente: 'Municipalidad de las Condes',
            receptores: 3,
            sensores: 21,
            estado: 'I',
          },
          {
            value: false,
            id : 'P003',
            proyecto: 'Proyecto Parque Presidente Errázuriz',
            cliente: 'Municipalidad de las Condes',
            receptores: 1,
            sensores: 6,
            estado: 'I',
          }
        ]
      }
    }
  }
</script>
