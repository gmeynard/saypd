<template>
  <v-layout row justify-center>

    <v-dialog v-model="dialog" persistent width="50%">
      <v-btn info class="green darken-4" slot="activator">{{ nombreBoton }}</v-btn>
      <v-card>
        <v-alert
          error
          :value="alertError"
          transition="scale-transition"
        > Error en el obtención de la acción
        </v-alert>
        <v-card-title>
          <span class="headline">{{title}} para Alerta con Id {{idAlerta}}</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12 sm6 md4>
                <v-text-field name="codigo" v-model="codigo" label="Codigo" disabled></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field name="descripcion" v-model="descripcion" label="Descripcion" disabled></v-text-field>
              </v-flex>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="blue--text darken-1" flat @click.native="dialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
  import axios from 'axios';
  export default {
    props: {
      nombreBoton: {
        type: String,
        default: '',
      },
      title: {
        type: String,
        default: '',
      },
      idAlerta: {
        type: String,
        default: '',
      }
    },
    data () {
      return {
        codigo:'',
        descripcion:'',
        dialog: false,
        alert:false,
        alertError:false
      }
    },
    beforeMount() {
        axios.post('/api/getAccion',{
           idAlerta:this.idAlerta
        }).then(({ data }) => {
          this.codigo=data.codigo;
          this.descripcion=data.descripcion;
        }).catch(res => {
           this.alertError = true;
       });
    }
  }
</script>
