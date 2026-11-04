import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cadastrar } from '../api/index.js'
import LoadingSpinner from '../components/LoadingSpinner'
import { Brasao } from '../components/Marca'

export default function Cadastro() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (username.trim().length < 3) {
      setErro('Usuário deve ter pelo menos 3 caracteres.')
      return
    }
    if (password.length < 6) {
      setErro('Senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (password !== confirmar) {
      setErro('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      await cadastrar(username.trim(), password)
      setSucesso(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setErro(err.response?.data?.detail ?? 'Erro ao cadastrar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-faixa flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-superficie rounded-2xl shadow-2xl overflow-hidden">

        {/* Cabeçalho */}
        <div className="bg-faixa px-8 pt-7 pb-6 text-center border-b-[3px] border-ouro flex flex-col items-center">
          <Brasao tamanho="lg" />
          <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.08em] text-white/75">UFPI · PROPESQI</p>
          <h1 className="mt-1 text-white text-xl font-bold leading-tight">
            Criar conta
          </h1>
          <p className="text-white/70 text-sm mt-1">Painel de Pesquisa e Inovação</p>
        </div>

        {sucesso ? (
          <div className="px-8 py-10 text-center space-y-3">
            <p className="text-verde font-semibold">Cadastro realizado com sucesso!</p>
            <p className="text-sm text-texto-suave">Redirecionando para o login…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">

            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-sm font-medium text-texto">
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
              <label htmlFor="password" className="text-sm font-medium text-texto">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="border border-borda rounded-lg px-4 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-azul"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmar" className="text-sm font-medium text-texto">
                Confirmar Senha
              </label>
              <input
                id="confirmar"
                type="password"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                required
                autoComplete="new-password"
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
                  Cadastrando…
                </>
              ) : (
                'Cadastrar'
              )}
            </button>

            {erro && (
              <p className="text-perigo text-xs text-center">{erro}</p>
            )}
          </form>
        )}

        {/* Rodapé */}
        <div className="px-8 pb-7 text-center">
          <p className="text-sm text-texto-suave">
            Já tem conta?{' '}
            <Link to="/login" className="text-azul font-medium hover:underline">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
