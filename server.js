// ===============================
// InstinctBank - SERVER FINAL
// ===============================

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Chave JWT
const JWT_SECRET = process.env.JWT_SECRET || "segredo123";

// ===============================
// FUNÇÃO: AUTENTICAÇÃO JWT
// ===============================
function autenticado(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ erro: "Token não enviado" });

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ erro: "Token inválido" });
  }
}

// ===============================
// LOGIN
// ===============================
app.post('/login', (req, res) => {
  const { usuario, senha } = req.body;
  if (!usuario || !senha) return res.status(400).json({ erro: "Dados incompletos" });

  db.query("SELECT * FROM perfil WHERE usuario = ?", [usuario], (err, results) => {
    if (err) return res.status(500).json({ erro: err });
    if (results.length === 0) return res.status(400).json({ erro: "Usuário não encontrado" });

    const user = results[0];

    if (user.senha !== senha)
      return res.status(401).json({ erro: "Senha incorreta" });

    const token = jwt.sign({ usuario }, JWT_SECRET, { expiresIn: "24h" });

    res.json({ ok: true, token });
  });
});

// ===============================
// PERFIL - BUSCAR
// ===============================
app.get('/usuario/:username', autenticado, (req, res) => {
  const { username } = req.params;

  db.query("SELECT * FROM perfil WHERE usuario = ?", [username], (err, result) => {
    if (err) return res.status(500).json({ erro: err });
    res.json(result[0]);
  });
});

// ===============================
// PERFIL - ATUALIZAR
// ===============================
app.put('/usuario/:username', autenticado, (req, res) => {
  const { username } = req.params;
  const dados = req.body;

  db.query("UPDATE perfil SET ? WHERE usuario = ?", [dados, username], (err) => {
    if (err) return res.status(500).json({ erro: err });
    res.json({ ok: true });
  });
});

// ===============================
// SALDO DO USUÁRIO
// ===============================
app.get('/saldo/:username', autenticado, (req, res) => {
  const { username } = req.params;

  db.query("SELECT saldo FROM perfil WHERE usuario = ?", [username], (err, r) => {
    if (err) return res.status(500).json({ erro: err });
    res.json({ saldo: r[0].saldo });
  });
});

// ===============================
// DEPÓSITO
// ===============================
app.post('/depositar', autenticado, (req, res) => {
  const { usuario, valor } = req.body;

  db.query(
    "UPDATE perfil SET saldo = saldo + ? WHERE usuario = ?",
    [valor, usuario],
    (err) => {
      if (err) return res.status(500).json({ erro: err });
      res.json({ ok: true });
    }
  );
});

// ===============================
// TRANSFERÊNCIA
// ===============================
app.post('/transferir', autenticado, (req, res) => {
  const { origem, destino, valor } = req.body;

  db.query("SELECT saldo FROM perfil WHERE usuario = ?", [origem], (err, r) => {
    if (err) return res.status(500).json({ erro: err });

    if (r[0].saldo < valor)
      return res.status(400).json({ erro: "Saldo insuficiente" });

    db.query("UPDATE perfil SET saldo = saldo - ? WHERE usuario = ?", [valor, origem]);
    db.query("UPDATE perfil SET saldo = saldo + ? WHERE usuario = ?", [valor, destino]);

    res.json({ ok: true });
  });
});

// ===============================
// CARTÕES - LISTAR
// ===============================
app.get('/cartoes/:username', autenticado, (req, res) => {
  db.query(
    "SELECT * FROM cartao WHERE usuario = ? ORDER BY id DESC",
    [req.params.username],
    (err, r) => {
      if (err) return res.status(500).json({ erro: err });
      res.json(r);
    }
  );
});

// ===============================
// CARTÕES - GERAR
// ===============================
app.post('/cartoes/:username', autenticado, (req, res) => {
  const { username } = req.params;
  const { numero, validade, cvv } = req.body;

  db.query(
    "INSERT INTO cartao (usuario, numero, validade, cvv) VALUES (?, ?, ?, ?)",
    [username, numero, validade, cvv],
    (err) => {
      if (err) return res.status(500).json({ erro: err });
      res.json({ ok: true });
    }
  );
});

// ===============================
// CARTÕES - EXCLUIR
// ===============================
app.delete('/cartoes/:username/:id', autenticado, (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM cartao WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ erro: err });
    res.json({ ok: true });
  });
});

