<template>
  <v-layout row justify-center>

    <v-dialog v-model="dialog" persistent width="50%">
      <v-btn info class="red darken-4" slot="activator">{{ nombreBoton }}</v-btn>
      <v-card>
        <v-alert
          success
          :value="alert"
          transition="scale-transition"
        > Acción Ingresada correctamente
        </v-alert>
        <v-alert
          error
          :value="alertError"
          transition="scale-transition"
        > Error en el ingreso de la accion
        </v-alert>
        <v-card-title>
          <span class="headline">{{title}} para Alerta con Id {{idAlerta}}</span>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12 sm6 md4>
                <v-text-field name="codigo" v-model="codigo" label="Codigo a Ejecutar" required></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field name="descripcion" v-model="descripcion" label="Descripcion" required></v-text-field>
              </v-flex>
              </v-flex>
            </v-layout>
          </v-container>
          <small>*Campos obligatorios</small>

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="blue--text darken-1" flat @click.native="dialog = false">Close</v-btn>
          <v-btn info class="indigo darken-4" @click="submit">Ingresar</v-btn>
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
    methods: {
      submit () {
        if(this.codigo != '' && this.descripcion != ''){
          axios.post('/api/setAccion',{
             idAlerta:this.idAlerta,
             codigo:this.codigo,
             descripcion:this.descripcion,
             estado:'A'
          }).then(({ data }) => {
            if(data.estado == 'OK'){
              this.alert = true;
            }else{
              this.alertError = true;
            }
          }).catch(res => {
             this.alertError = true;
         });
        }
      },
      clear () {
        this.$v.$reset()
        this.username = ''
      }
   },
  }
</script>
