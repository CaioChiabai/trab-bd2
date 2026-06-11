-- Grupo 1 - Empresa de Imoveis
-- Padrao de nomenclatura: [dominio] + [qualificador(es)] + [tabela]
-- Dominios: id, nom, dsc, num, qtd, val, dat, ind

DROP DATABASE IF EXISTS imobiliaria;
CREATE DATABASE imobiliaria
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE imobiliaria;


CREATE TABLE Ender (
  idEnder            INT          NOT NULL AUTO_INCREMENT,
  dscTpLogradEnder   VARCHAR(20)  NOT NULL,
  dscLogradEnder     VARCHAR(120) NOT NULL,
  numEnder           VARCHAR(10)  NOT NULL,
  dscComplEnder      VARCHAR(60)  NULL,
  dscBairrEnder      VARCHAR(80)  NOT NULL,
  numCEPEnder        CHAR(9)      NOT NULL,
  dscCidadEnder      VARCHAR(80)  NOT NULL,
  dscUFEnder         CHAR(2)      NOT NULL,
  CONSTRAINT pk_Ender PRIMARY KEY (idEnder)
) ENGINE=InnoDB;


CREATE TABLE Cli (
  idCli              INT          NOT NULL AUTO_INCREMENT,
  nomCli             VARCHAR(120) NOT NULL,
  numTelCli          VARCHAR(20)  NOT NULL,
  dscEmailCli        VARCHAR(120) NOT NULL,
  indVendCli         TINYINT(1)   NOT NULL DEFAULT 0,
  indComprCli        TINYINT(1)   NOT NULL DEFAULT 0,
  idEnder            INT          NOT NULL,
  CONSTRAINT pk_Cli PRIMARY KEY (idCli),
  CONSTRAINT uq_Cli_email UNIQUE (dscEmailCli),
  CONSTRAINT fk_Cli_Ender FOREIGN KEY (idEnder) REFERENCES Ender (idEnder),
  CONSTRAINT ck_Cli_papel CHECK (indVendCli = 1 OR indComprCli = 1)
) ENGINE=InnoDB;


CREATE TABLE Imov (
  idImov             INT          NOT NULL AUTO_INCREMENT,
  dscTpImov          VARCHAR(30)  NOT NULL,
  valImov            DECIMAL(12,2) NOT NULL,
  datConstrImov      DATE         NULL,
  indOcupImov        TINYINT(1)   NOT NULL DEFAULT 0,
  idEnder            INT          NOT NULL,
  idDonoCli          INT          NOT NULL,
  CONSTRAINT pk_Imov PRIMARY KEY (idImov),
  CONSTRAINT fk_Imov_Ender FOREIGN KEY (idEnder)   REFERENCES Ender (idEnder),
  CONSTRAINT fk_Imov_Dono  FOREIGN KEY (idDonoCli) REFERENCES Cli (idCli)
) ENGINE=InnoDB;


CREATE TABLE Intrs (
  idIntrs            INT          NOT NULL AUTO_INCREMENT,
  qtdQuartIntrs      INT          NOT NULL DEFAULT 0,
  qtdTamMinIntrs     INT          NOT NULL,
  indLazerIntrs      TINYINT(1)   NOT NULL DEFAULT 0,
  dscBairrIntrs      VARCHAR(80)  NOT NULL,
  dscCidadIntrs      VARCHAR(80)  NOT NULL,
  dscUFIntrs         CHAR(2)      NOT NULL,
  valMaxIntrs        DECIMAL(12,2) NOT NULL,
  idCli              INT          NOT NULL,
  CONSTRAINT pk_Intrs PRIMARY KEY (idIntrs),
  CONSTRAINT fk_Intrs_Cli FOREIGN KEY (idCli) REFERENCES Cli (idCli)
) ENGINE=InnoDB;


CREATE TABLE Vist (
  idVist             INT          NOT NULL AUTO_INCREMENT,
  datHorVist         DATETIME     NOT NULL,
  dscObsVist         VARCHAR(255) NULL,
  idCli              INT          NOT NULL,
  idImov             INT          NOT NULL,
  CONSTRAINT pk_Vist PRIMARY KEY (idVist),
  CONSTRAINT fk_Vist_Cli  FOREIGN KEY (idCli)  REFERENCES Cli (idCli),
  CONSTRAINT fk_Vist_Imov FOREIGN KEY (idImov) REFERENCES Imov (idImov)
) ENGINE=InnoDB;


CREATE INDEX idc_Cli_tel     ON Cli  (numTelCli);
CREATE INDEX idc_Imov_cidade ON Ender (dscCidadEnder);
CREATE INDEX idc_Imov_preco  ON Imov (valImov);
CREATE INDEX idc_Imov_tipo   ON Imov (dscTpImov);
CREATE INDEX idc_Vist_data   ON Vist (datHorVist);


