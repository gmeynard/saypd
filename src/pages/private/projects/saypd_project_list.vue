
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
    <ProjectAdd :onAdd='onProjectAdd' title='Proyectos'/>
    <v-data-table
        :headers="headers"
        :items="projects"
        :search="search"
        rowsPerPageText="Proyectos por pagina"
    >
      <template slot="items" scope="props">
        <td class="text-xs-center">{{ props.item.id }}</td>
        <td class="text-xs-center">{{ props.item.name }}</td>
        <td class="text-xs-center">+56 9 {{ props.item.cel }}</td>
        <td class="text-xs-center" v-if="props.item.estado == 'A'" >
          <v-icon success>check_circle</v-icon>
        </td>
        <td class="text-xs-center" v-if="props.item.estado == 'I'" >
          <v-icon error>error</v-icon>
        </td>
        <td class="text-xs-center">
          <ProjectEdit :onAdd='onProjectAdd' :project="props.item" title='Editar Proyecto'/>
          <v-btn fab dark small class="red" v-if="props.item.estado == 'A'"
            @click="changeState(props.item.id,props.item.estado)"
            v-tooltip:left="{ html: 'Desactivar Proyecto' }">
              <v-icon>remove</v-icon>
          </v-btn>
          <v-btn fab dark small class="green" v-if="props.item.estado == 'I'"
            @click="changeState(props.item.id,props.item.estado)"
            v-tooltip:left="{ html: 'Activar Proyecto' }">
              <v-icon>check</v-icon>
          </v-btn>
          <v-btn fab dark small class="red"
            @click="deleteType(props.item.id)"
            v-tooltip:left="{ html: 'Eliminar Proyecto' }">
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
  import ProjectAdd from './saypd_project_add.vue';
  import ProjectEdit from './saypd_project_edit.vue';

  export default {
    data: () => ({
      headers: [
        { text: 'Id', value: 'id', align: 'center' },
        { text: 'Proyecto', value: 'nombre', align: 'center' },
        { text: 'Contacto ', value: 'cel', align: 'center' },
        { text: 'Estado', value: 'estado', align: 'center' },
        { text: 'Accion', align: 'center' }
      ],
      title: "Proyectos",
      projects: [],
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
      ProjectAdd,
      ProjectEdit
    },
    beforeMount() {
      this.update();
    },
    methods: {
      onProjectAdd(project) {
        this.update();
    },
      changeState(id,estado) {
        axios.post('/api/stateProject',{
           id:id,
           estado: estado
        }).then(() => {
          this.update();
        }).catch(res => {
             this.alertError = true;
        });
      },
      deleteType(id) {
        axios.post('/api/removeProject',{
           id:id
        }).then(() => {
          this.update();
        }).catch(res => {
             this.alertError = true;
        });
      },
      update() {
        axios.get('/api/listProject')
          .then(( { data : projectsData }) => {
              this.projects = projectsData.projects;
          });
      }
    }
  }
</script>
