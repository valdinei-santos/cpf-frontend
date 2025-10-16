<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useClientes } from '@/composables/useCliente';
import type { Cliente } from '@/composables/useCliente';
import { maskDocumento } from '@/utils/documentoValidator';
import Button from 'primevue/button';

const router = useRouter(); 

type SortableColumn = keyof Cliente;

const { clientes, loading, error, fetchClientes, deleteCliente, toggleBlockStatus } = useClientes();

// Navega para '/cliente'
const navigateToCreate = () => {
    router.push({ name: 'form' }); 
};

// Navega para '/cliente/ID'
const startEdit = (cliente: Cliente) => {
    router.push({ name: 'form', params: { id: cliente.id } });
};

// --- Estado de Filtro e Ordenação ---
const searchTerm = ref('');
const sortColumn = ref<SortableColumn>('id'); 
const sortDirection = ref<'asc' | 'desc'>('asc'); 

const filteredClientes = computed<ReadonlyArray<Cliente>>(() => {
    const term = searchTerm.value.toLowerCase().trim();

    const list = clientes.value || [];
    if (!term) {
        return list;
    }

    return list.filter(cliente => {
        const maskedDocumento = maskDocumento(cliente.documento);
        
        // Verifica se o termo de busca está no nome, documento limpo ou mascarado
        return (
            cliente.nome.toLowerCase().includes(term) ||
            cliente.documento.includes(term) ||
            maskedDocumento.includes(term)
        );
    });
});

const sortedClientes = computed<ReadonlyArray<Cliente>>(() => {
    const list = [...filteredClientes.value]; 

    if (!sortColumn.value) {
        return list;
    }

    const column = sortColumn.value;
    const direction = sortDirection.value === 'asc' ? 1 : -1;

    return list.sort((a, b) => {
        let aValue: string | number = a[column] as any; 
        let bValue: string | number = b[column] as any; 
        

        if (aValue === null) return 1;
        if (bValue === null) return -1;
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return direction * aValue.localeCompare(bValue, undefined, { sensitivity: 'base' });
        }
        
        if (aValue < bValue) {
            return -1 * direction;
        }
        if (aValue > bValue) {
            return 1 * direction;
        }
        return 0; 
    });
});

const setSort = (column: SortableColumn) => {
    if (sortColumn.value === column) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn.value = column;
        sortDirection.value = 'asc';
    }
};

const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
        const success = await deleteCliente(id);
        if (success) {
            alert('Cliente excluído com sucesso!');
        }
    }
};

onMounted(() => {
    fetchClientes();
});

const getSortIndicator = (column: SortableColumn) => {
    if (sortColumn.value === column) {
        return sortDirection.value === 'asc' ? ' ▲' : ' ▼';
    }
    return '';
};
</script>

<template>
  <div class="list-view">
    <div class="card list-card">
      <h2>Clientes Existentes</h2>
      <div class="header-actions">
          <Button @click="navigateToCreate" :disabled="loading" label="+ Adicionar Novo" severity="success" rounded />
          <Button @click="fetchClientes" :disabled="loading" label="Recarregar Lista" severity="info" rounded />
          <input 
              type="text" 
              v-model="searchTerm" 
              placeholder="Filtrar por nome, CPF ou CNPJ..." 
              :disabled="loading"
              class="filter-input"
          >
      </div>

      <div v-if="loading" class="loading-state"><p>Carregando clientes...</p></div>
      <div v-if="error" class="error-state"><p>⚠️ {{ error }}</p></div>
      
      <div v-if="sortedClientes.length > 0 && !loading" class="table-container">
        <table>
          <thead>
            <tr>
              <th @click="setSort('id')" class="sortable">
                ID {{ getSortIndicator('id') }}
              </th>
              <th @click="setSort('nome')" class="sortable">
                Nome/Razão Social {{ getSortIndicator('nome') }}
              </th>
              <th @click="setSort('documento')" class="sortable">
                CPF/CNPJ {{ getSortIndicator('documento') }}
              </th>
              <th @click="setSort('telefone')" class="sortable">
                Telefone {{ getSortIndicator('telefone') }}
              </th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cliente in sortedClientes" :key="cliente.id"
                :class="{ 'blocked-row': cliente.bloqueado }">
              <td>{{ cliente.id }}</td>
              <td>{{ cliente.nome }}</td>
              <td>{{ maskDocumento(cliente.documento) }}</td>
              <td>{{ cliente.telefone }}</td>
              <td class="action-cell">
                <div class="blocklist-check">
                    <input 
                        type="checkbox" 
                        :id="'block-' + cliente.id"
                        :checked="cliente.bloqueado" 
                        @change="toggleBlockStatus(cliente.id)" 
                        :disabled="loading"
                        title="Marcar/Desmarcar da Blocklist"
                    >
                    <label :for="'block-' + cliente.id">Block</label>
                </div>
                <Button @click="startEdit(cliente)" :disabled="loading" label="Editar" severity="success" rounded />
                <Button @click="handleDelete(cliente.id)" :disabled="loading" label="Excluir" severity="danger" rounded />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else-if="!loading && clientes.length > 0 && sortedClientes.length === 0">Nenhum resultado encontrado para "{{ searchTerm }}".</p>
      <p v-else-if="!loading && clientes.length === 0">Nenhum cliente encontrado.</p>
    </div>
  </div>
</template>

<style scoped>
.filter-group {
    margin-bottom: 20px;
}

.filter-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 1em;
}

.header-actions {
    display: flex;
    align-items: center; 
    gap: 15px; 
    /* flex-wrap: wrap; */
    justify-content: space-between; /* Distribui o espaço entre os elementos */
    width: 100%; /* Garante que o container ocupe a largura total disponível */
    margin-bottom: 20px;
}

/* Regra específica para os botões PrimeVue */
.header-actions .p-button { 
    flex-shrink: 0; /* IMPEDE que os botões encolham */
}

/* Regra específica para o Input */
.header-actions .filter-input {
    flex-grow: 1; 
    flex-shrink: 1;
    min-width: 200px; 
    padding: 0.5rem 0.75rem; 
    border: 1px solid var(--vt-c-divider-light-1); /* Use uma variável de cor do seu base.css */
    border-radius: 20px; /* Arredonda para combinar com os botões 'rounded' */
}

.table-container {
    width: 100%; 
    overflow-x: auto; 
}

.table-container table {
    width: 100%;
    border-collapse: collapse;
}

.table-container td {
    padding: 12px 15px;
    border-bottom: 1px solid var(--color-border);
    text-align: left;
    white-space: nowrap; 
    overflow: hidden;
    text-overflow: ellipsis; 
}

.table-container th {
    background-color: var(--color-background-soft); 
    font-weight: bold;
    padding: 12px 15px;
    border-bottom: 1px solid var(--color-border);
    text-align: left;
    white-space: nowrap; 
    overflow: hidden;
    text-overflow: ellipsis;  
}

.table-container th.sortable {
    cursor: pointer;
    user-select: none;
}

.table-container th.sortable:hover {
    background-color: var(--color-background-hover);
    color: white;
}


.action-cell {
    display: flex; 
    gap: 8px;
    align-items: center; 
    flex-wrap: nowrap; 
}

.blocked-row {
    /* background-color: var(--p-red-50);  *//* Cor de fundo suave para linha bloqueada */
    text-decoration: line-through;
    opacity: 0.7;
}

.blocklist-check {
    display: flex;
    align-items: center;
    gap: 5px;
}

</style>