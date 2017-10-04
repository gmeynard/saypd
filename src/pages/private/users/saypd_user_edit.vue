<template>
    <v-dialog v-model="dialog" width="50%">
      <v-btn @click="update" v-tooltip:right="{ html: 'Editar Usuario' }"
        fab dark small class="blue" slot="activator">
        <v-icon>edit</v-icon>
      </v-btn>
      <v-card>
        <v-alert
          success
          :value="alert"
          transition="scale-transition"
        > Usuario Modificado correctamente
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
                <v-flex xs6 >
                  <v-text-field name="lastname" v-model="lastname" label="Apellidos"
                  :error-messages="lastnameErrors" @input="$v.lastname.$touch()"
                  @blur="$v.lastname.$touch()" required></v-text-field>
                </v-flex>
                <v-flex xs10 >
                  <v-text-field name="email" v-model="email" label="Email"
                  :error-messages="emailErrors" @input="$v.email.$touch()"
                  @blur="$v.email.$touch()" required></v-text-field>
                </v-flex>
                <v-flex xs10>
                  <v-text-field name="cel" v-model="cel" prefix="+56 9" class="input-group--focused" label="Celular"
                  :error-messages="celErrors" @input="$v.cel.$touch()"
                  @blur="$v.cel.$touch()" required></v-text-field>
                </v-flex>
                <v-flex xs5>
                  <v-text-field name="password" v-model="password" label="Contraseña"
                  :error-messages="passwordErrors" @input="$v.password.$touch()"
                  @blur="$v.password.$touch()" type="password"
                  ></v-text-field>
                </v-flex>
                <v-flex xs5>
                  <v-text-field name="repassword" v-model="repassword" label="Repetir Contraseña"
                  :error-messages="repasswordErrors" @input="$v.repassword.$touch()"
                  @blur="$v.repassword.$touch()" type="password"
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
            <small>*Campos obligatorios</small>
          </form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn class="blue--text darken-1" @click="clear" flat @click.native="dialog = false">Close</v-btn>
          <v-btn info class="green darken-4" @click="submit">Ingresar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script>
  import { validationMixin } from 'vuelidate'
  import { required, minLength, maxLength, numeric, email, sameAs } from 'vuelidate/lib/validators'
  import axios from 'axios';
  export default {
    name: 'UserEdit',
    mixins: [validationMixin],
    validations: {
     name: { required },
     lastname: { required },
     email: { required, email },
     cel: { required, numeric, maxLength: maxLength(8) , minLength: minLength(6)  },
     password: {  minLength: minLength(6) },
     repassword: { sameAsPassword: sameAs('password') }
    },
    props: ['onAdd', 'title','usuario'],
    data () {
      return {
        name: '',
        lastname: '',
        email: '',
        cel: '',
        password: '',
        repassword: '',
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
        axios.post('/api/updateUser',{
           name:this.name,
           lastname:this.lastname,
           email:this.email,
           cel:this.cel,
           password: this.password
        }).then(({ data }) => {
            if(data.estado == 'OK'){
              this.onAdd(data.usuario);
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
        this.lastname = '';
        this.email = '';
        this.cel = '';
        this.password = '';
        this.repassword = '';
         this.alert = false;
         this.alertError = false;
      },
      update () {
        this.name = this.usuario.name;
        this.lastname = this.usuario.lastname;
        this.email = this.usuario.email;
        this.cel = this.usuario.cel;
        this.password = '';
        this.repassword = '';
      }
   },
   computed: {
      nameErrors () {
        const errors = []
        if (!this.$v.name.$dirty) return errors
          !this.$v.name.required && errors.push('Nombre es requerido.')
        return errors
      },
      lastnameErrors () {
        const errors = []
        if (!this.$v.lastname.$dirty) return errors
          !this.$v.lastname.required && errors.push('Apellidos es requerido.')
        return errors
      },
      passwordErrors () {
        const errors = []
        !this.$v.password.minLength && errors.push('Debe contener al menos 6 caracteres');
        return errors
      },
      repasswordErrors () {
        const errors = []
          !this.$v.repassword.sameAsPassword && errors.push('Contraseña debe ser identica.')
        return errors
      },
      emailErrors () {
        const errors = []
        if (!this.$v.email.$dirty) return errors
          !this.$v.email.email && errors.push('Debe ingresar un email valido')
        !this.$v.email.required && errors.push('Email es requerido')

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