INSERT INTO Ender
  (idEnder, dscTpLogradEnder, dscLogradEnder, numEnder, dscComplEnder, dscBairrEnder, numCEPEnder, dscCidadEnder, dscUFEnder)
VALUES
  (1,  'Rua',     'das Flores', '123', 'Apto 101', 'Centro',         '29100-001', 'Serra',     'ES'),
  (2,  'Avenida', 'Brasil',     '50',  'Casa',     'Jardim Camburi', '29090-100', 'Vitória',   'ES'),
  (3,  'Rua',     'Rua 3',      '30',  'Apto 300', 'Industrial',     '29100-103', 'Cariacica', 'ES'),
  (4,  'Rua',     'Rua 4',      '40',  'Apto 400', 'Centro',         '29100-104', 'Serra',     'ES'),
  (5,  'Rua',     'Rua 5',      '50',  'Apto 500', 'Jardim',         '29100-105', 'Vitória',   'ES'),
  (6,  'Rua',     'Rua 6',      '60',  'Apto 600', 'Praia',          '29100-106', 'Vila Velha','ES'),
  (7,  'Rua',     'Rua 7',      '70',  'Apto 700', 'Industrial',     '29100-107', 'Cariacica', 'ES'),
  (8,  'Rua',     'Rua 8',      '80',  'Apto 800', 'Centro',         '29100-108', 'Serra',     'ES'),
  (9,  'Rua',     'Rua 9',      '90',  'Apto 900', 'Jardim',         '29100-109', 'Vitória',   'ES'),
  (10, 'Rua',     'Rua 10',     '100', 'Apto 1000','Praia',          '29100-110', 'Vila Velha','ES'),
  (11, 'Rua',     'Rua 11',     '110', 'Apto 1100','Industrial',     '29100-111', 'Cariacica', 'ES'),
  (12, 'Rua',     'Rua 12',     '120', 'Apto 1200','Centro',         '29100-112', 'Serra',     'ES'),
  (13, 'Rua',     'Rua 13',     '130', 'Apto 1300','Jardim',         '29100-113', 'Vitória',   'ES'),
  (14, 'Rua',     'Rua 14',     '140', 'Apto 1400','Praia',          '29100-114', 'Vila Velha','ES'),
  (15, 'Rua',     'Rua 15',     '150', 'Apto 1500','Industrial',     '29100-115', 'Cariacica', 'ES'),
  (16, 'Rua',     'Rua 16',     '160', 'Apto 1600','Centro',         '29100-116', 'Serra',     'ES'),
  (17, 'Rua',     'Rua 17',     '170', 'Apto 1700','Jardim',         '29100-117', 'Vitória',   'ES'),
  (18, 'Rua',     'Rua 18',     '180', 'Apto 1800','Praia',          '29100-118', 'Vila Velha','ES'),
  (19, 'Rua',     'Rua 19',     '190', 'Apto 1900','Industrial',     '29100-119', 'Cariacica', 'ES'),
  (20, 'Rua',     'Rua 20',     '200', 'Apto 2000','Centro',         '29100-120', 'Serra',     'ES'),
  (21, 'Rua', 'Imovel 1',  '100', NULL, 'Centro',     '29110-100', 'Serra',     'ES'),
  (22, 'Rua', 'Imovel 2',  '101', NULL, 'Praia',      '29110-101', 'Vitória',   'ES'),
  (23, 'Rua', 'Imovel 3',  '102', NULL, 'Jardim',     '29110-102', 'Vila Velha','ES'),
  (24, 'Rua', 'Imovel 4',  '103', NULL, 'Industrial', '29110-103', 'Cariacica', 'ES'),
  (25, 'Rua', 'Imovel 5',  '104', NULL, 'Centro',     '29110-104', 'Serra',     'ES'),
  (26, 'Rua', 'Imovel 6',  '105', NULL, 'Praia',      '29110-105', 'Vitória',   'ES'),
  (27, 'Rua', 'Imovel 7',  '106', NULL, 'Jardim',     '29110-106', 'Vila Velha','ES'),
  (28, 'Rua', 'Imovel 8',  '107', NULL, 'Industrial', '29110-107', 'Cariacica', 'ES'),
  (29, 'Rua', 'Imovel 9',  '108', NULL, 'Centro',     '29110-108', 'Serra',     'ES'),
  (30, 'Rua', 'Imovel 10', '109', NULL, 'Praia',      '29110-109', 'Vitória',   'ES'),
  (31, 'Rua', 'Imovel 11', '110', NULL, 'Jardim',     '29110-110', 'Vila Velha','ES'),
  (32, 'Rua', 'Imovel 12', '111', NULL, 'Industrial', '29110-111', 'Cariacica', 'ES'),
  (33, 'Rua', 'Imovel 13', '112', NULL, 'Centro',     '29110-112', 'Serra',     'ES'),
  (34, 'Rua', 'Imovel 14', '113', NULL, 'Praia',      '29110-113', 'Vitória',   'ES'),
  (35, 'Rua', 'Imovel 15', '114', NULL, 'Jardim',     '29110-114', 'Vila Velha','ES'),
  (36, 'Rua', 'Imovel 16', '115', NULL, 'Industrial', '29110-115', 'Cariacica', 'ES'),
  (37, 'Rua', 'Imovel 17', '116', NULL, 'Centro',     '29110-116', 'Serra',     'ES'),
  (38, 'Rua', 'Imovel 18', '117', NULL, 'Praia',      '29110-117', 'Vitória',   'ES'),
  (39, 'Rua', 'Imovel 19', '118', NULL, 'Jardim',     '29110-118', 'Vila Velha','ES'),
  (40, 'Rua', 'Imovel 20', '119', NULL, 'Industrial', '29110-119', 'Cariacica', 'ES');


