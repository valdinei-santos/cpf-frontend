import { ref, reactive, readonly } from 'vue'; 
import type { Ref, DeepReadonly } from 'vue';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8889/api/v1/'; // Ajuste conforme a porta e caminho da sua API Go

export interface CadastroForm {
  id: number | null;
  nome: string; 
  documento: string; // CPF/CNPJ (somente números)
  telefone: string;
  bloqueado: boolean;
}

export interface Cadastro extends Omit<CadastroForm, 'id'> { // Herda tudo, exceto 'id'
    id: number;
}

interface ApiResponse<T> {
    data: T;
}
const initialFormState: CadastroForm = {
  id: null,
  nome: '',
  documento: '',
  telefone: '',
  bloqueado: false,
};

const clientes: Ref<Cadastro[]> = ref([]) as Ref<Cadastro[]>;

const form: CadastroForm = reactive({ ...initialFormState }); 
const loading: Ref<boolean> = ref(false); 
const error: Ref<string | null> = ref(null); 
const isEditing: Ref<boolean> = ref(false);

export const resetForm = (): void => {
  Object.assign(form, initialFormState); 
  isEditing.value = false;
  error.value = null;
};

export const fetchCadastros = async (): Promise<void> => {
  loading.value = true;
  error.value = null;
  try {
    // GET: /api/cliente
    const response: ApiResponse<Cadastro[]> = await axios.get(`${API_BASE_URL}/cliente`);
    clientes.value = response.data; // Assumindo que a resposta do seu backend é um array de Cadastro
  } catch (err: any) {
    // Trata erros de rede ou resposta HTTP não-2xx
    error.value = `Erro ao buscar clientes: ${err.message || 'Erro desconhecido'}`;
    console.error('Erro na requisição GET:', err);
  } finally {
    loading.value = false;
  }
};

export const saveCadastro = async (): Promise<boolean> => {
  loading.value = true;
  error.value = null;
  
  try {
    const dataToSend: CadastroForm = { ...form }; 
    let response: ApiResponse<Cadastro>;

    if (isEditing.value && dataToSend.id !== null) {
      // PUT: /api/cliente/{id}
      response = await axios.put(`${API_BASE_URL}/cliente/${dataToSend.id}`, dataToSend);
      
      // Opcional: Atualiza o item na lista local com a resposta do servidor
      const index = clientes.value.findIndex(c => c.id === dataToSend.id);
      if (index !== -1) {
        Object.assign(clientes.value[index]!, response.data);
      }

    } else {
      // POST: /api/cliente
      response = await axios.post(`${API_BASE_URL}/cliente`, dataToSend);
      
      // Opcional: Adiciona o novo item (com ID gerado pelo DB) à lista local
      clientes.value.push(response.data);
    }
    
    resetForm(); // Limpa o formulário após o sucesso
    return true; 
  } catch (err: any) {
    error.value = `Erro ao salvar cadastro: ${err.response?.data?.message || err.message || 'Erro desconhecido'}`;
    console.error('Erro na requisição POST/PUT:', err.response || err);
    return false;
  } finally {
    loading.value = false;
  }
};

export const deleteCadastro = async (id: number): Promise<boolean> => {
  loading.value = true;
  error.value = null;

  try {
    // DELETE: /api/cliente/{id}
    await axios.delete(`${API_BASE_URL}/cliente/${id}`);
    
    // Opcional: Remove o item da lista local
    clientes.value = clientes.value.filter(c => c.id !== id);

    return true;
  } catch (err: any) {
    error.value = `Erro ao excluir cliente: ${err.response?.data?.message || err.message || 'Erro desconhecido'}`;
    console.error('Erro na requisição DELETE:', err.response || err);
    return false;
  } finally {
    loading.value = false;
  }
};

export const toggleBlockStatus = async (id: number): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
        const currentCad = clientes.value.find(c => c.id === id);
        if (!currentCad) return;

        // Idealmente, você faria um PATCH com o campo que mudou (bloqueado)
        // Se a sua API só aceitar PUT, você pode usar:
        const updatedData = { 
            ...currentCad, 
            bloqueado: !currentCad.bloqueado 
        } as CadastroForm; // O ID deve estar presente aqui

        // PUT/PATCH: /api/cliente/{id}
        const response: ApiResponse<Cadastro> = await axios.put(`${API_BASE_URL}/cliente/${id}`, updatedData);

        // Atualiza a lista local com a resposta do servidor
        const index = clientes.value.findIndex(c => c.id === id);
        if (index !== -1) {
            Object.assign(clientes.value[index]!, response.data);
        }

    } catch (err: any) {
        error.value = `Erro ao atualizar status de bloqueio: ${err.response?.data?.message || err.message || 'Erro desconhecido'}`;
        console.error('Erro no toggleBlockStatus:', err.response || err);
    } finally {
        loading.value = false;
    }
};


// --- Função Principal Composable (Tipada) ---
export function useCadastros() {
    return {
        // Estado
        clientes: readonly(clientes) as DeepReadonly<Ref<Cadastro[]>>,
        form: form as CadastroForm,
        loading: readonly(loading),
        error: readonly(error),
        isEditing,

        // Ações
        fetchCadastros,
        saveCadastro,
        deleteCadastro,
        resetForm,
        toggleBlockStatus,
    };
}