const { UserService } = require('../src/userService');

const MENSAGEM_CAMPOS_OBRIGATORIOS = 'Nome, email e idade são obrigatórios.';
const MENSAGEM_MENOR_DE_IDADE = 'O usuário deve ser maior de idade.';

describe('UserService', () => {
  let userService;

  // Cria um usuário com dados válidos, permitindo sobrescrever apenas o que importa no teste
  const criarUsuario = ({
    nome = 'Fulano de Tal',
    email = 'fulano@teste.com',
    idade = 25,
    isAdmin = false,
  } = {}) => userService.createUser(nome, email, idade, isAdmin);

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  describe('createUser', () => {
    test('deve retornar o usuário criado com id gerado e os dados informados', () => {
      // Arrange
      const dados = { nome: 'Maria Silva', email: 'maria@teste.com', idade: 30 };

      // Act
      const usuario = criarUsuario(dados);

      // Assert
      expect(usuario).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          nome: dados.nome,
          email: dados.email,
          idade: dados.idade,
        })
      );
    });

    test('deve criar usuário com status ativo e não administrador por padrão', () => {
      // Arrange
      const nome = 'Maria Silva';

      // Act
      const usuario = criarUsuario({ nome });

      // Assert
      expect(usuario.status).toBe('ativo');
      expect(usuario.isAdmin).toBe(false);
    });

    test('deve gerar ids diferentes para usuários diferentes', () => {
      // Arrange
      const primeiro = criarUsuario({ email: 'a@teste.com' });

      // Act
      const segundo = criarUsuario({ email: 'b@teste.com' });

      // Assert
      expect(segundo.id).not.toBe(primeiro.id);
    });

    test('deve lançar erro ao criar usuário menor de idade', () => {
      // Arrange
      const idadeMenor = 17;

      // Act
      const criarMenor = () => criarUsuario({ idade: idadeMenor });

      // Assert
      expect(criarMenor).toThrow(MENSAGEM_MENOR_DE_IDADE);
    });

    test('deve permitir criar usuário com exatamente 18 anos', () => {
      // Arrange
      const idadeLimite = 18;

      // Act
      const usuario = criarUsuario({ idade: idadeLimite });

      // Assert
      expect(usuario.idade).toBe(idadeLimite);
    });

    test('deve lançar erro quando o nome não é informado', () => {
      // Arrange
      const nomeVazio = '';

      // Act
      const criarSemNome = () => criarUsuario({ nome: nomeVazio });

      // Assert
      expect(criarSemNome).toThrow(MENSAGEM_CAMPOS_OBRIGATORIOS);
    });

    test('deve lançar erro quando o email não é informado', () => {
      // Arrange
      const emailVazio = '';

      // Act
      const criarSemEmail = () => criarUsuario({ email: emailVazio });

      // Assert
      expect(criarSemEmail).toThrow(MENSAGEM_CAMPOS_OBRIGATORIOS);
    });
  });

  describe('getUserById', () => {
    test('deve retornar o usuário cadastrado quando o id existe', () => {
      // Arrange
      const usuarioCriado = criarUsuario({ nome: 'João' });

      // Act
      const usuarioBuscado = userService.getUserById(usuarioCriado.id);

      // Assert
      expect(usuarioBuscado).toEqual(usuarioCriado);
    });

    test('deve retornar null quando o id não existe', () => {
      // Arrange
      const idInexistente = 'id-que-nao-existe';

      // Act
      const resultado = userService.getUserById(idInexistente);

      // Assert
      expect(resultado).toBeNull();
    });
  });

  describe('deactivateUser', () => {
    test('deve desativar um usuário comum e retornar true', () => {
      // Arrange
      const usuarioComum = criarUsuario({ isAdmin: false });

      // Act
      const resultado = userService.deactivateUser(usuarioComum.id);

      // Assert
      expect(resultado).toBe(true);
      expect(userService.getUserById(usuarioComum.id).status).toBe('inativo');
    });

    test('não deve desativar um administrador e deve retornar false', () => {
      // Arrange
      const usuarioAdmin = criarUsuario({ isAdmin: true });

      // Act
      const resultado = userService.deactivateUser(usuarioAdmin.id);

      // Assert
      expect(resultado).toBe(false);
      expect(userService.getUserById(usuarioAdmin.id).status).toBe('ativo');
    });

    test('deve retornar false ao tentar desativar um usuário inexistente', () => {
      // Arrange
      const idInexistente = 'id-que-nao-existe';

      // Act
      const resultado = userService.deactivateUser(idInexistente);

      // Assert
      expect(resultado).toBe(false);
    });
  });

  describe('generateUserReport', () => {
    test('deve incluir id, nome e status de cada usuário cadastrado', () => {
      // Arrange
      const alice = criarUsuario({ nome: 'Alice', email: 'alice@email.com' });
      const bob = criarUsuario({ nome: 'Bob', email: 'bob@email.com' });

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain(alice.id);
      expect(relatorio).toContain('Alice');
      expect(relatorio).toContain(bob.id);
      expect(relatorio).toContain('Bob');
      expect(relatorio).toContain('ativo');
    });

    test('deve refletir o status inativo de um usuário desativado', () => {
      // Arrange
      const usuario = criarUsuario({ nome: 'Carlos' });
      userService.deactivateUser(usuario.id);

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('inativo');
    });

    test('deve informar que não há usuários quando nenhum está cadastrado', () => {
      // Arrange
      // (banco limpo no beforeEach)

      // Act
      const relatorio = userService.generateUserReport();

      // Assert
      expect(relatorio).toContain('Nenhum usuário cadastrado');
    });
  });
});
