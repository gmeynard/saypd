<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" persistent width="50%">
      <v-btn v-tooltip:right="{ html: 'Agregar Ejecucion' }"
        absolute dark fab bottom left class="green"  slot="activator">
        <v-icon>add</v-icon>
      </v-btn>
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
        > {{error}}
        </v-alert>
        <v-card-title>
          <span class="headline">{{title}}</span>
        </v-card-title>
        <v-card-text>
          <form id="addForm" >
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs10>
                  <v-text-field name="name" v-model="name" label="Nombre Ejecucion"
                  :error-messages="nameErrors" @input="$v.name.$touch()"  placeholder="Enviar Email"
                  @blur="$v.name.$touch()" required></v-text-field>
                </v-flex>
                <v-flex xs10>
                  <v-text-field name="name" v-model="name" label="Nombre Funcion"
                  :error-messages="nameErrors" @input="$v.name.$touch()"  placeholder="sendMail"
                  @blur="$v.name.$touch()" required></v-text-field>
                </v-flex>
                <v-flex xs10>
                  <v-card>
                    <v-card-title>
                      <h6 class="card-title">{{title2}}</h6>
                    </v-card-title>
                    <v-btn v-tooltip:right="{ html: 'Agregar Parametro' }"
                      absolute dark fab top right class="green" @click="addRow" >
                      <v-icon>add</v-icon>
                    </v-btn>
                    <v-data-table
                        v-bind:headers="headers"
                        :items="list"
                        hide-actions
                      >
                      <template slot="items" scope="props">
                        <td>{{ props.item }}</td>
                      </template>
                    </v-data-table>
                  </v-card>
                </v-flex>
              </v-layout>
            </v-container>
            <small>*Campos obligatorios</small>

          </form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="blue--text darken-1" @click="clear" flat @click.native="dialog = false">Close</v-btn>
          <v-btn info :disabled="isDisabled" class="green darken-4" @click="submit">Ingresar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
  import { validationMixin } from 'vuelidate'
  import { required } from 'vuelidate/lib/validators'
  import axios from 'axios';
  import ParameterAdd from './saypd_parameter_add.vue';
  export default {
    name: 'TypeNotificationAdd',
    mixins: [validationMixin],
    validations: {
     name: { required },
     grammatic: { required }
    },
    props: ['onAdd', 'title'],
    data () {
      return {
        headers: [
          { text: 'Nombre', value: 'nombre', align: 'center' },
          { text: 'Accion', align: 'center' }
        ],
        title2: "Parametros",
        list: [],
        name: '',
        grammatic: '',
        isDisabled: false,
        dialog: false,
        alert:false,
        alertError:false,
        error : 'Error de Sistema.'
      }
    },
    components : {
      ParameterAdd,
    },
    methods: {
      onAddParam(user) {
        this.list.push(user);
      },
      submit () {
        this.$v.$touch();
        if(this.$v.$invalid){
          console.log("Invalid Form");
          return;
        }
        axios.post('/api/setExecution',{
           name:this.name,
           grammatic: this.grammatic,
           state:'A'
        }).then(({ data }) => {
            if(data.estado == 'OK'){
              this.onAdd(data.object);
              this.alert = true;
              this.isDisabled = true;
            }else{
              this.error = data.descripcion;
              this.alertError = true;
            }
          }).catch(res => {
             this.alertError = true;
        });
      },
      clear () {
        this.name = '';
        this.grammatic = '';
        this.alert = false;
        this.alertError = false;
        this.isDisabled = false;
      },
      addRow () {
        console.log("agregar row");
      }
   },
   computed: {
      nameErrors () {
        const errors = []
        if (!this.$v.name.$dirty) return errors
          !this.$v.name.required && errors.push('Nombre es requerido.')
        return errors
      },
      grammaticErrors () {
        const errors = []
        if (!this.$v.grammatic.$dirty) return errors
          !this.$v.grammatic.required && errors.push('Programacion es requerido.')
        return errors
      },
   },
  }
</script>
