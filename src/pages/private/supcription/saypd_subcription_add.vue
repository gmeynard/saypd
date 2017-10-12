<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" persistent width="50%">
      <v-btn v-tooltip:right="{ html: 'Agregar Suscripcion' }"
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
          <form id="userAddForm" >
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs6>
                  <v-subheader>Cliente</v-subheader>
                </v-flex>
                <v-flex xs6>
                  <v-select
                    v-bind:items="users"
                    v-model="user"
                    item-text="email"
                    item-value="email"
                    label="Select"
                    single-line
                    bottom
                    name="user"
                    :error-messages="userErrors" @input="$v.user.$touch()"
                    @blur="$v.user.$touch()" required
                  >
                </v-select>
                </v-flex>
                <v-flex xs6>
                  <v-subheader>Notificacion</v-subheader>
                </v-flex>
                <v-flex xs6>
                  <v-select
                    v-bind:items="notifications"
                    v-model="notification"
                    label="Select"
                    item-text="name"
                    item-value="name"
                    single-line
                    bottom
                    name="notification"
                    :error-messages="notificationErrors" @input="$v.notification.$touch()"
                    @blur="$v.notification.$touch()" required
                  ></v-select>
                </v-flex>
                <v-flex xs6>
                  <v-subheader>Tipo de Alerta</v-subheader>
                </v-flex>
                <v-flex xs6>
                  <v-select
                    v-bind:items="alerts"
                    v-model="alertType"
                    label="Select"
                    item-text="name"
                    item-value="name"
                    single-line
                    bottom
                    name="alertType"
                    :error-messages="alertTypeErrors" @input="$v.alertType.$touch()"
                    @blur="$v.alertType.$touch()" required
                  ></v-select>
                </v-flex>
              </v-layout>
            </v-container>
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
    name: 'UserAdd',
    mixins: [validationMixin],
    validations: {
     user: { required },
     notification: { required },
     alertType: { required }
    },
    props: ['onAdd', 'title'],
    data () {
      return {
        users: [],
        user: null,
        notifications: [],
        notification: null,
        alerts: [],
        alertType: null,
        dialog: false,
        alert:false,
        alertError:false,
        error : 'Error de Sistema.'
      }
    },
    beforeMount() {
      axios.get('/api/clients')
        .then(( { data : userData }) => {
            this.users = userData.users;
            console.log(this.users);
      });
      axios.get('/api/listTypeAlert')
          .then(( { data : list }) => {
              this.alerts = list.types;
      });
      axios.get('/api/listTypeNotification')
        .then(( { data : list }) => {
          console.log(list.types);
            this.notifications = list.types;
      });
    },
    methods: {
      submit () {
        this.$v.$touch();
        console.log(this.$v.$invalid);
        if(this.$v.$invalid){
          console.log("Invalid Form");
          return;
        }
        axios.post('/api/setSupcription',{
           email:this.user,
           notification:this.notification,
           alert:this.alertType,
           estado:'A'
        }).then(({ data }) => {
            if(data.estado == 'OK'){
              this.onAdd(data.suscription);
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
        this.$v.$reset();
        this.lastname = '';
        this.email = '';
        this.cel = '';
        this.password = '';
        this.repassword = '';
        this.alert = false;
        this.alertError = false;
        this.isDisabled = false;
      }
   },
   computed: {
      userErrors () {
        const errors = []
        if (!this.$v.user.$dirty) return errors
          !this.$v.user.required && errors.push('Cliente es requerido.')
        return errors
      },
      notificationErrors () {
        const errors = []
        if (!this.$v.notification.$dirty) return errors
          !this.$v.notification.required && errors.push('Notificacion es requerido.')
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