// ===============================
// BOLETOS - LISTAR
// ===============================
app.get('/boletos/:username', autenticado, (req, res) => {
  db.query(
    "SELECT * FROM boleto WHERE usuario = ? ORDER BY id DESC",
    [req.params.username],
    (err, r) => {
      if (err) return res.status(500).json({ erro: err });
      res.json(r);
    }
  );
});

// ===============================
// BOLETOS - CRIAR
// ===============================
app.post('/boletos/:username', autenticado, (req, res) => {
  const { username } = req.params;
  const { valor, vencimento } = req.body;

  const codigo =
    "34191" + String(Math.floor(Math.random() * 1e10)).padStart(10, "0");

  db.query(
    "INSERT INTO boleto (usuario, codigo, valor, vencimento, pago) VALUES (?, ?, ?, ?, false)",
    [username, codigo, valor, vencimento],
    (err) => {
      if (err) return res.status(500).json({ erro: err });
      res.json({ ok: true, codigo });
    }
  );
});

// ===============================
// BOLETOS - PAGAR
// ===============================
app.put('/boletos/:username/:codigo/pagar', autenticado, (req, res) => {
  const { username, codigo } = req.params;

  db.query("SELECT saldo FROM perfil WHERE usuario = ?", [username], (err, r) => {
    if (err) return res.status(500).json({ erro: err });

    const saldo = r[0].saldo;

    db.query("SELECT * FROM boleto WHERE codigo = ?", [codigo], (err2, b) => {
      if (err2) return res.status(500).json({ erro: err2 });

      const boleto = b[0];

      if (saldo < boleto.valor)
        return res.status(400).json({ erro: "Saldo insuficiente" });

      db.query("UPDATE perfil SET saldo = saldo - ? WHERE usuario = ?", [
        boleto.valor,
        username
      ]);

      db.query("UPDATE boleto SET pago = true WHERE codigo = ?", [codigo]);

      res.json({ ok: true });
    });
  });
});

// ===============================
// EMPRÉSTIMO
// ===============================
app.post('/emprestimo', autenticado, (req, res) => {
  const { usuario, valor } = req.body;
  const taxa = 0.05;
  const total = valor * (1 + taxa);

  db.query(
    "UPDATE perfil SET saldo = saldo + ? WHERE usuario = ?",
    [valor, usuario]
  );

  const codigo =
    "34191" + String(Math.floor(Math.random() * 1e10)).padStart(10, "0");

  const vencimento = new Date();
  vencimento.setDate(vencimento.getDate() + 30);

  db.query(
    "INSERT INTO boleto (usuario, codigo, valor, vencimento, pago, descricao) VALUES (?, ?, ?, ?, false, ?)",
    [
      usuario,
      codigo,
      total,
      vencimento.toLocaleDateString("pt-BR"),
      "Pagamento de Empréstimo"
    ]
  );

  res.json({ ok: true });
});

// ===============================
// CADASTRO DE USUÁRIO
// ===============================
app.post('/cadastro', (req, res) => {
  const {
    nome,
    cpf,
    dataNascimento,
    telefone,
    email,
    cep,
    rua,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
    usuario,
    senha
  } = req.body;

  if (
    !nome || !cpf || !dataNascimento || !telefone || !email ||
    !cep || !rua || !numero || !bairro || !cidade || !estado ||
    !usuario || !senha
  ) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  // Verifica se usuário já existe
  db.query("SELECT * FROM perfil WHERE usuario = ?", [usuario], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    if (result.length > 0) {
      return res.status(400).json({ error: "Usuário já existe" });
    }

    // Inserção
    db.query(`
      INSERT INTO perfil (
        nomeUsuario, cpfUsuario, dataNasc, telefoneUsuario, emailUsuario,
        cepUsuario, ruaUsuario, numeroRua, complemento,
        bairro, cidade, estado,
        usuario, senha, saldo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `,
      [
        nome, cpf, dataNascimento, telefone, email,
        cep, rua, numero, complemento, bairro, cidade, estado,
        usuario, senha
      ],
      (err2) => {
        if (err2) return res.status(500).json({ error: err2 });
        res.json({ ok: true, message: "Cadastro concluído com sucesso!" });
      }
    );
  });
});


// ===============================
// INICIAR SERVIDOR
// ===============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
