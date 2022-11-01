# Criação do Banco de Dados e das Tabelas
CREATE DATABASE baberWebApp;
USE baberWebApp;

CREATE TABLE CLIENTE (
	IdCliente INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(60) NOT NULL,
    Telefone VARCHAR(11) NOT NULL,
    Email VARCHAR(60) NOT NULL,
    Data_Nasc DATE NOT NULL
);

CREATE TABLE SERVICO (
	IdServico INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    Tipo VARCHAR(45) NOT NULL,
    Valor DECIMAL(5,2) NOT NULL
);

CREATE TABLE FORMA_PAG (
	IdForma_Pag INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Tipo VARCHAR(45) NOT NULL
);

CREATE TABLE BARBEIRO (
	IdBarbeiro INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Nome VARCHAR(60) NOT NULL,
    Telefone VARCHAR(11) NOT NULL,
    Email VARCHAR(60) NOT NULL,
    Senha VARCHAR(8)
);

CREATE TABLE ATENDIMENTO (
	IdAtendimento INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    Data_Atendimento DATETIME NOT NULL,
    Status_Atendimento BOOLEAN NOT NULL,
    IdCliente INT NOT NULL,
    IdBarbeiro INT NOT NULL,
    IdServico INT NOT NULL,
    FOREIGN KEY (IdCliente) REFERENCES CLIENTE(IdCliente),
    FOREIGN KEY (IdBarbeiro) REFERENCES BARBEIRO(IdBarbeiro),
    FOREIGN KEY (IdServico) REFERENCES SERVICO(IdServico)
);

CREATE TABLE FORMA_PAG_ATENDIMENTO (
	IdForma_Pag_Atend INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    IdAtendimento INT NOT NULL,
    IdForma_Pag INT NOT NULL,
    NR_Parcelas INT NOT NULL,
    FOREIGN KEY (IdForma_Pag) REFERENCES FORMA_PAG(IdForma_Pag),
    FOREIGN KEY (IdAtendimento) REFERENCES ATENDIMENTO(IdAtendimento)
);

# Inserção de Dados p/ Testes
INSERT INTO cliente VALUES 
(1,"Arthur Monteiro", "81999887766", "arthur@teste.com", '1995-11-17');

INSERT INTO cliente (Nome, Telefone, Email, Data_Nasc) VALUES 
("Breno de Souza", "8177665544", "breno@teste.com", '2000-07-07'),
("André Luiz", "83998980011", "andre_luiz@teste.com", '2001-10-10');

INSERT INTO barbeiro (Nome, Telefone, Email, Senha) VALUES 
("Gustavo Dantas", "81999664545", "gustavao@teste.com", "12345678"),
("Matheus Santana", "81984845657", "mths@teste.com", "87654321");

INSERT INTO servico (Tipo, Valor) VALUES 
("Barba", 20.00),
("Corte", 60.00),
("Corte e Barba", 70.00);

INSERT INTO forma_pag (Tipo) VALUES
("Dinheiro"),
("Débito"),
("Crédito");

INSERT INTO ATENDIMENTO (Data_Atendimento, Status_Atendimento, IdCliente, IdBarbeiro, IdServico) VALUES 
	('2022-11-10 10:00:00', False, 3, 2, 1);
    
INSERT INTO FORMA_PAG_ATENDIMENTO (IdAtendimento, IdForma_Pag, NR_Parcelas) VALUES 
(1, 3, 2);