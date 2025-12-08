PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE IF NOT EXISTS "employee" (
  id TEXT PRIMARY KEY,
  locale TEXT,
  username TEXT,
  firstname TEXT,
  lastname TEXT,
  email TEXT,
  emailPersonal TEXT,
  emailPersonalProofToken TEXT,
  emailPersonalProofTokenExpiresAt TEXT,
  emailPersonalStatus TEXT,
  emailPersonalChangeCandidate TEXT,
  phonePrefix TEXT,
  phone TEXT,
  passwd TEXT,
  passwordResetToken TEXT,
  passwordResetTokenExpiresAt TEXT,
  pin TEXT,
  pinResetToken TEXT,
  pinResetTokenExpiresAt TEXT,
  tosAcceptedByIp TEXT,
  active INTEGER,
  createdAt INTEGER,
  updatedAt INTEGER
);
INSERT INTO employee VALUES('0195df9d98QBH33QW1GCXFTGFP','pt-pt','demo','André','Vicente','andre@anage.eu',NULL,NULL,NULL,NULL,NULL,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1527046577,1621414345);
INSERT INTO employee VALUES('0195df9d98F82ZBC0PWYDSHV2A','pt-pt','jorge','Jorge','Vicente','jorge@anage.eu',NULL,NULL,NULL,NULL,NULL,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1527050177,1527050177);
INSERT INTO employee VALUES('0195df9d98HBY11TXY8VNCQKGC','pt-pt','ana','Ana','Vicente','ana.vicente@anage.eu',NULL,NULL,NULL,NULL,NULL,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,1527050177,1527050177);
INSERT INTO employee VALUES('0195df9d98J7YQFM2ZYF7AP0E7','pt-pt','cremilde.carvalho','Cremilde','Carvalho','',NULL,NULL,NULL,NULL,NULL,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,1527050177,1527050177);
INSERT INTO employee VALUES('0195df9d98QQXJZZ2H9VSZPRR2','pt-pt','ana.cardoso','Ana','Cardoso','ana.cardoso@anage.eu',NULL,NULL,NULL,NULL,NULL,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1527050177,1527050177);
INSERT INTO employee VALUES('0195df9d98XS1Q00WVY938FP2J','pt-pt','','Inês','Rodrigues','',NULL,NULL,NULL,NULL,NULL,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,1527050177,1527050177);
INSERT INTO employee VALUES('0195df9d98F1AKJVQ6KPSN01FX','pt-pt','','Catarina','Silva','',NULL,NULL,NULL,NULL,NULL,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,1527050177,1527050177);
INSERT INTO employee VALUES('0195df9d980Z2Z3RBC3Y1FE47D','pt-pt','paula.leitao','Paula','Leitão','paula.leitao@anage.eu',NULL,NULL,NULL,NULL,NULL,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1527050177,1527050177);
INSERT INTO employee VALUES('0195df9d989R3D9MCV5DDMS42B','pt-pt','maria.brazao','Maria','Brazão','maria.brazao@anage.eu',NULL,NULL,NULL,NULL,NULL,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1527050177,1527050177);
INSERT INTO employee VALUES('0195df9d98SEDHW15367G39TAG','pt-pt','monica','Mónica','Galinha','mgalinha@gmail.com',NULL,NULL,NULL,NULL,NULL,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1527050177,1527050177);
INSERT INTO employee VALUES('0195df9d98VPAXREPWXHNNNJND','pt-pt','','Leonor','Rosário','',NULL,NULL,NULL,NULL,NULL,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,1527050177,1527050177);
INSERT INTO employee VALUES('0195df9d98PM9BYRT8ZET7V51P','pt-pt','','Claudia','Fernandes','',NULL,NULL,NULL,NULL,NULL,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,1527050177,1527050177);
INSERT INTO employee VALUES('0195df9d98XY9DBJ4E9TV5X156','pt-pt','','Joana','Botequim','',NULL,NULL,NULL,NULL,NULL,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,1527050177,1527050177);
INSERT INTO employee VALUES('0195df9d989BRT5TZJJDS3Y6GK','pt-pt','joao','João','Vicente','joao@anage.eu',NULL,NULL,NULL,NULL,NULL,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1527050177,1527050177);
INSERT INTO employee VALUES('0195df9d98TNFFKJ4ZGEK0RZZX','pt-pt','ines.cunha','Inês','Cunha','ines.cunha@anage.eu',NULL,NULL,NULL,NULL,NULL,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1527050177,1527050177);
INSERT INTO employee VALUES('0195df9d98J71M9RHD3ANGSNSW','pt-pt','madalena.peralta','Madalena','Peralta','',NULL,NULL,NULL,NULL,NULL,NULL,'912493885',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,1568627555,1568631733);
INSERT INTO employee VALUES('01JRG15VEDY72A10SPM4K8E1T5','pt-PT',NULL,'Andre','Vicente','av@nutsoft.pt',NULL,NULL,NULL,'pending',NULL,'PT','+351914744189','66b1f081d938babcca9c1f76cf60c852:db5e490f55d8ffad8e1d63b68a68c7a20f7eb7c6e9bc9d3b2c9038000cb16483',NULL,NULL,NULL,NULL,NULL,NULL,1,2025-04-10T14:20:33.719Z,2025-04-10T14:20:33.719Z);
CREATE TABLE IF NOT EXISTS "account" (
  id TEXT PRIMARY KEY,
  partner TEXT NOT NULL,
  account TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  active INTEGER NOT NULL,
  evt TEXT
);
INSERT INTO account VALUES('0195dfb3ccJFP22PP6J8PTT73E','nutsoft','archivea','Archivea',0,'evt-server-01');
INSERT INTO account VALUES('0195dfb3cc4GA897VA82WKPBRW','nutsoft','dutchd','Dutchd',1,'evt-server-01');
INSERT INTO account VALUES('0195dfb3ccEG0YAAW9SS69NJN8','nutsoft','sublime','Sublime',1,'evt-server-01');
INSERT INTO account VALUES('0195dfb3ccMDFPR4T55VBG2AK9','nutsoft','pormenores','Pormenores',1,'evt-server-01');
INSERT INTO account VALUES('0195dfb3cc7JTB579MH8KSA3PB','nutsoft','anage','Anage',1,'evt-server-01');
INSERT INTO account VALUES('0195dfb3ccV0GRCR82HYWYKPAT','nutsoft','justoneminute','JustOneMinute',1,'evt-server-01');
INSERT INTO account VALUES('0195dfb3ccZ2Z5926XYAMV951C','nutsoft','centrum','Centrum',1,'evt-server-01');
INSERT INTO account VALUES('0195dfb3ccXAM33XF2004HKAPZ','nutsoft','mixcasa','MixCasa',1,'evt-server-01');
INSERT INTO account VALUES('0195dfb3ccJ37T681S5G0416RD','nutsoft','aces','ACES',1,'evt-server-01');
INSERT INTO account VALUES('0195dfb3ccHV8JWEH1ZZQA9EM7','nutsoft','apeebpp','APEEBPP',1,'evt-server-01');
INSERT INTO account VALUES('0195dfb3ccWY3WPSEQDZA2YMYP','nutsoft','costavieira','Costa e Vieira',1,'evt-server-01');
INSERT INTO account VALUES('0195dfb3ccCEMXG23FCM8XQKDV','nutsoft','holidayromance','Holiday Romance',0,'evt-server-01');
INSERT INTO account VALUES('0195dfb3ccTB7C8AFY0RM04JTT','nutsoft','lojadastradicoes','Loja das Tradicoes',0,'evt-server-01');
INSERT INTO account VALUES('0195dfb3ccSH1N3ZH4CQ48JHJ0','nutsoft','mansi','Mansi',0,'evt-server-01');
INSERT INTO account VALUES('0195dfb3cc656RG4EP2HH5GSDE','nutsoft','nutsoft','Nutsoft',1,'evt-server-01');
INSERT INTO account VALUES('0195dfb3ccRPEVB3V72CYNNNR3','nutsoft','parcelahabitual','Parcela Habitual',0,'evt-server-01');
INSERT INTO account VALUES('0195dfb3cc567HY332Z8P18DG9','nutsoft','springbelievers','Spring Believers',0,'evt-server-01');
INSERT INTO account VALUES('0195dfb3ccWWFZDFJRSW12BVNN','nutsoft','jinni','Jinni',1,'evt-server-01');
INSERT INTO account VALUES('0195dfb3cc7DXPVZJPVANZ2NVC','nutsoft','kaks','Kaks',1,'evt-server-01');
INSERT INTO account VALUES('0195dfb3cc9DVJB5ZH3T2MXWX2','nutsoft','papua','Papua',1,'evt-server-01');
INSERT INTO account VALUES('0195dfb3ccQ6481VBMQN28CD7X','nutsoft','420fanatics','420 Fanatics',0,'evt-server-01');
INSERT INTO account VALUES('0195dfb3cc3S7QKWWNRP0VY7RZ','nutsoft','amedeo','Amedeo',0,'evt-server-01');
INSERT INTO account VALUES('0195dfb3ccARMN5N79F2K9FSFF','nutsoft','casadalmeida','Casa de Almeida',0,'evt-server-01');
INSERT INTO account VALUES('0195dfb3ccHN9A08WR8FJJ6C3F','nutsoft','coneandsteiner','Cone and Steiner',0,'evt-server-01');
INSERT INTO account VALUES('0195dfb3ccW60QJG44HTT1TM88','nutsoft','mrfash','MrFash',0,'evt-server-01');
INSERT INTO account VALUES('0195dfb3ccN4DXM4HMVHC0W9JC','nutsoft','narahsoleigh','Narah Soleigh',0,'evt-server-01');
INSERT INTO account VALUES('0195dfb3ccGK68YF6F66K4FX3S','nutsoft','nuiswim','NuiSwim',0,'evt-server-01');
INSERT INTO account VALUES('0195dfb3cc2DP0QEY5FHAHPZ31','nutsoft','smartandjoy','Smart and Joy',0,'evt-server-01');
INSERT INTO account VALUES('0195dfb3ccPPB6AH6Q77G3RC41','nutsoft','veomactive','VeomActive',0,'evt-server-01');
INSERT INTO account VALUES('0195dfb3cc0BNQCQKZAD3C2HBD','nutsoft','yellowdesire','Yellow Desire',0,'evt-server-01');
INSERT INTO account VALUES('0195dfb3ccCVR99PCD2MJ3MP6K','nutsoft','model','Model',0,'evt-server-01');
INSERT INTO account VALUES('0195dfb3ccZ079V7H6C4B0ZADV','nutsoft','smartgrade','Smartgrade',0,'evt-server-01');
CREATE TABLE IF NOT EXISTS "employee_account" (     id TEXT PRIMARY KEY,     employeeId TEXT NOT NULL,     accountId TEXT NOT NULL,     role VARCHAR(50),     createdAt BIGINT DEFAULT (strftime('%s','now') * 1000),     updatedAt BIGINT DEFAULT (strftime('%s','now') * 1000),     FOREIGN KEY (employeeId) REFERENCES employee(id) ON DELETE CASCADE,     FOREIGN KEY (accountId) REFERENCES account(id) ON DELETE CASCADE,     UNIQUE (employeeId, accountId) );
DELETE FROM sqlite_sequence;
