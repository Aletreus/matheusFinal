CREATE TABLE perfil (
    usuario VARCHAR(55) NOT NULL,
    nomeUsuario VARCHAR(55) NOT NULL,
    cpfUsuario VARCHAR(14) NOT NULL UNIQUE,
    dataNasc VARCHAR(10) NOT NULL,
    telefoneUsuario VARCHAR(15) NOT NULL,
    emailUsuario VARCHAR(155) NOT NULL,
    cepUsuario VARCHAR(9) NOT NULL,
    ruaUsuario VARCHAR(55) NOT NULL,
    numeroRua VARCHAR(5),
    complemento VARCHAR(50),
    bairro VARCHAR(30) NOT NULL,
    cidade VARCHAR(30) NOT NULL,
    estado VARCHAR(30) NOT NULL,
    senha VARCHAR(40) NOT NULL,
    saldo FLOAT DEFAULT 0,
    PRIMARY KEY (usuario)
);

CREATE TABLE cartao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(55) NOT NULL,
    numero VARCHAR(19) NOT NULL,
    validade VARCHAR(5) NOT NULL,
    cvv VARCHAR(3) NOT NULL,

    index cartao_FKIndex1(usuario)
);

CREATE TABLE boleto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(55) NOT NULL,
    codigo VARCHAR(45) NOT NULL,
    valor FLOAT NOT NULL,
    vencimento VARCHAR(10) NOT NULL,
    pago BOOLEAN DEFAULT FALSE,
    descricao VARCHAR(255),
    index cartao_FKIndex1(usuario)
);
