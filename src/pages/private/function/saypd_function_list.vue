<template>
  <v-container fluid>
  <v-card>
    <v-card-title>
      <h6 class="card-title">{{title}}</h6>
      <v-spacer></v-spacer>
      <v-text-field
        append-icon="search"
        label="Buscar..."
        single-line
        hide-details
        v-model="search"
      ></v-text-field>
    </v-card-title>
    <FunctionAdd :onAdd='onAdd' title='Funcion'/>
    <v-data-table
        :headers="headers"
        :items="list"
        :search="search"
        rowsPerPageText="Funciones por pagina"
    >
      <template slot="items" scope="props">
        <td class="text-xs-center">{{ props.item.name }}</td>
        <td class="text-xs-center" v-if="props.item.state == 'A'" >
          <v-icon success>check_circle</v-icon>
        </td>
        <td class="text-xs-center" v-if="props.item.state == 'I'" >
          <v-icon error>error</v-icon>
        </td>
        <td class="text-xs-center">
          <FunctionEdit :onAdd='onAdd' :object="props.item" title='Editar Funcion'/>
          <v-btn fab dark small class="red" v-if="props.item.state == 'A'"
            @click="changeState(props.item.name,props.item.state)"
            v-tooltip:left="{ html: 'Desactivar Funcion' }">
              <v-icon>remove</v-icon>
          </v-btn>
          <v-btn fab dark small class="green" v-if="props.item.state == 'I'"
            @click="changeState(props.item.name,props.item.state)"
            v-tooltip:left="{ html: 'Activar Funcion' }">
              <v-icon>check</v-icon>
          </v-btn>
          <v-btn fab dark small class="red"
            @click="deleteType(props.item.name)"
            v-tooltip:left="{ html: 'Eliminar Funcion' }">
              <v-icon>delete</v-icon>
          </v-btn>
          <FunctionTest :object="props.item" title='Probar Funcion'/>
        </td>
      </template>
      <template slot="pageText" scope="{ pageStart, pageStop }">
        Desde {{ pageStart }} hasta {{ pageStop }}
      </template>
    </v-data-table>

  </v-card>

</v-container>
</template>
<style>
  /* This is for documentation purposes and will not be needed in your application */
  #create .speed-dial {
    position: absolute;
  }

  #create .btn--floating {
    position: relative;
  }
</style>
<script>
  import axios from 'axios';
  import FunctionAdd from './saypd_function_add.vue';
  import FunctionEdit from './saypd_function_edit.vue';
  import FunctionTest from './saypd_function_test.vue';

  export default {
    data: () => ({
      headers: [
        { text: 'Nombre', value: 'nombre', align: 'center' },
        { text: 'Estado', value: 'estado', align: 'center' },
        { text: 'Accion', align: 'center' }
      ],
      title: "Funciones",
      list: [],
      search: '',
      pagination: {},
      direction: "left",
      fab: false,
      fling: false,
      hover: true,
      tabs: null,
      top: false,
      right: true,
      bottom: true,
      left: false,
      transition: 'slide-x-reverse-transition'
    }),
    components : {
      FunctionAdd,
      FunctionEdit,
      FunctionTest
    },
    beforeMount() {
      this.update();
    },
    methods: {
      onAdd(user) {
        this.update();
      },
      changeState(id,state) {
        axios.post('/api/stateFunction',{
           name:id,
           state: state
        }).then(() => {
          this.update();
        }).catch(res => {
             this.alertError = true;
        });
      },
      deleteType(id) {
        axios.post('/api/removeFunction',{
           name:id
        }).then(() => {
          this.update();
        }).catch(res => {
             this.alertError = true;
        });
      },
      update() {
        axios.get('/api/listFunction')
          .then(( { data : list }) => {
              this.list = list.types;
          });
      }
    }
  }
</script>
