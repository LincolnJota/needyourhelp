export type User = { email: string; name: string }; // Definindo o tipo User

let connectedUsers: User[] = []; // Lista de usuários conectados

// Função para adicionar um usuário à lista
export const addUser = (user: User) => {
  // Verifica se o usuário já está na lista, comparando o email
  if (!connectedUsers.some(u => u.email === user.email)) {
    connectedUsers = [...connectedUsers, user]; // Adiciona o usuário sem modificar diretamente o array original
  }
};

// Função para remover um usuário da lista
export const removeUser = (email: string) => {
  // Filtra a lista removendo o usuário com o email correspondente
  connectedUsers = connectedUsers.filter(user => user.email !== email);
};

// Função para obter a lista de usuários conectados
export const getConnectedUsers = (): User[] => {
  return connectedUsers;
};
