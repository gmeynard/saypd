
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
    <UserAdd :onAdd='onUserAdd' title='Usuarios'/>
    <v-data-table
        :headers="headers"
        :items="users"
        :search="search"
        rowsPerPageText="Usuarios por pagina"
    >
      <template slot="items" scope="props">
        <td class="text-xs-center">{{ props.item.name }}</td>
        <td class="text-xs-center">{{ props.item.lastname }}</td>
        <td class="text-xs-center">{{ props.item.email }}</td>
        <td class="text-xs-center">+56 9 {{ props.item.cel }}</td>
        <td class="text-xs-center" v-if="props.item.estado == 'A'" >
          <v-icon success>check_circle</v-icon>
        </td>
        <td class="text-xs-center" v-if="props.item.estado == 'I'" >
          <v-icon error>error</v-icon>
        </td>
        <td class="text-xs-center">
          <UserEdit :onAdd='onUserAdd' :usuario="props.item" title='Editar Usuario'/>
          <v-btn fab dark small class="red" v-if="props.item.estado == 'A'"
            @click="changeState(props.item.email,props.item.estado)"
            v-tooltip:left="{ html: 'Desactivar Usuario' }">
              <v-icon>remove</v-icon>
          </v-btn>
          <v-btn fab dark small class="green" v-if="props.item.estado == 'I'"
            @click="changeState(props.item.email,props.item.estado)"
            v-tooltip:left="{ html: 'Activar Usuario' }">
              <v-icon>check</v-icon>
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
  import UserAdd from './saypd_user_add.vue';
  import UserEdit from './saypd_user_edit.vue';

  export default {
    data: () => ({
      headers: [
        { text: 'Nombre', value: 'nombre', align: 'center' },
        { text: 'Apellidos', value: 'lastname', align: 'center' },
        { text: 'Email', value: 'email', align: 'center' },
        { text: 'Celular', value: 'cel', align: 'center' },
        { text: 'Estado', value: 'estado', align: 'center' },
        { text: 'Accion', align: 'center' }
      ],
      title: "Usuarios",
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
      UserAdd,
      UserEdit
    },
    beforeMount() {
      this.update();
    },
    methods: {
      onUserAdd(user) {
        this.update();
    },
      changeState(email,estado) {
        axios.post('/api/userUpdateState',{
           email:email,
           state: estado
        }).then(() => {
          this.update();
        }).catch(res => {
             this.alertError = true;
        });
      },
      update() {
        axios.get('/api/users')
          .then(( { data : userData }) => {
            console.log(userData.users);
              this.users = userData.users;
              console.log(this.users);
          });
      }
    }
  }
</script>
