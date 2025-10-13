<script setup lang="ts">
import { watch, computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCadastros } from '@/composables/useCadastros';
import type { Cadastro } from '@/composables/useCadastros';
import { maskDocumento, isDocumentoValido } from '@/utils/documentoValidator';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

const router = useRouter();
const route = useRoute(); 

const { form, cadastros, loading, error, isEditing, saveCadastro, resetForm } = useCadastros();
//const emit = defineEmits(['navigate']);
const inputDocumento = ref('');

/* const props = defineProps<{
    initialData: Cadastro | null
}>(); */
const props = defineProps<{
    id?: string | number // ID pode vir como string da URL ou número (se for passado explicitamente)
}>();

// Watcher para aplicar a máscara e manter o estado local sincronizado com o global (form)
watch(inputDocumento, (newValue) => {
    const cleanValue = newValue.replace(/\D/g, '');
    inputDocumento.value = maskDocumento(cleanValue);
    form.documento = cleanValue; // O valor limpo é o que vai para o Composable/API
}, { immediate: true });

// Sincroniza o composable `form` com os dados passados pela prop ao montar
/* watch(() => props.initialData, (newVal) => {
    if (newVal) {
        Object.assign(form, newVal);
        isEditing.value = true;
        inputDocumento.value = maskDocumento(newVal.documento);
    } else {
        resetForm(); // Limpa o formulário para CREATE
    }
}, { immediate: true }); */
watch(() => props.id, (newId) => {
    if (newId) {
        // ID existe: Modo Edição
        const idNum = Number(newId);
        
        // Simula busca na lista (em um projeto real, faria um fetch específico)
        const itemToEdit = cadastros.value.find(c => c.id === idNum); 

        if (itemToEdit) {
            Object.assign(form, itemToEdit);
            isEditing.value = true;
            inputDocumento.value = maskDocumento(itemToEdit.documento);
        } else {
            // Se o ID não for encontrado (ex: usuário digitou URL errada), volta para lista
            alert('Cadastro não encontrado.');
            router.push({ name: 'list' });
        }
    } else {
        // ID não existe: Modo Criação
        resetForm(); 
    }
}, { immediate: true });


// --- Validações ---
const documentoValidationMessage = computed(() => {
    const cleanDoc = inputDocumento.value.replace(/\D/g, '');
    if (cleanDoc.length > 0 && cleanDoc.length < 11) {
      return 'CPF incompleto. Mínimo 11 dígitos.';
    }
    if (cleanDoc.length > 11 && cleanDoc.length < 14) {
      return 'CNPJ incompleto. Mínimo 14 dígitos.';
    }
    if (cleanDoc.length === 11 || cleanDoc.length === 14) {
      if (!isDocumentoValido(cleanDoc)) {
        return 'CPF/CNPJ inválido.';
      }
    }
    return '';
});

const isFormValid = computed(() => {
    const cleanDoc = inputDocumento.value.replace(/\D/g, '');
    const docValido = isDocumentoValido(cleanDoc);

    return (
        form.nome.trim() !== '' &&
        form.telefone.trim() !== '' &&
        docValido &&
        (cleanDoc.length === 11 || cleanDoc.length === 14)
    );
});

// --- Ação de Salvar ---
const handleSubmit = async () => {
    if (!isFormValid.value) return;
    const success = await saveCadastro();
    if (success) {
        alert(`Cadastro ${isEditing.value ? 'atualizado' : 'criado'} com sucesso!`);
        //emit('navigate', { view: 'list' });
        router.push({ name: 'list' });
    }
    // O erro é exibido no próprio formulário pelo composable.
};

const handleCancel = () => {
    resetForm();
    //emit('navigate', { view: 'list' });
    router.push({ name: 'list' }); 
}
</script>

<template>
  <div class="form-view">
    <div class="card form-card">
      <h2>{{ isEditing ? 'Editar Cadastro (ID: ' + form.id + ')' : 'Novo Cadastro' }}</h2>
      
      <div v-if="error" class="error-state"><p>⚠️ {{ error }}</p></div>

      <form @submit.prevent="handleSubmit">
        
        <div class="form-fields">
            <div class="form-group full-width">
              <label for="nome">Nome/Razão Social</label>
              <InputText type="text" id="nome" v-model="form.nome" :disabled="loading" required class="p-inputtext-lg" />
            </div>

            <div class="form-group">
              <label for="documento">CPF/CNPJ</label>
              <InputText 
                type="text" 
                id="documento" 
                v-model="inputDocumento" 
                placeholder="Digite CPF ou CNPJ" 
                maxlength="18" 
                :disabled="loading" 
                required 
                :class="{ 'p-invalid': documentoValidationMessage }" 
              />
              <p v-if="documentoValidationMessage" class="error-message">{{ documentoValidationMessage }}</p>
            </div>

            <div class="form-group">
              <label for="telefone">Telefone</label>
              <InputText type="text" id="telefone" v-model="form.telefone" :disabled="loading" required /> 
            </div>
        </div>
        <div class="form-actions">
          <Button type="submit" :disabled="!isFormValid || loading" severity="success" rounded>
            <span v-if="loading">Salvando...</span>
            <span v-else>{{ isEditing ? 'Salvar Edição' : 'Adicionar Cadastro' }}</span>
          </Button>
          <Button type="button" @click="handleCancel" :disabled="loading" label="Cancelar" severity="secondary" rounded></Button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-view {
    display: flex;
    justify-content: center;
    padding: 20px;
}

.form-card {
    max-width: 800px; 
    width: 100%;
    padding: 30px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background-color: var(--color-background);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.form-card h2 {
    margin-top: 0;
    margin-bottom: 25px;
    color: var(--color-heading);
    border-bottom: 2px solid var(--color-border);
    padding-bottom: 10px;
}

.form-fields {
    display: grid;
    grid-template-columns: 1fr; 
    gap: 20px;
    margin-bottom: 30px;
}

@media (min-width: 600px) {
    .form-fields {
        grid-template-columns: 1fr 1fr; 
    }
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group.full-width {
    grid-column: 1 / -1; 
}

.form-group label {
    font-weight: bold;
    margin-bottom: 8px;
    color: var(--color-text);
}

.form-group :deep(.p-inputtext) {
    width: 100%;
    box-sizing: border-box;
    min-height: 40px; 
}

.error-message {
    color: var(--p-red-600);
    font-size: 0.9em;
    margin-top: 5px;
}

.form-actions {
    display: flex;
    gap: 15px;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid var(--color-border-hover);
}

.error-state {
    color: var(--p-red-600);
    background-color: var(--p-red-100);
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 15px;
}

.error-state p {
    margin: 0;
}
</style>