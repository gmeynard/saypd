<template>
    <v-dialog v-model="dialog" width="50%">
      <v-btn @click="update" v-tooltip:right="{ html: 'Probar Funcion' }"
        fab dark small class="blue" slot="activator">
        <v-icon>playlist_add_check</v-icon>
      </v-btn>
      <v-card>
        <v-alert
          success
          :value="alert"
          transition="scale-transition"
        > Ejecutada correctamente
        </v-alert>
        <v-alert
          error
          :value="alertError"
          transition="scale-transition"
        > Error en la Ejecucion
        </v-alert>
        <v-card-title>
          <span class="headline">{{title}}</span>
        </v-card-title>
        <v-card-text>
          <form id="editForm" >
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs10>
                  <v-text-field name="name" v-model="name" label="Nombre" disabled></v-text-field>
                </v-flex>
                <v-flex xs10>
                  <v-text-field name="parameters" v-model="parameters" label="Parametros" disabled></v-text-field>
                </v-flex>
                <v-flex xs10>
                  <v-text-field name="values" v-model="values" label="Valores"></v-text-field>
                </v-flex>
                <v-flex xs10>
                  <v-text-field name="response" v-model="response" label="Respuesta" textarea></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="blue--text darken-1" @click="clear" flat @click.native="dialog = false">Close</v-btn>
          <v-btn info class="green darken-4" @click="submit">Test</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script>
  import { validationMixin } from 'vuelidate'
  import axios from 'axios';
  export default {
    name: 'TypeAlertEdit',
    mixins: [validationMixin],
    props: ['title','object'],
    data () {
      return {
        name: '',
        parameters: '',
        response: '',
        dialog: false,
        alert:false,
        alertError:false
      }
    },
    methods: {
      submit () {
        axios.post('/api/testFunction',{
           name:this.name,
           parameters:this.parameters,
           values: this.values,
           state:'A'
        }).then(({ data }) => {
            if(data.estado == 'OK'){
              this.response = data.object;
              this.alert = true;
              this.isDisabled = true;
            }else{
              console.log(data.status);
              this.error = data.pre;
              this.alertError = true;
            }
          }).catch(res => {
             this.response = res;
             this.alertError = true;
        });
      },
      clear () {
        this.name = '';
        this.parameters = '';
        this.alert = false;
        this.alertError = false;
        this.isDisabled = false;
      },
      update () {
        this.name = this.object.name;
        this.parameters = this.object.parameters;
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
