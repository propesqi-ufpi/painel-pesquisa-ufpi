import forms from '@tailwindcss/forms'

// Cores vêm das variáveis de src/index.css, que mudam com o tema (.dark).
const token = (nome) => `rgb(var(--${nome}) / <alpha-value>)`

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        faixa:        token('faixa'),
        'sobre-faixa': token('sobre-faixa'),
        azul: {
          DEFAULT: token('azul'),
          suave:   token('azul-suave'),
          // Nomes antigos, mantidos para não quebrar nada que tenha escapado da troca.
          escuro:  token('faixa'),
          medio:   token('azul'),
          claro:   token('azul-suave'),
          btn:     token('azul'),
        },
        'sobre-azul':   token('sobre-azul'),
        ouro:           token('ouro'),
        verde:          token('verde'),
        perigo:         token('perigo'),
        fundo:          token('fundo'),
        superficie: {
          DEFAULT: token('superficie'),
          2:       token('superficie-2'),
        },
        borda:          token('borda'),
        texto: {
          DEFAULT: token('texto'),
          suave:   token('texto-suave'),
        },
      },
      fontFamily: {
        sans:      ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        condensed: ['"IBM Plex Sans Condensed"', '"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [forms],
}
