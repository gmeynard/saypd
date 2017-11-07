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
                  <v-text-field name="funcion" v-model="funcion" label="Nombre Funcion"
                  :error-messages="funcionErrors" @input="$v.funcion.$touch()"  placeholder="sendMail"
                  @blur="$v.funcion.$touch()" required></v-text-field>
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
                        <td>
                          <v-edit-dialog lazy> {{ props.item.param }}
                            <v-text-field
                              slot="input"
                              label="Edit"
                              v-model="props.item.param"
                              single-line
                              counter
                            ></v-text-field>
                          </v-edit-dialog>
                        </td>
                        <td>
                          <v-edit-dialog lazy> {{ props.item.value }}
                            <v-text-field
                              slot="input"
                              label="Edit"
                              v-model="props.item.value"
                              single-line
                              counter
                            ></v-text-field>
                          </v-edit-dialog>
                        </td>
                        <td class="text-xs-center">
                          <v-btn fab dark small class="red"
                          @click="deleteParam(props.item)"
                          v-tooltip:left="{ html: 'Eliminar Parametro' }">
                            <v-icon>delete</v-icon>
                          </v-btn>
                        </td>
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
     funcion: { required }
    },
    props: ['onAdd', 'title'],
    data () {
      return {
        headers: [
          { text: 'Nombre', value: 'param', align: 'center', sortable: false },
          { text: 'Valor', value: 'value', align: 'center', sortable: false },
          { text: 'Accion', align: 'center' }
        ],
        title2: "Parametros",
        list: [],
        param: '',
        value:'',
        name: '',
        funcion: '',
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
      submit () {
        this.$v.$touch();
        if(this.$v.$invalid){
          console.log("Invalid Form");
          return;
        }
        axios.post('/api/setExecution',{
           name:this.name,
           funcion: this.funcion,
           parameters: this.list,
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
      deleteParam(name) {
        var index = this.list.indexOf(name);
        if (index > -1) {
            this.list.splice(index, 1);
        }
      },
      addParam(name) {
        this.list.push(name);
      },
      clear () {
        this.name = '';
        this.funcion = '';
        this.alert = false;
        this.alertError = false;
        this.isDisabled = false;
      },
      addRow () {
        console.log("agregar row");
        var param = "AddParameter";
        var value = "AddValue";
        var json = {'param':param, 'value':value}
        this.list.push(json);
      }
   },
   computed: {
      nameErrors () {
        const errors = []
        if (!this.$v.name.$dirty) return errors
          !this.$v.name.required && errors.push('Nombre es requerido.')
        return errors
      },
      funcionErrors () {
        const errors = []
        if (!this.$v.funcion.$dirty) return errors
          !this.$v.funcion.required && errors.push('Nombre Funcion es requerido.')
        return errors
      },
   },
  }
</script>
