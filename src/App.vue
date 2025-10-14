<script setup lang="ts">
  import { RouterView } from 'vue-router'; 
  import { useClientes } from './composables/useCliente';
  useClientes()
</script>

<template>
  <div class="app-container">
    <h1>Gerenciamento de Clientes (CPF/CNPJ)</h1>
    <RouterView /> 
  </div>
</template>

<style>
/* Estilos globais (se necessário) ou estilos base do container */
/* .app-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 10px;
    font-family: sans-serif;
} */

.app-container {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 20px;
    flex-grow: 1;
    font-family: sans-serif;
}

h1 {
    color: #50ee42;
    text-align: center;
    margin-bottom: 25px;
}
</style>