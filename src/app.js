import Vue from 'vue';
import axios from 'axios';
import Vuetify from 'vuetify';
import VueRouter from 'vue-router';
//require('./../node_modules/vuetify/dist/vuetify.min.css')
//public
import Contenedor from './pages/public/saypd_contenedor.vue';
import Home from './pages/public/saypd_home.vue';
//security
import Login from './security/saypd_login.vue';

//alerts
import AlertsList from './pages/private/alerts/saypd_alerts_list.vue';

//users
import UserList from './pages/private/users/saypd_user_list.vue';

import VueChart from 'vue-chart-js';
import AlertaListProyectos from './alerta_list_proyectos.vue';



const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/alerts',
    name: 'AlertsList',
    component: AlertsList,
  },
  {
    path: '/proyectos',
    name: 'AlertaListProyectos',
    component: AlertaListProyectos,
    meta:{conditionalRoute:true}
  },
  {
    path: '/users',
    name: 'UserList',
    component: UserList,
    meta:{conditionalRoute:true}
  },
  {
    path: '*',
    redirect: '/b'
  },
];

const router = new VueRouter({
  routes,
});



Vue.use(Vuetify);
Vue.use(VueRouter);

const vm = new Vue({
  el: '#app-container',
  data: {
    isLogged: false,
  },
  router,
  beforeMount(){
    axios.get('/api/usuario').then(({ data })=>{
      console.log(data);
      if(data.user != null){
          console.log("isLogged!");
          this.isLogged = true;
      }else{
          console.log("No Logged!");
          this.isLogged = false;
      }
    })
  },
  render(createElement) {
    return createElement(Contenedor);
  },
});

router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.conditionalRoute)) {
        console.log('isLogged:'+vm.isLogged);
        if (!vm.isLogged) {
            //check codition is false
            next({ path: '/'})
        } else {
            //check codition is true
            next()
        }
    } else {
        next() // make sure to always call next()!
    }
});