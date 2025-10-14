import { ref, reactive, readonly } from 'vue'; 
import type { Ref, DeepReadonly } from 'vue';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.37.143:8889/api/v1'; // Ajuste conforme a porta e caminho da sua API Go

export interface ClienteListResponse {
  clientes: Cliente[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

export interface ClienteForm {
  id: string | null;
  nome: string; 
  documento: string; // CPF/CNPJ (somente números)
  telefone: string;
  bloqueado: boolean;
}

export interface Cliente extends Omit<ClienteForm, 'id'> { // Herda tudo, exceto 'id'
    id: string;
}

interface ApiResponse<T> {
    data: T;
}
const initialFormState: ClienteForm = {
  id: null,
  nome: '',
  documento: '',
  telefone: '',
  bloqueado: false,
};

const clientes: Ref<Cliente[]> = ref([]) as Ref<Cliente[]>;

const form: ClienteForm = reactive({ ...initialFormState }); 
const loading: Ref<boolean> = ref(false); 
const error: Ref<string | null> = ref(null); 
const isEditing: Ref<boolean> = ref(false);

export const resetForm = (): void => {
  Object.assign(form, initialFormState); 
  isEditing.value = false;
  error.value = null;
};

export const fetchClientes = async (): Promise<void> => {
  loading.value = true;
  error.value = null;
  try {
    // GET: /api/cliente
    const response: ApiResponse<ClienteListResponse> = await axios.get(`${API_BASE_URL}/cliente`);
    //console.log('/cliente da API:', response.data);
    clientes.value = response.data.clientes; // Assumindo que a resposta do seu backend é um array de Cliente
  } catch (err: any) {
    // Trata erros de rede ou resposta HTTP não-2xx
    error.value = `Erro ao buscar clientes: ${err.message || 'Erro desconhecido'}`;
    console.error('Erro na requisição GET:', err);
  } finally {
    loading.value = false;
  }
};

export const saveCliente = async (): Promise<boolean> => {
  loading.value = true;
  error.value = null;
  
  try {
    const dataToSend: ClienteForm = { ...form }; 
    let response: ApiResponse<Cliente>;

    if (isEditing.value && dataToSend.id !== null) {
      // PUT: /api/cliente/{id}
      response = await axios.put(`${API_BASE_URL}/cliente/${dataToSend.id}`, dataToSend);
      
      const index = clientes.value.findIndex(c => c.id === dataToSend.id);
      if (index !== -1) {
        Object.assign(clientes.value[index]!, response.data);
      }

    } else {
      // POST: /api/cliente
      response = await axios.post(`${API_BASE_URL}/cliente`, dataToSend);
      
      // Coloca o novo item na lista local
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

export const deleteCliente = async (id: string): Promise<boolean> => {
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

export const toggleBlockStatus = async (id: string): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
        const currentCad = clientes.value.find(c => c.id === id);
        if (!currentCad) return;

        console.log('Toggle bloqueado para1:', currentCad);
        const updatedData: ClienteForm = { 
          id: currentCad.id,
          nome: currentCad.nome,
          documento: currentCad.documento,
          telefone: currentCad.telefone,
          // Inverte o status de bloqueio
          bloqueado: !currentCad.bloqueado 
        };
        console.log('Toggle bloqueado para2:', updatedData);

        // Idealmente, você faria um PATCH com o campo que mudou (bloqueado)
        // Se a sua API só aceitar PUT, você pode usar:
        /* const updatedData = { 
            ...currentCad, 
            bloqueado: !currentCad.bloqueado 
        } as ClienteForm; // O ID deve estar presente aqui */

        // PUT/PATCH: /api/v1/cliente/{id}
        const response: ApiResponse<Cliente> = await axios.put(`${API_BASE_URL}/cliente/${id}`, updatedData);

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
export function useClientes() {
    return {
        // Estado
        clientes: readonly(clientes) as DeepReadonly<Ref<Cliente[]>>,
        form: form as ClienteForm,
        loading: readonly(loading),
        error: readonly(error),
        isEditing,

        // Ações
        fetchClientes,
        saveCliente,
        deleteCliente,
        resetForm,
        toggleBlockStatus,
    };
}