<template>
  <v-card>
    <v-card-title>
      <h6 class="card-title">{{ title }}</h6>
      <v-spacer></v-spacer>
      <v-text-field
        append-icon="search"
        label="Buscar..."
        single-line
        hide-details
        v-model="search"
      ></v-text-field>
    </v-card-title>
    <v-data-table
        v-bind:headers="headers"
        v-bind:items="data"
        v-bind:search="search"
    >
      <template slot="items" scope="props">
        <td class="text-xs-center">{{ props.item.idAlerta }}</td>
        <td class="text-xs-center">{{ props.item.tipo }}</td>
        <td class="text-xs-center">{{ props.item.nombre }}</td>
        <td class="text-xs-center">{{ props.item.fecha }}</td>
        <td class="text-xs-center">{{ props.item.hora }}</td>
        <td class="text-xs-center" v-if="props.item.estado == 'E'" >
          Enviada
        </td>
        <td class="text-xs-center" v-if="props.item.estado == 'A'" >
          Ingresada
        </td>
        <td class="text-xs-center" v-if="props.item.estado == 'C'" >
          Completada
        </td>
        <td class="text-xs-center" v-if="props.item.estado == 'E'" >
          <v-icon error>error</v-icon>
        </td>
        <td class="text-xs-center" v-if="props.item.estado == 'A'" >
          <v-icon warning>warning</v-icon>
        </td>
        <td class="text-xs-center" v-if="props.item.estado == 'C'" >
          <v-icon success>check_circle</v-icon>
        </td>
        <td class="text-xs-center" v-if="props.item.estado == 'E'" >
          <AlertaDialogIngresar nombreBoton="Ingresar" title="Ingresar Acción" :idAlerta="props.item.idAlerta" ></AlertaDialogIngresar>
        </td>
        <td class="text-xs-center" v-if="props.item.estado == 'A'" >
          <AlertaDialogVer nombreBoton="Ver" title="Ver Acción" :idAlerta="props.item.idAlerta" ></AlertaDialogVer>
        </td>
        <td class="text-xs-center" v-if="props.item.estado == 'C'" >
          <AlertaDialogVer nombreBoton="Ver" title="Ver Acción" :idAlerta="props.item.idAlerta" ></AlertaDialogVer>
        </td>
      </template>
      <template slot="pageText" scope="{ pageStart, pageStop }">
        Desde {{ pageStart }} hasta {{ pageStop }}
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
  import AlertaDialogIngresar from './alerta_dialog_ingresar.vue';
  import AlertaDialogVer from './alerta_dialog_ver.vue';
  export default {
    props: {
      title: {
        type: String,
        default: '',
      },
      onRemove: {
        default: () => {},
      },
      headers: {
        type: Array,
        default: () => ([]),
      },
      data: {
        type: Array,
        default: () => ([]),
      },
      campo: {
        type: String,
        default: '',
      }
    },
    data () {
      return {
        search: '',
        pagination: {},
      }
    },
    components: {
      AlertaDialogIngresar,
      AlertaDialogVer,
    },
    methods: {
      login : function (event) {
        let self = this;
        self.$router.push('/contenedor');
      }
   }
  }
</script>
