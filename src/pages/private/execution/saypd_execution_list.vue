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
    <ExecutionAdd :onAdd='onAdd' title='Ejecucion'/>
    <v-data-table
        :headers="headers"
        :items="list"
        :search="search"
        rowsPerPageText="Ejecuciones por pagina"
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
          <ExecutionEdit :onAdd='onAdd' :object="props.item" title='Editar Ejecucion'/>
          <v-btn fab dark small class="red" v-if="props.item.state == 'A'"
            @click="changeState(props.item.name,props.item.state)"
            v-tooltip:left="{ html: 'Desactivar Ejecucion' }">
              <v-icon>remove</v-icon>
          </v-btn>
          <v-btn fab dark small class="green" v-if="props.item.state == 'I'"
            @click="changeState(props.item.name,props.item.state)"
            v-tooltip:left="{ html: 'Activar Ejecucion' }">
              <v-icon>check</v-icon>
          </v-btn>
          <v-btn fab dark small class="red"
            @click="deleteType(props.item.name)"
            v-tooltip:left="{ html: 'Eliminar Ejecucion' }">
              <v-icon>delete</v-icon>
          </v-btn>
          <!--ExecutionTest :object="props.item" title='Probar Ejecucion'/-->
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
  import ExecutionAdd from './saypd_execution_add.vue';
  import ExecutionEdit from './saypd_execution_edit.vue';
  import ExecutionTest from './saypd_execution_test.vue';

  export default {
    data: () => ({
      headers: [
        { text: 'Nombre', value: 'nombre', align: 'center' },
        { text: 'Estado', value: 'estado', align: 'center' },
        { text: 'Accion', align: 'center' }
      ],
      title: "Ejecuciones Internas",
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
      ExecutionAdd,
      ExecutionEdit,
      ExecutionTest
    },
    beforeMount() {
      this.update();
    },
    methods: {
      onAdd(user) {
        this.update();
      },
      changeState(id,state) {
        axios.post('/api/stateExecution',{
           name:id,
           state: state
        }).then(() => {
          this.update();
        }).catch(res => {
             this.alertError = true;
        });
      },
      deleteType(id) {
        axios.post('/api/removeExecution',{
           name:id
        }).then(() => {
          this.update();
        }).catch(res => {
             this.alertError = true;
        });
      },
      update() {
        axios.get('/api/listExecution')
          .then(( { data : list }) => {
              this.list = list.types;
          });
      }
    }
  }
</script>
