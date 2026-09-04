import axios from "axios";

const api = axios.create({
  baseURL: "https://workmarch-gateway.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const user = getUserFromStorage();
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
);

function getUserFromStorage() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const authService = {

  login: async (credentials) => {
    const response = await api.post("/api/login", credentials);
    const userData = response.data;

    // Persiste na storage para que o interceptor injete o Bearer nas próximas chamadas
    localStorage.setItem("user", JSON.stringify(userData));

    return userData;
  },

  logout: () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  getUser: () => getUserFromStorage(),
  isAuthenticated: () => !!getUserFromStorage()?.token,
};

export const usuariosService = {
  criar: async (data) => {
    const response = await api.post("/api/usuarios", data);
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/api/usuarios/${id}`);
    return response.data;
  },

  atualizar: async (id, data) => {
    const response = await api.put(`/api/usuarios/${id}`, data);
    return response.data;
  },

  excluir: async (id) => {
    return await api.delete(`/api/usuarios/${id}`);
  },
};

export const profissionaisService = {
  criar: async (data) => {
    const response = await api.post("/api/profissionais", data);
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/api/profissionais/${id}`);
    return response.data;
  },
};

export const validacaoService = {
  validarCpf: async (cpf) => {
    const response = await api.post("/api/validar/cpf", { cpf });
    return response.data; // { valido: boolean }
  },

  cpfExiste: async (cpf) => {
    const response = await api.get(`/api/validar/cpf-existe/${cpf}`);
    return response.data; // { existe: boolean }
  },

  emailExiste: async (email) => {
    const response = await api.get(`/api/validar/email-existe/${email}`);
    return response.data; // { existe: boolean }
  },
};

export default api;