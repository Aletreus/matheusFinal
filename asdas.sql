create table perfil(
    usuario varchar(55) not null,
	nome varchar(55) not null,
    cpf varchar(14) not null unique,
    dataNasc varchar(10) not null,
    telefone varchar(15) not null,
    email varchar(155) not null,
    cep varchar(9) not null,
    rua varchar(55) not null,
    numero varchar(5),
    complemento varchar(1),
    bairro varchar(30) not null,
    cidade varchar(30) not null,
    estado varchar(30) not null,
    senha varchar(40) not null,
    primary key (usuario)
);

create table cartao(
	numero varchar(19),
    validade varchar(5),
    cvv varchar(3),
    perfil_usuario varchar(55) not null,
    primary key(numero),
    index cartao_FKIndex1(perfil_usuario)
);

create table boleto(
	numero varchar(45),
    vencimento varchar(10),
    criacao varchar(10),
    valor float,
    status enum('Em aberto', 'Pago'),
    perfil_usuario varchar(55) not null,
    primary key (numero),
    index boleto_FKIndex1(perfil_usuario)
);