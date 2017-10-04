<template>
  <v-card>
    <v-card-title>
        <h4 class="card-title">{{ title }}</h4>
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
        <td class="text-xs-center">{{ props.item.id }}</td>
        <td class="text-xs-center">{{ props.item.tipo }}</td>
        <td class="text-xs-center">{{ props.item.nombre }}</td>
        <td class="text-xs-center">{{ props.item.fecha }}</td>
        <td class="text-xs-center">{{ props.item.hora }}</td>
        <td class="text-xs-center">{{ props.item.cliente }}</td>
      </template>
      <template slot="pageText" scope="{ pageStart, pageStop }">
        Desde {{ pageStart }} hasta {{ pageStop }}
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
  export default {
    props: {
      title: {
        type: String,
        default: '',
      },
      onRemove: {
        default: () => {},
      },
      user: {
        default: {},
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
    }
    }
</script>