INSERT INTO Cli
  (idCli, nomCli, numTelCli, dscEmailCli, indVendCli, indComprCli, idEnder)
VALUES
  (1,  'João Silva',  '27999990001', 'joao@imobiliaria.com',  1, 0, 1),
  (2,  'Maria Souza', '27999990002', 'maria@imobiliaria.com', 0, 1, 2),
  (3,  'Cliente 3',   '2799990003',  'cliente3@email.com',    1, 0, 3),
  (4,  'Cliente 4',   '2799990004',  'cliente4@email.com',    1, 0, 4),
  (5,  'Cliente 5',   '2799990005',  'cliente5@email.com',    1, 0, 5),
  (6,  'Cliente 6',   '2799990006',  'cliente6@email.com',    1, 0, 6),
  (7,  'Cliente 7',   '2799990007',  'cliente7@email.com',    1, 0, 7),
  (8,  'Cliente 8',   '2799990008',  'cliente8@email.com',    1, 0, 8),
  (9,  'Cliente 9',   '2799990009',  'cliente9@email.com',    1, 0, 9),
  (10, 'Cliente 10',  '2799990010',  'cliente10@email.com',   1, 0, 10),
  (11, 'Cliente 11',  '2799990011',  'cliente11@email.com',   0, 1, 11),
  (12, 'Cliente 12',  '2799990012',  'cliente12@email.com',   0, 1, 12),
  (13, 'Cliente 13',  '2799990013',  'cliente13@email.com',   0, 1, 13),
  (14, 'Cliente 14',  '2799990014',  'cliente14@email.com',   0, 1, 14),
  (15, 'Cliente 15',  '2799990015',  'cliente15@email.com',   0, 1, 15),
  (16, 'Cliente 16',  '2799990016',  'cliente16@email.com',   0, 1, 16),
  (17, 'Cliente 17',  '2799990017',  'cliente17@email.com',   0, 1, 17),
  (18, 'Cliente 18',  '2799990018',  'cliente18@email.com',   0, 1, 18),
  (19, 'Cliente 19',  '2799990019',  'cliente19@email.com',   0, 1, 19),
  (20, 'Cliente 20',  '2799990020',  'cliente20@email.com',   0, 1, 20);


INSERT INTO Imov
  (idImov, dscTpImov, valImov, datConstrImov, indOcupImov, idEnder, idDonoCli)
VALUES
  (1,  'casa',         200000.00, '2000-01-01', 1, 21, 1),
  (2,  'apartamento',  250000.00, '2001-01-01', 0, 22, 2),
  (3,  'cobertura',    300000.00, '2002-01-01', 0, 23, 3),
  (4,  'terreno',      350000.00, '2003-01-01', 1, 24, 4),
  (5,  'casa',         400000.00, '2004-01-01', 0, 25, 5),
  (6,  'apartamento',  450000.00, '2005-01-01', 0, 26, 6),
  (7,  'cobertura',    500000.00, '2006-01-01', 1, 27, 7),
  (8,  'terreno',      550000.00, '2007-01-01', 0, 28, 8),
  (9,  'casa',         600000.00, '2008-01-01', 0, 29, 9),
  (10, 'apartamento',  650000.00, '2009-01-01', 1, 30, 10),
  (11, 'cobertura',    700000.00, '2010-01-01', 0, 31, 1),
  (12, 'terreno',      750000.00, '2011-01-01', 0, 32, 2),
  (13, 'casa',         800000.00, '2012-01-01', 1, 33, 3),
  (14, 'apartamento',  850000.00, '2013-01-01', 0, 34, 4),
  (15, 'cobertura',    900000.00, '2014-01-01', 0, 35, 5),
  (16, 'terreno',      950000.00, '2015-01-01', 1, 36, 6),
  (17, 'casa',        1000000.00, '2016-01-01', 0, 37, 7),
  (18, 'apartamento', 1050000.00, '2017-01-01', 0, 38, 8),
  (19, 'cobertura',   1100000.00, '2018-01-01', 1, 39, 9),
  (20, 'terreno',     1150000.00, '2019-01-01', 0, 40, 10);


