(function(){
  if (!localStorage.getItem('usuarios')) {
    const usuarios = {
      "admin": { senha: "1234", saldo: 500, historico: [], cartoes: [], emprestimos: [] },
      "maria": { senha: "senha", saldo: 300, historico: [], cartoes: [], emprestimos: [] }
    };
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
  }

  window.db = {
    getUsuarios: () => JSON.parse(localStorage.getItem('usuarios') || '{}'),
    saveUsuarios: (u) => localStorage.setItem('usuarios', JSON.stringify(u)),
    getUsuarioAtual: () => localStorage.getItem('usuarioAtual') || null,
    setUsuarioAtual: (u) => { if (u) localStorage.setItem('usuarioAtual', u); else localStorage.removeItem('usuarioAtual'); },
    logout: () => localStorage.removeItem('usuarioAtual')
  };
})();
