// Dados simulados de usuários
const usuarios = {
  "admin": { senha: "1234", saldo: 500, historico: [], cartoes: [], emprestimos: [] },
  "maria": { senha: "senha", saldo: 300, historico: [], cartoes: [], emprestimos: [] }
};

let usuarioAtual = null;

// Elementos do DOM
const loginSection = document.getElementById("loginSection");
const dashboard = document.getElementById("dashboard");
const userDisplay = document.getElementById("userDisplay");
const saldoDisplay = document.getElementById("saldo");
const historico = document.getElementById("historico");

document.getElementById("btnLogin").addEventListener("click", login);
document.getElementById("btnDepositar").addEventListener("click", depositar);
document.getElementById("btnSacar").addEventListener("click", sacar);
document.getElementById("logoutBtn").addEventListener("click", logout);

// Novas ações
document.getElementById("btnPix").addEventListener("click", pix);
document.getElementById("btnGerarCartao").addEventListener("click", gerarCartaoVirtual);
document.getElementById("btnExtrato").addEventListener("click", mostrarExtrato);
document.getElementById("btnEmprestimo").addEventListener("click", solicitarEmprestimo);

function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  const msg = document.getElementById("loginMessage");

  if (usuarios[user] && usuarios[user].senha === pass) {
    usuarioAtual = user;
    msg.textContent = "";
    mostrarDashboard();
  } else {
    msg.textContent = "Usuário ou senha incorretos!";
    msg.style.color = "red";
  }
}

function mostrarDashboard() {
  loginSection.style.display = "none";
  dashboard.style.display = "block";
  document.getElementById("loginBtn").style.display = "none";
  document.getElementById("logoutBtn").style.display = "inline-block";

  userDisplay.textContent = usuarioAtual;
  atualizarSaldo();
  renderHistorico();
  renderCartaoVirtual(); // mostra cartão se já existir
}

function atualizarSaldo() {
  saldoDisplay.textContent = usuarios[usuarioAtual].saldo.toFixed(2);
}

function depositar() {
  const valor = parseFloat(document.getElementById("deposito").value);
  if (valor > 0) {
    usuarios[usuarioAtual].saldo += valor;
    adicionarHistorico(`Depósito de R$ ${valor.toFixed(2)}`);
    atualizarSaldo();
    document.getElementById("deposito").value = "";
  } else {
    alert("Valor inválido para depósito.");
  }
}

function sacar() {
  const valor = parseFloat(document.getElementById("saque").value);
  if (valor > 0 && valor <= usuarios[usuarioAtual].saldo) {
    usuarios[usuarioAtual].saldo -= valor;
    adicionarHistorico(`Saque de R$ ${valor.toFixed(2)}`);
    atualizarSaldo();
    document.getElementById("saque").value = "";
  } else {
    alert("Saldo insuficiente ou valor inválido!");
  }
}

function pix() {
  const destinatario = document.getElementById("pixRecipient").value.trim();
  const valor = parseFloat(document.getElementById("pixAmount").value);
  if (!destinatario || !usuarios[destinatario]) {
    alert("Destinatário inválido.");
    return;
  }
  if (destinatario === usuarioAtual) {
    alert("Não é possível enviar PIX para si mesmo.");
    return;
  }
  if (!(valor > 0) || valor > usuarios[usuarioAtual].saldo) {
    alert("Valor inválido ou saldo insuficiente.");
    return;
  }

  usuarios[usuarioAtual].saldo -= valor;
  usuarios[destinatario].saldo += valor;

  adicionarHistorico(`PIX enviado R$ ${valor.toFixed(2)} para ${destinatario}`);
  // adiciona historico no destinatário (visível quando ele logar)
  usuarios[destinatario].historico.unshift(`PIX recebido R$ ${valor.toFixed(2)} de ${usuarioAtual}`);

  atualizarSaldo();
  document.getElementById("pixRecipient").value = "";
  document.getElementById("pixAmount").value = "";
}

function gerarCartaoVirtual() {
  const cardNumber = Array.from({length:16}, () => Math.floor(Math.random()*10)).join('');
  const formatted = cardNumber.match(/.{1,4}/g).join(' ');
  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 2);
  const mm = String(expiry.getMonth() + 1).padStart(2, '0');
  const yy = String(expiry.getFullYear()).slice(-2);
  const cvv = String(Math.floor(Math.random() * 900) + 100);

  const cartao = { numero: formatted, validade: `${mm}/${yy}`, cvv, ativo: true, criadoEm: new Date().toISOString() };
  usuarios[usuarioAtual].cartoes.push(cartao);
  adicionarHistorico(`Cartão virtual gerado (${formatted.slice(0,4)} ****)`);
  renderCartaoVirtual();
}

function renderCartaoVirtual() {
  const display = document.getElementById("virtualCardDisplay");
  const lista = usuarios[usuarioAtual].cartoes;
  if (lista && lista.length) {
    const last = lista[lista.length - 1];
    // mostra mascarado
    const masked = last.numero.split(' ').map((g, i) => i < 1 ? g : '****').join(' ');
    display.textContent = `Cartão: ${masked} • Val: ${last.validade} • CVV: ${last.cvv}`;
  } else {
    display.textContent = "Nenhum cartão virtual gerado.";
  }
}

function adicionarHistorico(texto) {
  // adiciona ao array do usuário e atualiza DOM
  usuarios[usuarioAtual].historico.unshift(`${new Date().toLocaleString()} — ${texto}`);
  const li = document.createElement("li");
  li.textContent = usuarios[usuarioAtual].historico[0];
  historico.prepend(li);
}

function renderHistorico() {
  historico.innerHTML = "";
  const lista = usuarios[usuarioAtual].historico || [];
  lista.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    historico.appendChild(li);
  });
}

function mostrarExtrato() {
  const lista = usuarios[usuarioAtual].historico || [];
  if (!lista.length) {
    alert("Nenhuma transação para exibir.");
    return;
  }
  // abre uma janela simples com o extrato
  const win = window.open("", "_blank", "width=600,height=400");
  const html = `
    <html><head><title>Extrato - ${usuarioAtual}</title></head>
    <body style="font-family: Arial; padding: 1rem;">
      <h3>Extrato de ${usuarioAtual}</h3>
      <p>Saldo atual: R$ ${usuarios[usuarioAtual].saldo.toFixed(2)}</p>
      <ul>
        ${lista.map(l => `<li>${l}</li>`).join('')}
      </ul>
    </body></html>`;
  win.document.write(html);
  win.document.close();
}

function logout() {
  usuarioAtual = null;
  loginSection.style.display = "block";
  dashboard.style.display = "none";
  document.getElementById("loginBtn").style.display = "inline-block";
  document.getElementById("logoutBtn").style.display = "none";
}