INSERT INTO Intrs
  (idIntrs, qtdQuartIntrs, qtdTamMinIntrs, indLazerIntrs, dscBairrIntrs, dscCidadIntrs, dscUFIntrs, valMaxIntrs, idCli)
VALUES
  (1, 3, 90,  1, 'Jardim Camburi', 'Vitória',   'ES', 600000.00, 2),
  (2,  4, 115, 0, 'Praia',  'Vila Velha', 'ES', 850000.00,  11),
  (3,  1, 120, 1, 'Centro', 'Serra',      'ES', 900000.00,  12),
  (4,  2, 125, 0, 'Jardim', 'Vitória',    'ES', 950000.00,  13),
  (5,  3, 130, 1, 'Praia',  'Vila Velha', 'ES', 1000000.00, 14),
  (6,  4, 135, 0, 'Centro', 'Serra',      'ES', 1050000.00, 15),
  (7,  1, 140, 1, 'Jardim', 'Vitória',    'ES', 1100000.00, 16),
  (8,  2, 145, 0, 'Praia',  'Vila Velha', 'ES', 1150000.00, 17),
  (9,  3, 150, 1, 'Centro', 'Serra',      'ES', 1200000.00, 18),
  (10, 4, 155, 0, 'Jardim', 'Vitória',    'ES', 1250000.00, 19),
  (11, 1, 160, 1, 'Praia',  'Vila Velha', 'ES', 1300000.00, 20);


INSERT INTO Vist
  (idVist, datHorVist, dscObsVist, idCli, idImov)
VALUES
  (1,  '2025-01-01 10:00:00', 'Visita 1',  11, 1),
  (2,  '2025-02-02 11:00:00', 'Visita 2',  12, 2),
  (3,  '2025-03-03 12:00:00', 'Visita 3',  13, 3),
  (4,  '2025-04-04 13:00:00', 'Visita 4',  14, 4),
  (5,  '2025-05-05 14:00:00', 'Visita 5',  15, 5),
  (6,  '2025-06-06 15:00:00', 'Visita 6',  16, 6),
  (7,  '2025-07-07 16:00:00', 'Visita 7',  17, 7),
  (8,  '2025-08-08 17:00:00', 'Visita 8',  18, 8),
  (9,  '2025-09-09 10:00:00', 'Visita 9',  19, 9),
  (10, '2025-10-10 11:00:00', 'Visita 10', 20, 10),
  (11, '2025-11-11 12:00:00', 'Visita 11', 11, 11),
  (12, '2025-12-12 13:00:00', 'Visita 12', 12, 12),
  (13, '2025-01-13 14:00:00', 'Visita 13', 13, 13),
  (14, '2025-02-14 15:00:00', 'Visita 14', 14, 14),
  (15, '2025-03-15 16:00:00', 'Visita 15', 15, 15),
  (16, '2025-04-16 17:00:00', 'Visita 16', 16, 16),
  (17, '2025-05-17 10:00:00', 'Visita 17', 17, 17),
  (18, '2025-06-18 11:00:00', 'Visita 18', 18, 18),
  (19, '2025-07-19 12:00:00', 'Visita 19', 19, 19),
  (20, '2025-08-20 13:00:00', 'Visita 20', 20, 20),
  (21, '2025-09-21 14:00:00', 'Visita 21', 11, 1),
  (22, '2025-10-22 15:00:00', 'Visita 22', 12, 2),
  (23, '2025-11-23 16:00:00', 'Visita 23', 13, 3),
  (24, '2025-12-24 17:00:00', 'Visita 24', 14, 4),
  (25, '2025-01-25 10:00:00', 'Visita 25', 15, 5),
  (26, '2025-02-26 11:00:00', 'Visita 26', 16, 6),
  (27, '2025-03-27 12:00:00', 'Visita 27', 17, 7),
  (28, '2025-04-28 13:00:00', 'Visita 28', 18, 8),
  (29, '2025-05-01 14:00:00', 'Visita 29', 19, 9),
  (30, '2025-06-02 15:00:00', 'Visita 30', 20, 10);


ALTER TABLE Ender AUTO_INCREMENT = 41;
ALTER TABLE Cli   AUTO_INCREMENT = 21;
ALTER TABLE Imov  AUTO_INCREMENT = 21;
ALTER TABLE Intrs AUTO_INCREMENT = 12;
ALTER TABLE Vist  AUTO_INCREMENT = 31;
