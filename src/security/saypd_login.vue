<template>
      <v-container fluid>
      <v-layout>
        <v-flex xs8 sm6 offset-sm3>
          <v-card>
            <v-alert
              error
              :value="alert"
              transition="scale-transition"
            > Error en la autenticación. Usuario o password incorrectos
            </v-alert>
            <v-card-title class="indigo darken-4">
                <h6 class="white--text card-title">Login</h6>
            </v-card-title>
            <v-container class="indigo darken-4" fluid>
              <form id="form">
                <v-card>
                  <v-card-text>
                    <v-container fluid>
                      <v-layout row>
                        <v-flex xs12>
                          <v-text-field
                              label="Email"
                              v-model="email"
                              prepend-icon="email"
                              :error-messages="emailErrors"
                              @input="$v.email.$touch()"
                              @blur="$v.email.$touch()"
                              required
                            ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <v-layout row>
                        <v-flex xs12>
                          <v-text-field
                            name="password"
                            label="Contraseña"
                            v-model="password"
                            prepend-icon="lock_outline"
                            :error-messages="passwordErrors"
                            @input="$v.password.$touch()"
                            @blur="$v.password.$touch()"
                            :append-icon="e1 ? 'visibility' : 'visibility_off'"
                            :append-icon-cb="() => (e1 = !e1)"
                            :type="e1 ? 'text' : 'password'"
                            required
                          ></v-text-field>
                        </v-flex>
                      </v-layout>
                      <v-btn block info class="indigo darken-4" @click="submit">Ingresar</v-btn>
                    </v-container>
                  </v-card-text>
                </v-card>
              </form>
            </v-container>
          </v-card>
        </v-flex>
      </v-layout>
      </v-container>
</template>
<script>

  import { validationMixin } from 'vuelidate'
  import { required, maxLength, email } from 'vuelidate/lib/validators'
  import axios from 'axios';
  export default {
    name: 'AlertaLogin',
    mixins: [validationMixin],
    validations: {
      email: { required , email},
      password: { required }
    },
    data () {
       return {
          e1: false,
          password: '',
          email: '',
          alert: false
       }
     },
     methods: {
       submit () {
         this.$v.$touch();
         if(this.$v.$invalid){
           return;
         }
         let self = this;
         axios.post('/auth/login',{
            username:this.email,
            password:this.password
         }).then(({ data }) => {
           if(data.estado == 'ok'){
             this.alert = false;
             location.reload();
             self.$router.push('/');
           }else {
             this.alert = true;
           }
         }).catch(res => {
            this.alert = true;
         });
       },
       clear () {
         this.$v.$reset()
         this.email = ''
       }
    },
    computed: {
      emailErrors () {
        const errors = []
        if (!this.$v.email.$dirty) return errors
        !this.$v.email.email && errors.push('Debe ingresar un email valido')
        !this.$v.email.required && errors.push('Email es requerido')

        return errors
      },
      passwordErrors () {
        const errors = []
        if (!this.$v.password.$dirty) return errors
        !this.$v.password.required && errors.push('Contraseña es requerida.')
        return errors
      }
    },
  };
</script>
