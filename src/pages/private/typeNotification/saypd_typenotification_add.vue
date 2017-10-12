<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" persistent width="50%">
      <v-btn v-tooltip:right="{ html: 'Agregar Notificación' }"
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
                <v-flex xs4>
                  <v-text-field name="name" v-model="name" label="Nombre"
                  :error-messages="nameErrors" @input="$v.name.$touch()"
                  @blur="$v.name.$touch()" required></v-text-field>
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
  export default {
    name: 'TypeNotificationAdd',
    mixins: [validationMixin],
    validations: {
     name: { required }
    },
    props: ['onAdd', 'title'],
    data () {
      return {
        name: '',
        isDisabled: false,
        dialog: false,
        alert:false,
        alertError:false,
        error : 'Error de Sistema.'
      }
    },
    methods: {
      submit () {
        this.$v.$touch();
        console.log(this.$v.$invalid);
        if(this.$v.$invalid){
          console.log("Invalid Form");
          return;
        }
        axios.post('/api/setTypeNotification',{
           name:this.name,
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
        this.alert = false;
        this.alertError = false;
        this.isDisabled = false;
      }
   },
   computed: {
      nameErrors () {
        const errors = []
        if (!this.$v.name.$dirty) return errors
          !this.$v.name.required && errors.push('Nombre es requerido.')
        return errors
      },
   },
  }
</script>
