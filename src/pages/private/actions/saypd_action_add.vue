<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" persistent width="50%">
      <v-btn v-tooltip:right="{ html: 'Agregar Accion' }"
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
                  <v-text-field name="name" v-model="name" label="Nombre Accion"
                  :error-messages="nameErrors" @input="$v.name.$touch()"
                  @blur="$v.name.$touch()" required></v-text-field>
                </v-flex>

                <v-flex xs6>
                  <v-select
                    v-bind:items="alerts"
                    v-model="alertType"
                    label="Tipo Alerta"
                    item-text="name"
                    item-value="name"
                    single-line
                    bottom
                    name="alertType"
                    :error-messages="alertTypeErrors" @input="$v.alertType.$touch()"
                    @blur="$v.alertType.$touch()" required
                  ></v-select>
                </v-flex>
                <v-flex xs10>
                  <v-text-field name="grammatic" v-model="grammatic" label="Acciones"
                  :error-messages="grammaticErrors" @input="$v.grammatic.$touch()" textarea
                  @blur="$v.grammatic.$touch()" required></v-text-field>
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
     name: { required },
     grammatic: { required },
     alertType: { required }
    },
    props: ['onAdd', 'title'],
    data () {
      return {
        name: '',
        grammatic: '',
        alerts: [],
        alertType: null,
        isDisabled: false,
        dialog: false,
        alert:false,
        alertError:false,
        error : 'Error de Sistema.'
      }
    },
    beforeMount() {
      axios.get('/api/listTypeAlert')
          .then(( { data : list }) => {
              this.alerts = list.types;
      });
    },
    methods: {
      submit () {
        this.$v.$touch();
        if(this.$v.$invalid){
          console.log("Invalid Form");
          return;
        }
        axios.post('/api/setAction',{
           name:this.name,
           alertType:this.alertType,
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
        this.parameters = '';
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
      grammaticErrors () {
        const errors = []
        if (!this.$v.grammatic.$dirty) return errors
          !this.$v.grammatic.required && errors.push('Programacion es requerido.')
        return errors
      },
      alertTypeErrors () {
        const errors = []
        if (!this.$v.alertType.$dirty) return errors
        !this.$v.alertType.required && errors.push('Tipo Alerta es requerida.')
        return errors
      }
   },
  }
</script>
