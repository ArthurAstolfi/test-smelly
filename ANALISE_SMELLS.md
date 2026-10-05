# Análise Manual de Test Smells

Arquivo analisado: `test/userService.smelly.test.js`

| # | Teste | Smell | Por que é um problema / risco |
|---|-------|-------|-------------------------------|
| 1 | `deve criar e buscar um usuário corretamente` | **Eager Test** (teste ansioso) | Exercita dois comportamentos (`createUser` e `getUserById`) em um único teste, com dois "Act". Se falhar, não fica claro qual funcionalidade quebrou; o nome do teste esconde dois cenários. |
| 2 | `deve desativar usuários se eles não forem administradores` | **Conditional Test Logic** (lógica condicional: `for` + `if/else`) | O teste tem lógica própria que pode conter bugs. Os `expect` ficam dentro de `if`, então podem nunca ser executados (ex.: se a lista estiver vazia ou o `isAdmin` vier errado) e o teste passa sem verificar nada. Mistura dois cenários (comum e admin) num só teste. |
| 3 | `deve gerar um relatório de usuários formatado` | **Fragile Test / Sensitive Equality** (teste frágil) | Compara a string exata do relatório (espaços, vírgulas, `\n`, ordem dos campos). Qualquer mudança cosmética de formatação quebra o teste mesmo sem bug real. O próprio código avisa que "o formato do relatório pode mudar". |
| 4 | `deve falhar ao criar usuário menor de idade` | **Exception Handling / Silent Failure** (`try/catch` com `expect` condicional) | Se a exceção **não** for lançada, o `catch` não roda, nenhum `expect` é executado e o teste passa. Um bug que remova a validação de idade passaria despercebido (falso positivo). |
| 5 | `deve retornar uma lista vazia quando não há usuários` | **Disabled Test / Empty Test** (`test.skip` sem corpo) | Teste desabilitado e vazio dá falsa sensação de cobertura; o cenário "nenhum usuário" nunca é verificado. |
| 6 | Vários | **Mystery Guest (leve) / Magic values** | Dados como `'Comum'`, `30`, `40`, `true` aparecem soltos; o significado do `true` (isAdmin) não é evidente na leitura. |
| 7 | Todos | **Ausência de AAA explícito** | Arrange, Act e Assert estão misturados (ex.: asserts entre dois Acts no teste 1), dificultando a leitura. |

## Comparação com o ESLint (Etapa 4)

Saída da primeira execução (`eslint-antes.txt`): **6 problemas (4 erros, 2 avisos)**.

| Linha | Regra | Smell manual correspondente |
|-------|-------|-----------------------------|
| 44, 46, 49 | `jest/no-conditional-expect` (error) | #2 Conditional Test Logic |
| 73 | `jest/no-conditional-expect` (error) | #4 `try/catch` com expect condicional |
| 77 | `jest/no-disabled-tests` (warning) | #5 Disabled Test |
| 77 | `jest/expect-expect` (warning) | #5 Empty Test (sem asserções) |

**Detectados só manualmente** (o linter não pega): #1 Eager Test, #3 Fragile Test /
Sensitive Equality, #6 valores mágicos e #7 ausência de AAA. Isso mostra que a ferramenta
automatiza os smells *sintáticos*, mas os *semânticos* ainda exigem revisão humana.
