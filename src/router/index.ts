import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'list',
      component: () => import('../views/ClienteListView.vue'), // Rota principal
    },
    {
      // Se o ID estiver presente, será para edição.
      path: '/cadastro/:id?',
      name: 'form',
      component: () => import('../views/ClienteFormView.vue'),
      props: true, // Importante: Permite que os parâmetros de rota sejam passados como props
    },
  ],
})

export default router