<template>
    <v-dialog v-model="dialog" width="50%">
      <v-btn @click="update" v-tooltip:right="{ html: 'Editar Proyecto' }"
        fab dark small class="blue" slot="activator">
        <v-icon>edit</v-icon>
      </v-btn>
      <v-card>
        <v-alert
          success
          :value="alert"
          transition="scale-transition"
        > Cliente Modificado correctamente
        </v-alert>
        <v-alert
          error
          :value="alertError"
          transition="scale-transition"
        > Error en el ingreso de la accion
        </v-alert>
        <v-card-title>
          <span class="headline">{{title}}</span>
        </v-card-title>
        <v-card-text>
          <form id="userAddForm" >
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs4>
                  <v-text-field name="name" v-model="name" label="Nombre"
                  :error-messages="nameErrors" @input="$v.name.$touch()"
                  @blur="$v.name.$touch()" required></v-text-field>
                </v-flex>
                <v-flex xs10>
                  <v-text-field name="cel" v-model="cel" prefix="+56 9" class="input-group--focused" label="Celular"
                  :error-messages="celErrors" @input="$v.cel.$touch()"
                  @blur="$v.cel.$touch()" required></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
            <small>*Campos obligatorios</small>
          </form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="blue--text darken-1" @click="clear" flat @click.native="dialog = false">Close</v-btn>
          <v-btn info class="green darken-4" @click="submit">Modificar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script>
  import { validationMixin } from 'vuelidate'
  import { required, minLength, maxLength, numeric, email, sameAs } from 'vuelidate/lib/validators'
  import axios from 'axios';
  export default {
    name: 'ProjectEdit',
    mixins: [validationMixin],
    validations: {
     name: { required },
     cel: { required, numeric, maxLength: maxLength(8) , minLength: minLength(6)  },
    },
    props: ['onAdd', 'title','project'],
    data () {
      return {
        name: '',
        email: '',
        cel: '',
        id: '',
        dialog: false,
        alert:false,
        alertError:false
      }
    },
    methods: {
      submit () {
        this.$v.$touch();
        if(this.$v.$invalid){
          return;
        }
        axios.post('/api/updateProject',{
           name:this.name,
           id:this.id,
           cel:this.cel,
        }).then(({ data }) => {
            if(data.estado == 'OK'){
              this.onAdd(data.object);
              this.alert = true;

            }else{
              this.alertError = true;
            }
          }).catch(res => {
             this.alertError = true;
        });
      },
      clear () {
        this.name = '';
        this.$v.$reset();
        this.id = '';
        this.cel = '';
         this.alert = false;
         this.alertError = false;
      },
      update () {
        this.name = this.project.name;
        this.id = this.project.id;
        this.email = this.project.email;
        this.cel = this.project.cel;

      }
   },
   computed: {
      nameErrors () {
        const errors = []
        if (!this.$v.name.$dirty) return errors
          !this.$v.name.required && errors.push('Nombre es requerido.')
        return errors
      },
      celErrors () {
        const errors = []
        if (!this.$v.cel.$dirty) return errors
        !this.$v.cel.maxLength && errors.push('Debe contener maximo 8 digitos');
        !this.$v.cel.numeric && errors.push('Debe ingresar solo numeros')
        !this.$v.cel.required && errors.push('Celular es requerido')
        return errors
      }
   },
  }
</script>
