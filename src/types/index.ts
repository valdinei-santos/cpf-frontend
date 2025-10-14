// As interfaces definidas aqui estarão disponíveis no código typescript 
export interface Cadastro {
  id: string | null;
  nome: string; // Nome/Razão Social
  documento: string; // CPF/CNPJ (somente números)
  telefone: string;
  bloqueado: boolean;
}