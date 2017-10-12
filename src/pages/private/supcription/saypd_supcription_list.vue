
</style>
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
    <UserAdd :onAdd='onUserAdd' title='Suscripcion'/>
    <v-data-table
        :headers="headers"
        :items="users"
        :search="search"
        rowsPerPageText="Filas por pagina"
    >
      <template slot="items" scope="props">
        <td class="text-xs-center">{{ props.item.email }}</td>
        <td class="text-xs-center">{{ props.item.notification }}</td>
        <td class="text-xs-center">{{ props.item.alert }}</td>
        <td class="text-xs-center" v-if="props.item.estado == 'A'" >
          <v-icon success>check_circle</v-icon>
        </td>
        <td class="text-xs-center" v-if="props.item.estado == 'I'" >
          <v-icon error>error</v-icon>
        </td>
        <td class="text-xs-center">
          <v-btn fab dark small class="red" v-if="props.item.estado == 'A'"
            @click="changeState(props.item)"
            v-tooltip:left="{ html: 'Desactivar Suscripcion' }">
              <v-icon>remove</v-icon>
          </v-btn>
          <v-btn fab dark small class="green" v-if="props.item.estado == 'I'"
            @click="changeState(props.item)"
            v-tooltip:left="{ html: 'Activar Suscripcion' }">
              <v-icon>check</v-icon>
          </v-btn>
          <v-btn fab dark small class="red"
            @click="deleteType(props.item)"
            v-tooltip:left="{ html: 'Eliminar Suscripcion' }">
              <v-icon>delete</v-icon>
          </v-btn>
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
  import UserAdd from './saypd_subcription_add.vue';


  export default {
    data: () => ({
      headers: [
        { text: 'Usuario', value: 'nombre', align: 'center' },
        { text: 'Tipo', value: 'lastname', align: 'center' },
        { text: 'Alerta', value: 'email', align: 'center' },
        { text: 'Estado', value: 'estado', align: 'center' },
        { text: 'Accion', align: 'center' }
      ],
      title: "Suscripciones",
      users: [],
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
      UserAdd
    },
    beforeMount() {
      this.update();
    },
    methods: {
      onUserAdd(user) {
        this.update();
      },
      changeState(suscription) {
        axios.post('/api/stateSupcription',{
           email:suscription.email,
           notification:suscription.notification,
           alert:suscription.alert,
           estado: suscription.estado
        }).then(() => {
          this.update();
        }).catch(res => {
             this.alertError = true;
        });
      },
      deleteType(suscription) {
        axios.post('/api/removeSupcription',{
          email:suscription.email,
          notification:suscription.notification,
          alert:suscription.alert
        }).then(() => {
          this.update();
        }).catch(res => {
             this.alertError = true;
        });
      },
      update() {
        axios.get('/api/listSuscription')
          .then(({ data }) => {
              console.log(data.types);
              this.users = data.types;
              console.log(this.users);
      });
      }
    }
  }
</script>
