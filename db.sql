--BORRA TABLAS SI EXISTEN
DROP TABLE IF EXISTS Bitacora_reportes;
DROP TABLE IF EXISTS Multimedia_reportes;
DROP TABLE IF EXISTS Reportes;
DROP TABLE IF EXISTS Usuarios;
DROP TABLE IF EXISTS Estado_reportes;
DROP TABLE IF EXISTS Severidad;
DROP TABLE IF EXISTS Areas;
DROP TABLE IF EXISTS Estado_trabajador;
DROP TABLE IF EXISTS Cargos;

-- TABLAS
CREATE TABLE Cargos(
    `ID_Cargo` INT NOT NULL,
    `Nombre_Cargo` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`ID_Cargo`) 
);

CREATE TABLE Estado_trabajador(
    `ID_Estado_trabajador` INT NOT NULL
    `Nombre_Estado` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`ID_Estado_trabajador`) 
);

CREATE TABLE Usuarios(
    `Rut_usuario` BIGINT NOT NULL ,
    `Nombre` VARCHAR(60) NOT NULL,
    `Apellido_1` VARCHAR(80),
    `Apellido_2` VARCHAR(80),
    `Contraseña` VARCHAR(255) NOT NULL,
    `ID_Cargo` INT,
    `ID_Estado_trabajador` INT,
    PRIMARY KEY (`Rut_usuario`),
    FOREIGN KEY (`ID_Cargo`) REFERENCES Cargos(`ID_Cargo`) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (`ID_Estado_trabajador`) REFERENCES Estado_trabajador(`ID_Estado_trabajador`) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE Areas(
    `ID_Area` INT NOT NULL ,
    `Nombre_Area` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`ID_Area`) 
);

CREATE TABLE Severidad(
    `ID_Severidad` INT NOT NULL,
    `Nombre_Severidad` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`ID_Severidad`) 
);

CREATE TABLE Estado_reportes(
    `ID_Estado_Actual` INT NOT NULL,
    `Nombre_Estado` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`ID_Estado_Actual`) 
);

CREATE TABLE Reportes(
    `ID_Reporte` INT NOT NULL AUTO_INCREMENT,
    `Titulo` VARCHAR(255) NOT NULL,
    `Descripcion` TEXT,
    `Fecha_Reporte` DATE,
    `UUID_Cliente` CHAR(36),
    `Hora_Creado` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `Hora_Sincronizado` DATETIME DEFAULT NULL,
    `Hora_Actualizado` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `Peticiones_Idempotencia` VARCHAR(255),
    `RUT` BIGINT,
    `ID_Severidad` INT,
    `ID_Area` INT,
    `ID_Estado_Actual` INT,
    PRIMARY KEY (`ID_Reporte`),
    FOREIGN KEY (`RUT`) REFERENCES Usuarios(`RUT`) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (`ID_Area`) REFERENCES Areas(`ID_Area`) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (`ID_Severidad`) REFERENCES Severidad(`ID_Severidad`) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (`ID_Estado_Actual`) REFERENCES Estado_reportes(`ID_Estado_Actual`) ON UPDATE CASCADE ON DELETE SET NULL
);

-- Índices sugeridos para rendimiento en joins/consultas
CREATE INDEX idx_reportes_rut_usuario ON Reportes(`Rut_usuario`);
CREATE INDEX idx_reportes_id_area ON Reportes(`ID_Area`);
CREATE INDEX idx_reportes_fecha ON Reportes(`Fecha_Reporte`);

CREATE TABLE Multimedia_reportes(
    `ID_Multimedia` INT NOT NULL AUTO_INCREMENT,
    `Tipo_Multimedia` VARCHAR(100),
    `ruta` VARCHAR(1024),
    `ID_Reporte` INT,
    PRIMARY KEY (`ID_Multimedia`),
    FOREIGN KEY (`ID_Reporte`) REFERENCES Reportes(`ID_Reporte`) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX idx_multimedia_id_reporte ON Multimedia_reportes(`ID_Reporte`);
CREATE TABLE Bitacora_reportes(
    `ID_Bitacora` INT NOT NULL AUTO_INCREMENT,
    `Nombre_Administrador` VARCHAR(255),
    `Detalle` TEXT,
    `Actualizacion_Fecha` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `ID_Reporte` INT,
    `ID_Estado_Actual` INT,
    `RUT` BIGINT,
    PRIMARY KEY (`ID_Bitacora`),
    FOREIGN KEY (`ID_Reporte`) REFERENCES Reportes(`ID_Reporte`) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (`ID_Estado_Actual`) REFERENCES Estado_reportes(`ID_Estado_Actual`) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (`RUT`) REFERENCES Usuarios(`RUT`) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX idx_bitacora_id_reporte ON Bitacora_reportes(`ID_Reporte`);
