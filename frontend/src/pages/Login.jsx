import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { Brasao } from '../components/Marca'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const { entrar } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    const resultado = await entrar(username, password)
    setLoading(false)
    if (resultado.sucesso) {
      navigate('/')
    } else {
      setErro('Usuário ou senha inválidos.')
    }
  }

  return (
    <div className="min-h-screen bg-faixa flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-superficie rounded-2xl shadow-2xl overflow-hidden">

        {/* Cabeçalho do card */}
        <div className="bg-faixa px-8 pt-7 pb-6 text-center border-b-[3px] border-ouro flex flex-col items-center">
          <Brasao tamanho="lg" />
          <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.08em] text-white/75">UFPI · PROPESQI</p>
          <h1 className="mt-1 text-white text-xl font-bold leading-tight">
            Painel de Pesquisa e Inovação
          </h1>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="username"
              className="text-sm font-medium text-texto"
            >
              Usuário
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="border border-borda rounded-lg px-4 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-azul"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-texto"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="border border-borda rounded-lg px-4 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-azul"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-azul text-sobre-azul rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Entrando…
              </>
            ) : (
              'Entrar'
            )}
          </button>

          {erro && (
            <p className="text-perigo text-xs text-center">{erro}</p>
          )}
        </form>

        {/* Rodapé */}
        <div className="px-8 pb-7 text-center">
          <p className="text-sm text-texto-suave">
            Não tem cadastro?{' '}
            <Link
              to="/cadastro"
              className="text-azul font-medium hover:underline"
            >
              Cadastre-se agora
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
