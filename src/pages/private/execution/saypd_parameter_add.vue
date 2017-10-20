<template>
  <v-layout row justify-center dark>
    <v-dialog v-model="dialog2" lazy>
      <v-btn v-tooltip:right="{ html: 'Agregar Parametro' }"
        absolute dark fab top right class="green"  slot="activator">
        <v-icon>add</v-icon>
      </v-btn>
      <v-card>
        <v-alert
          success
          :value="alert2"
          transition="scale-transition"
        > Acción Ingresada correctamente
        </v-alert>
        <v-alert
          error
          :value="alertError2"
          transition="scale-transition"
        > {{error}}
        </v-alert>
        <v-card-title>
          <span class="headline">{{title}}</span>
        </v-card-title>
        <v-card-text>
          <form id="addForm2" >
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs10>
                  <v-text-field name="name2" v-model="name2" label="Nombre Parametro"
                  :error-messages="name2Errors" @input="$v.name2.$touch()"  placeholder="Ejemplo: Host"
                  @blur="$v.name2.$touch()" required></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
            <small>*Campos obligatorios</small>
          </form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="blue--text darken-1" @click="clear2" flat @click.native="dialog2 = false">Close</v-btn>
          <v-btn info :disabled="isDisabled2" class="green darken-4" @click="submit2" @click.native="dialog2 = false">Guardar</v-btn>
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
    name: 'ParameterAdd',
    mixins: [validationMixin],
    validations: {
     name2: { required },
    },
    props: ['onAddParam', 'title'],
    data () {
      return {
        name2: '',
        isDisabled2: false,
        dialog2: false,
        alert2:false,
        alertError2:false,
        error2 : 'Error de Sistema.'
      }
    },
    methods: {
      submit2 () {
        this.$v.$touch();
        if(this.$v.$invalid){
          console.log("Invalid Form");
          return;
        }
        this.onAddParam(this.name2);
      },
      clear2 () {
        console.log("entro");
        this.name2 = '';
        this.alert2 = false;
        this.alertError2 = false;
        this.isDisabled2 = false;
      }
   },
   computed: {
      name2Errors () {
        const errors = []
        if (!this.$v.name2.$dirty) return errors
          !this.$v.name2.required && errors.push('Nombre es requerido.')
        return errors
      },
   },
  }
</script>
