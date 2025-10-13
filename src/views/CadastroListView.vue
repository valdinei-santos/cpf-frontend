<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCadastros } from '@/composables/useCadastros';
import type { Cadastro } from '@/composables/useCadastros';
import { maskDocumento } from '@/utils/documentoValidator';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';

const router = useRouter(); 

type SortableColumn = keyof Cadastro;

const { cadastros, loading, error, fetchCadastros, deleteCadastro, toggleBlockStatus } = useCadastros();

// Navega para '/cadastro'
const navigateToCreate = () => {
    router.push({ name: 'form' }); 
};

// Navega para '/cadastro/ID'
const startEdit = (cadastro: Cadastro) => {
    router.push({ name: 'form', params: { id: cadastro.id } });
};

// --- Estado de Filtro e Ordenação ---
const searchTerm = ref('');
const sortColumn = ref<SortableColumn>('id'); 
const sortDirection = ref<'asc' | 'desc'>('asc'); 

const filteredCadastros = computed<ReadonlyArray<Cadastro>>(() => {
    const term = searchTerm.value.toLowerCase().trim();

    if (!term) {
        return cadastros.value;
    }

    return cadastros.value.filter(cadastro => {
        const maskedDocumento = maskDocumento(cadastro.documento);
        
        // Verifica se o termo de busca está no nome, documento limpo ou mascarado
        return (
            cadastro.nome.toLowerCase().includes(term) ||
            cadastro.documento.includes(term) ||
            maskedDocumento.includes(term)
        );
    });
});

const sortedCadastros = computed<ReadonlyArray<Cadastro>>(() => {
    const list = [...filteredCadastros.value]; 

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

const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este cadastro?')) {
        const success = await deleteCadastro(id);
        if (success) {
            alert('Cadastro excluído com sucesso!');
        }
    }
};

onMounted(() => {
    // fetchCadastros(); // Descomente para simular o carregamento inicial da API
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
      <h2>Cadastros Existentes</h2>
      <div class="header-actions">
          <Button @click="navigateToCreate" :disabled="loading" label="+ Adicionar Novo" severity="success" rounded />
          <Button @click="fetchCadastros" :disabled="loading" label="Recarregar Lista" severity="info" rounded />
          <input 
              type="text" 
              v-model="searchTerm" 
              placeholder="Filtrar por nome, CPF ou CNPJ..." 
              :disabled="loading"
              class="filter-input"
          >
      </div>

      <div v-if="loading" class="loading-state"><p>Carregando cadastros...</p></div>
      <div v-if="error" class="error-state"><p>⚠️ {{ error }}</p></div>
      
      <div v-if="sortedCadastros.length > 0 && !loading" class="table-container">
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
            <tr v-for="cadastro in sortedCadastros" :key="cadastro.id"
                :class="{ 'blocked-row': cadastro.isBlocked }">
              <td>{{ cadastro.id }}</td>
              <td>{{ cadastro.nome }}</td>
              <td>{{ maskDocumento(cadastro.documento) }}</td>
              <td>{{ cadastro.telefone }}</td>
              <td class="action-cell">
                <div class="blocklist-check">
                    <input 
                        type="checkbox" 
                        :id="'block-' + cadastro.id"
                        :checked="cadastro.isBlocked" 
                        @change="toggleBlockStatus(cadastro.id)" 
                        :disabled="loading"
                        title="Marcar/Desmarcar da Blocklist"
                    >
                    <label :for="'block-' + cadastro.id">Block</label>
                </div>
                <Button @click="startEdit(cadastro)" :disabled="loading" label="Editar" severity="success" rounded />
                <Button @click="handleDelete(cadastro.id)" :disabled="loading" label="Excluir" severity="danger" rounded />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else-if="!loading && cadastros.length > 0 && sortedCadastros.length === 0">Nenhum resultado encontrado para "{{ searchTerm }}".</p>
      <p v-else-if="!loading && cadastros.length === 0">Nenhum cadastro encontrado.</p>
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