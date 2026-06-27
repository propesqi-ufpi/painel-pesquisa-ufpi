import axios from 'axios'

const api = axios.create({
  baseURL: '',
  paramsSerializer: { indexes: null },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    } else {
      console.error('[API]', error.config?.url, error.response?.status ?? error.message)
    }
    return Promise.reject(error)
  }
)

const r = (res) => res.data

// Auth
export const login = (username, password) =>
  api.post('/api/auth/login', { username, password }).then(r)

export const cadastrar = (username, password) =>
  api.post('/api/auth/cadastro', { username, password }).then(r)

// Dashboard
export const getKPIs = () => api.get('/api/dashboard/kpis').then(r)

// Projetos PDI
export const getProjetosPDI     = (params) => api.get('/api/projetos/pdi', { params }).then(r)
export const getKPIsProjetosPDI = ()       => api.get('/api/projetos/pdi/kpis').then(r)
export const getPorAreaPDI      = (params) => api.get('/api/projetos/pdi/por-area', { params }).then(r)
export const getPorCentroPDI    = (params) => api.get('/api/projetos/pdi/por-centro', { params }).then(r)
export const getFiltrosPDI      = (params) => api.get('/api/projetos/pdi/filtros', { params }).then(r)

// Projetos FINEP
export const getProjetosFinep    = (params) => api.get('/api/finep', { params }).then(r)
export const getKPIsFinep        = ()       => api.get('/api/finep/kpis').then(r)
export const getRelacaoTipoFinep = (params) => api.get('/api/finep/relacao-tipo', { params }).then(r)
export const getPorCentroFinep   = (params) => api.get('/api/finep/por-centro', { params }).then(r)
export const getFiltrosFinep     = (params) => api.get('/api/finep/filtros', { params }).then(r)

// Produção Intelectual
export const getProducaoAnual = (params) => api.get('/api/producao/anual', { params }).then(r)
export const getTiposProducao = ()       => api.get('/api/producao/anual/tipos').then(r)
export const getAnosProducao  = ()       => api.get('/api/producao/anual/anos').then(r)
export const getVitrine       = (params) => api.get('/api/producao/vitrine', { params }).then(r)
export const getKPIsProducao  = ()       => api.get('/api/producao/kpis').then(r)
export const getInventores    = ()       => api.get('/api/producao/vitrine/inventores').then(r)

// Bolsistas
export const getBolsistas          = (params) => api.get('/api/bolsistas', { params }).then(r)
export const getKPIsBolsistas      = ()       => api.get('/api/bolsistas/kpis').then(r)
export const getBolsistasPorCampus = (params) => api.get('/api/bolsistas/por-campus', { params }).then(r)
export const getFiltrosBolsistas   = (params) => api.get('/api/bolsistas/filtros', { params }).then(r)

// Núcleos
export const getNucleos          = (params) => api.get('/api/nucleos', { params }).then(r)
export const getKPIsNucleos      = ()       => api.get('/api/nucleos/kpis').then(r)
export const getNucleosPorCentro = (params) => api.get('/api/nucleos/por-centro', { params }).then(r)
export const getFiltrosNucleos   = (params) => api.get('/api/nucleos/filtros', { params }).then(r)

// Grupos
export const getGrupos        = (params) => api.get('/api/grupos', { params }).then(r)
export const getKPIsGrupos    = ()       => api.get('/api/grupos/kpis').then(r)
export const getGruposPorArea = (params) => api.get('/api/grupos/por-area', { params }).then(r)
export const getFiltrosGrupos = (params) => api.get('/api/grupos/filtros', { params }).then(r)

// Incubadas
export const getIncubadas              = (params) => api.get('/api/incubadas', { params }).then(r)
export const getKPIsIncubadas          = ()       => api.get('/api/incubadas/kpis').then(r)
export const getIncubadasPorIncubadora = (params) => api.get('/api/incubadas/por-incubadora', { params }).then(r)
export const getFiltrosIncubadas       = (params) => api.get('/api/incubadas/filtros', { params }).then(r)

// Pós-Graduação
export const getPosGraduacao          = (params) => api.get('/api/pos-graduacao', { params }).then(r)
export const getKPIsPosGraduacao      = ()       => api.get('/api/pos-graduacao/kpis').then(r)
export const getPosGraduacaoPorCentro = (params) => api.get('/api/pos-graduacao/por-centro', { params }).then(r)
export const getFiltrosPosGraduacao   = (params) => api.get('/api/pos-graduacao/filtros', { params }).then(r)

// Laboratórios
export const getLaboratorios          = (params) => api.get('/api/laboratorios', { params }).then(r)
export const getKPIsLaboratorios      = ()       => api.get('/api/laboratorios/kpis').then(r)
export const getLaboratoriosPorCentro = (params) => api.get('/api/laboratorios/por-centro', { params }).then(r)
export const getFiltrosLaboratorios   = (params) => api.get('/api/laboratorios/filtros', { params }).then(r)

export default api
