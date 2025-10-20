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
    `ID_Estado_trabajador` INT NOT NULL,
    `Nombre_Estado` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`ID_Estado_trabajador`) 
);

CREATE TABLE Usuarios(
    `RUT` BIGINT NOT NULL ,
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
CREATE INDEX idx_reportes_rut_usuario ON Reportes(`RUT`);
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

CREATE TABLE Estado_transicion(
    `ID_Transicion` INT NOT NULL AUTO_INCREMENT,
    `Estado_Desde` INT, 
    `Estado_Hacia` INT,
    PRIMARY KEY (`ID_Transicion`),
    FOREIGN KEY (`Estado_Desde`) REFERENCES Estado_reportes(`ID_Estado_Actual`) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (`Estado_Hacia`) REFERENCES Estado_reportes(`ID_Estado_Actual`) ON UPDATE CASCADE ON DELETE CASCADE     
);


--INSERTS
INSERT INTO Cargos (ID_Cargo, Nombre_Cargo) VALUES
(1, 'Administrador'),
(2, 'Trabajador');

INSERT INTO Estado_trabajador (ID_Estado_trabajador, Nombre_Estado) VALUES
(1, 'Activo'),
(2, 'Inactivo');

INSERT INTO Areas (ID_Area, Nombre_Area) VALUES
(1, 'Perforación y Tronadura'),
(2, 'Carga y Transporte'),
(3, 'Chancado y Molienda'),
(4, 'Mantenimiento Mecánico'),
(5, 'Mantenimiento Eléctrico'),
(6, 'Seguridad Industrial'),
(7, 'Control de Producción'),
(8, 'Planta Concentradora'),
(9, 'Salud y Medio Ambiente'),
(10, 'Administración General');

INSERT INTO Severidad (ID_Severidad, Nombre_Severidad) VALUES
(1, 'Baja'),
(2, 'Media'),
(3, 'Alta');

INSERT INTO Estado_reportes (ID_Estado_Actual, Nombre_Estado) VALUES
(1, 'Pendiente'),
(2, 'Aprobado'),
(3, 'Rechazado');

INSERT INTO Estado_transicion (Estado_Desde, Estado_Hacia) VALUES
(1, 2), -- De Pendiente a Aprobado
(1, 3); -- De Pendiente a Rechazado

--FUNCIONES

-- OBTENER ID POR NOMBRE
DELIMITER //  
CREATE OR REPLACE FUNCTION
fn_estado_id(p_nombre VARCHAR(255))
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE v_id INT;
    SELECT ID_Estado_Actual INTO v_id
    FROM Estado_reportes
    WHERE LOWER(Nombre_Estado) = LOWER(p_nombre);
    RETURN v_id;
END //
DELIMITER ;

--VALIDAR REGLA EN ESTADO_TRANSICION
DELIMITER $$
CREATE OR REPLACE FUNCTION fn_transicion_valida(p_desde INT, p_hacia INT)
RETURNS TINYINT
DETERMINISTIC
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM Estado_transicion
    WHERE Estado_Desde = p_desde AND Estado_Hacia = p_hacia
  );
END$$
DELIMITER ;
--VALIDAR FORMATO UUID v4
DELIMITER $$
CREATE OR REPLACE FUNCTION fn_validar_uuid_v4(p_uuid CHAR(36))
RETURNS TINYINT
DETERMINISTIC
BEGIN
    RETURN p_uuid REGEXP '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$';
END$$
DELIMITER ;
--LIMPIA TIPO DE MEDIA
DELIMITER $$
CREATE OR REPLACE FUNCTION fn_media_tipo_normalizado(p_tipo VARCHAR(100))
RETURNS VARCHAR(100)
DETERMINISTIC
BEGIN
    RETURN LOWER(TRIM(p_tipo));
END$$
DELIMITER ;

--TRIGGERS

--REPORTES - ESTADO POR DEFECTO Y VALIDACION
DELIMITER $$
CREATE TRIGGER trg_reportes_before_insert
BEFORE INSERT ON Reportes
FOR EACH ROW
BEGIN
    --Esado por defecto
    IF NEW.ID_Estado_Actual IS NULL THEN
        SET NEW.ID_Estado_Actual = fn_estado_id('Pendiente');
    END IF;
    -- Hora de creado
    IF NEW.Hora_Creado IS NULL THEN
        SET NEW.Hora_Creado = CURRENT_TIMESTAMP;
    END IF;
    -- Fecha de reporte(si viene timestamp del cliente)
    IF NEW.Fecha_Reporte IS NULL AND NEW.Hora_Creado IS NOT NULL THEN
        SET NEW.Fecha_Reporte = DATE(NEW.Hora_Creado);
    END IF;
    --Validar UUID v4
    IF fn_validar_uuid_v4(NEW.UUID_Cliente) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'UUID_Cliente no es un UUID v4 válido.';
    END IF;
END$$
DELIMITER ;

--VALIDAR TRANSICION DE ESTADO
DELIMITER $$
CREATE TRIGGER trg_reportes_before_update_estado
BEFORE UPDATE ON Reportes
FOR EACH ROW
BEGIN
    --Proteger UUID_Cliente de cambios
    IF NEW.UUID_Cliente <> OLD.UUID_Cliente THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'UUID_Cliente no puede ser modificado.';
    END IF;
    --Validar transicion de estado
    IF NEW.ID_Estado_Actual <> OLD.ID_Estado_Actual THEN
        IF fn_transicion_valida(OLD.ID_Estado_Actual, NEW.ID_Estado_Actual) = 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transición de estado no permitida.';
        END IF;
    END IF;
END$$
DELIMITER ;

--REGISTRO EN BITACORA AL CAMBIAR ESTADO
DELIMITER $$
CREATE TRIGGER trg_reportes_after_update_estado
AFTER UPDATE ON Reportes
FOR EACH ROW
BEGIN
    IF NEW.ID_Estado_Actual <> OLD.ID_Estado_Actual THEN
        INSERT INTO Bitacora_reportes (Nombre_Administrador, Detalle, Actualizacion_Fecha, ID_Reporte, ID_Estado_Actual, RUT)
        VALUES (NULL,COALESCE(@comentario,CONCAT('Cambio de estado: ', OLD.ID_Estado_Actual, ' a ', NEW.ID_Estado_Actual)), CURRENT_TIMESTAMP, NEW.ID_Reporte, NEW.ID_Estado_Actual, @actor_rut);
    END IF;
END$$

--NORMALIZAR TIPO DE MULTIMEDIA
DELIMITER $$
CREATE TRIGGER trg_multimedia_before_insert
BEFORE INSERT ON Multimedia_reportes
FOR EACH ROW
BEGIN
    SET NEW.Tipo_Multimedia = fn_media_tipo_normalizado(NEW.Tipo_Multimedia);
END$$
DELIMITER ;
