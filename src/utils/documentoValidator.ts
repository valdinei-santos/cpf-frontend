/**
 * Aplica a máscara dinâmica de CPF ou CNPJ.
 * @param {string} value - Valor do input (somente números)
 * @returns {string} - Valor mascarado
 */
export const maskDocumento = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '');

    if (cleanValue.length <= 11) {
        // CPF: 999.999.999-99
        return cleanValue
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
        // CNPJ: 99.999.999/9999-99 (limita a 14 dígitos)
        const cnpjValue = cleanValue.substring(0, 14);
        return cnpjValue
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2')
    }
};

/**
 * Valida o CPF (Dígito Verificador) 
 * @param {string} cpf - CPF com 11 dígitos (somente números)
 * @returns {boolean}
 */
const validateCPF = (cpf: string): boolean => {
    if (cpf.length !== 11) return false;

    // Checa repetição de dígitos
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0;
    let remainder;
    
    // --- Cálculo do 1º Dígito Verificador ---
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    remainder = sum % 11;
    let dv1 = remainder < 2 ? 0 : 11 - remainder;

    if (dv1 !== parseInt(cpf.charAt(9))) return false;

    sum = 0;

    // --- Cálculo do 2º Dígito Verificador ---
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = sum % 11;
    let dv2 = remainder < 2 ? 0 : 11 - remainder;

    if (dv2 !== parseInt(cpf.charAt(10))) return false;

    return true;
};

/**
 * Valida o CNPJ (Dígito Verificador) - Lógica Revisada.
 * @param {string} cnpj - CNPJ com 14 dígitos (somente números)
 * @returns {boolean}
 */
const validateCNPJ = (cnpj: string): boolean => {
    if (cnpj.length !== 14) return false;

    // Checa repetição de dígitos
    if (/^(\d)\1{13}$/.test(cnpj)) return false;

    // Peso para o cálculo do DV (1º e 2º)
    let size = 12;
    let numbers = cnpj.substring(0, size);
    const digits = cnpj.substring(size);
    let sum = 0;
    let pos = size - 7;
    let result = 0;
    
    // --- Cálculo do 1º Dígito Verificador ---
    for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result != parseInt(digits.charAt(0))) return false;

    // --- Cálculo do 2º Dígito Verificador ---
    size = 13;
    numbers = cnpj.substring(0, size);
    sum = 0;
    pos = size - 7;
    
    for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result != parseInt(digits.charAt(1))) return false;

    return true;
};

/**
 * Validação principal de CPF ou CNPJ.
 * @param {string} doc - CPF ou CNPJ (somente números)
 * @returns {boolean} - Se é um documento válido.
 */
export const isDocumentoValido = (doc: string): boolean => {
    const cleanDoc = doc.replace(/\D/g, '');

    if (cleanDoc.length === 11) {
        return validateCPF(cleanDoc);
    } else if (cleanDoc.length === 14) {
        return validateCNPJ(cleanDoc);
    }

    // Se não tem 11 ou 14 dígitos, é inválido.
    return false; 
};