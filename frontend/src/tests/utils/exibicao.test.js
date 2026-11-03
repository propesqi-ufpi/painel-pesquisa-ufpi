import {
  limparTexto, limparNome, limparPessoas, formatarPessoas, valorExibicao, opcoesFiltro,
} from '../../utils/exibicao'

describe('limparTexto', () => {
  it.each([
    null, undefined, '', '   ', '-', '—', '--', 'N/A', 's/n', 'NaN', 'None',
    'Não informado', 'sem informação', '#NOME?', '#N/D', '#REF!', '#VALOR!', '#DIV/0!', '#N/A',
  ])('trata %p como vazio', (v) => {
    expect(limparTexto(v)).toBeNull()
  })

  it('normaliza NBSP, quebras de linha e espaços duplos', () => {
    expect(limparTexto('  Centro de   Tecnologia\n')).toBe('Centro de Tecnologia')
  })

  it('junta formas Unicode decompostas', () => {
    expect(limparTexto('Conceição')).toBe('Conceição')
  })

  it('mantém números e transforma NaN em vazio', () => {
    expect(limparTexto(2024)).toBe(2024)
    expect(limparTexto(0)).toBe(0)
    expect(limparTexto(Number.NaN)).toBeNull()
  })

  it('não confunde texto que só contém o placeholder', () => {
    expect(limparTexto('CT - Centro de Tecnologia')).toBe('CT - Centro de Tecnologia')
  })
})

describe('limparNome', () => {
  it.each([
    ['Prof. Dr. Carlos Exemplo Lima', 'Carlos Exemplo Lima', 'Doutor(a)'],
    ['DRA. MARIA DAS GRAÇAS EXEMPLO', 'Maria das Graças Exemplo', 'Doutor(a)'],
    ['Profª Ma. Ana de Sousa', 'Ana de Sousa', 'Mestre(a)'],
    ['Prof.ª Rita Amostra', 'Rita Amostra', null],
    ['Professora Doutora Lia Teste', 'Lia Teste', 'Doutor(a)'],
    ['João Teste da Silva, PhD', 'João Teste da Silva', 'Doutor(a)'],
    ['Pedro Modelo Dr.', 'Pedro Modelo', 'Doutor(a)'],
    ['M.Sc. Pedro Modelo', 'Pedro Modelo', 'Mestre(a)'],
    ['Esp. Joana Exemplo', 'Joana Exemplo', 'Especialista'],
    ['Mestre Paulo Amostra', 'Paulo Amostra', 'Mestre(a)'],
    ['jose dos santos', 'Jose dos Santos', null],
  ])('%s → %s', (bruto, nome, titulacao) => {
    expect(limparNome(bruto)).toEqual({ nome, titulacao })
  })

  it('não mexe em nomes que só começam como um título', () => {
    expect(limparNome('Drummond Exemplo').nome).toBe('Drummond Exemplo')
    expect(limparNome('Ma Long').nome).toBe('Ma Long')
    expect(limparNome('Professorinha Lima').nome).toBe('Professorinha Lima')
  })

  it('mantém a caixa de nomes já escritos em caixa mista', () => {
    expect(limparNome('Dr. Ana McAllister de Sousa').nome).toBe('Ana McAllister de Sousa')
  })

  it('capitaliza nomes compostos e com apóstrofo', () => {
    expect(limparNome("MARIA-JOSÉ D'ÁVILA FILHO II").nome).toBe("Maria-José D'Ávila Filho II")
  })

  it('vazio e erro de planilha viram null', () => {
    expect(limparNome('#NOME?')).toEqual({ nome: null, titulacao: null })
    expect(limparNome('  --  ')).toEqual({ nome: null, titulacao: null })
    expect(limparNome('Prof. Dr.')).toEqual({ nome: null, titulacao: 'Doutor(a)' })
  })
})

describe('limparPessoas e formatarPessoas', () => {
  it('separa por ponto e vírgula e barra', () => {
    expect(formatarPessoas('M.Sc. Pedro Modelo / Prof. Rita Amostra; DR. JOÃO TESTE'))
      .toBe('Pedro Modelo; Rita Amostra; João Teste')
  })

  it('separa " e " e vírgula só quando vem um título depois', () => {
    expect(formatarPessoas('PROF. DR.  JOSÉ DOS SANTOS e Profª Ana de Sousa'))
      .toBe('José dos Santos; Ana de Sousa')
    expect(formatarPessoas('Prof. Ana Lima, Prof. Rui Costa')).toBe('Ana Lima; Rui Costa')
    expect(formatarPessoas('Maria e Silva')).toBe('Maria e Silva')
    expect(formatarPessoas('Silva, João')).toBe('Silva, João')
    expect(formatarPessoas('João Teste da Silva, PhD')).toBe('João Teste da Silva')
  })

  it('descarta pedaços vazios', () => {
    expect(limparPessoas('Prof. Ana Lima; ; #N/D')).toEqual([{ nome: 'Ana Lima', titulacao: null }])
    expect(formatarPessoas(null)).toBeNull()
  })
})

describe('valorExibicao', () => {
  const linha = { coordenador: 'Prof. Dr. Ana Lima', centro: '#N/D', ano: 2024 }

  it('usa o tipo da coluna', () => {
    expect(valorExibicao({ key: 'coordenador', tipo: 'pessoas' }, linha)).toBe('Ana Lima')
    expect(valorExibicao({ key: 'coordenador', tipo: 'pessoa' }, linha)).toBe('Ana Lima')
  })

  it('sem tipo, só limpa vazios', () => {
    expect(valorExibicao({ key: 'coordenador' }, linha)).toBe('Prof. Dr. Ana Lima')
    expect(valorExibicao({ key: 'centro' }, linha)).toBeNull()
    expect(valorExibicao({ key: 'ano' }, linha)).toBe(2024)
  })
})

describe('opcoesFiltro', () => {
  it('rótulo limpo, valor bruto, sem vazios e em ordem pt-BR', () => {
    expect(opcoesFiltro(['Prof. Dr. Zeca Lima', 'ÁUREA COSTA', '#N/D', null, 'bruno dias'], { tipo: 'pessoa' }))
      .toEqual([
        { value: 'ÁUREA COSTA', label: 'Áurea Costa' },
        { value: 'bruno dias', label: 'Bruno Dias' },
        { value: 'Prof. Dr. Zeca Lima', label: 'Zeca Lima' },
      ])
  })

  it('ordena números pelo valor', () => {
    expect(opcoesFiltro([2010, 2009, 2024]).map((o) => o.label)).toEqual(['2009', '2010', '2024'])
  })
})
