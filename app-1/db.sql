--BORRA TABLAS SI EXISTEN
DROP TABLE IF EXISTS Bitacora_reportes;
DROP TABLE IF EXISTS Multimedia_reportes;
DROP TABLE IF EXISTS Reportes;
DROP TABLE IF EXISTS Usuarios;
DROP TABLE IF EXISTS Estado_transicion;
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
    `Primer_inicio_sesion` TINYINT NOT NULL DEFAULT 1,
    PRIMARY KEY (`RUT`),
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


-- INSERTS
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

INSERT INTO Usuarios (
    RUT, 
    Nombre, 
    Apellido_1, 
    Apellido_2, 
    Contraseña, 
    ID_Cargo, 
    ID_Estado_trabajador,
    Primer_inicio_sesion
    
) 
VALUES (
    21232263, 
    'Esteban', 
    'Rojas', 
    'Calderon', 
    '$2b$12$wsXK1e7Jtp/bE2sJqJi.NeV1oSzQf6nciDaL7hgJY0QMqM0zOdH22', 
    1, 
    1,
    0
);

-- FUNCIONES

-- OBTENER ID POR NOMBRE
DELIMITER //  
CREATE FUNCTION
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

-- VALIDAR REGLA EN ESTADO_TRANSICION
DELIMITER $$
CREATE FUNCTION fn_transicion_valida(p_desde INT, p_hacia INT)
RETURNS TINYINT
DETERMINISTIC
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM Estado_transicion
    WHERE Estado_Desde = p_desde AND Estado_Hacia = p_hacia
  );
END$$
DELIMITER ;
-- VALIDAR FORMATO UUID v4
DELIMITER $$
CREATE FUNCTION fn_validar_uuid_v4(p_uuid CHAR(36))
RETURNS TINYINT
DETERMINISTIC
BEGIN
    RETURN p_uuid REGEXP '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$';
END$$
DELIMITER ;
-- LIMPIA TIPO DE MEDIA
DELIMITER $$
CREATE FUNCTION fn_media_tipo_normalizado(p_tipo VARCHAR(100))
RETURNS VARCHAR(100)
DETERMINISTIC
BEGIN
    RETURN LOWER(TRIM(p_tipo));
END$$
DELIMITER ;

-- TRIGGERS

-- REPORTES - ESTADO POR DEFECTO Y VALIDACION
DELIMITER $$
CREATE TRIGGER trg_reportes_before_insert
BEFORE INSERT ON Reportes
FOR EACH ROW
BEGIN
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
    IF fn_validar_uuid_v4(NEW.UUID_Cliente) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'UUID_Cliente no es un UUID v4 válido.';
    END IF;
END$$
DELIMITER ;

-- VALIDAR TRANSICION DE ESTADO
DELIMITER $$
CREATE TRIGGER trg_reportes_before_update_estado
BEFORE UPDATE ON Reportes
FOR EACH ROW
BEGIN
    IF NEW.UUID_Cliente <> OLD.UUID_Cliente THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'UUID_Cliente no puede ser modificado.';
    END IF;
    IF NEW.ID_Estado_Actual <> OLD.ID_Estado_Actual THEN
        IF fn_transicion_valida(OLD.ID_Estado_Actual, NEW.ID_Estado_Actual) = 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transición de estado no permitida.';
        END IF;
    END IF;
END$$
DELIMITER ;

-- NORMALIZAR TIPO DE MULTIMEDIA
DELIMITER $$
CREATE TRIGGER trg_multimedia_before_insert
BEFORE INSERT ON Multimedia_reportes
FOR EACH ROW
BEGIN
    SET NEW.Tipo_Multimedia = fn_media_tipo_normalizado(NEW.Tipo_Multimedia);
END$$
DELIMITER ;

-- PROCEDIMIENTOS ALMACENADOS

-- INSERTAR UN REPORTE VALIDANDO AREA/SEVERIDAD Y EVITANDO DUPLICADOS POR PETICION IDEMPOTENCIA O UUID_CLIENTE
DELIMITER $$
CREATE PROCEDURE sp_insertar_reporte(
    IN p_titulo VARCHAR(255),
    IN p_descripcion TEXT,
    IN p_fecha_reporte DATE,
    IN p_uuid_cliente CHAR(36),
    IN p_rut BIGINT,
    IN p_id_severidad INT,
    IN p_id_area INT,
    IN p_id_estado_actual INT,
    IN p_peticiones_idempotencia VARCHAR(255),
    OUT p_id_reporte INT
)
BEGIN
    -- Validar existencia de Area
    IF NOT EXISTS (SELECT 1 FROM Areas WHERE ID_Area = p_id_area) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ID_Area no existe.';
    END IF;
    -- Validar existencia de Severidad
    IF NOT EXISTS (SELECT 1 FROM Severidad WHERE ID_Severidad = p_id_severidad) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ID_Severidad no existe.';
    END IF;
    -- Evitar duplicados por Peticiones_Idempotencia
    IF p_peticiones_idempotencia IS NOT NULL AND EXISTS (SELECT 1 FROM Reportes WHERE Peticiones_Idempotencia = p_peticiones_idempotencia) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reporte con la misma Peticiones_Idempotencia ya existe.';
    END IF;
    -- Evitar duplicados por UUID_Cliente
    IF p_uuid_cliente IS NOT NULL AND EXISTS (SELECT 1 FROM Reportes WHERE UUID_Cliente = p_uuid_cliente) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reporte con el mismo UUID_Cliente ya existe.';
    END IF;
    -- Insertar el reporte
    INSERT INTO Reportes (Titulo, Descripcion, Fecha_Reporte, UUID_Cliente, RUT, ID_Severidad, ID_Area, ID_Estado_Actual, Peticiones_Idempotencia)
    VALUES (p_titulo, p_descripcion, p_fecha_reporte, p_uuid_cliente, p_rut, p_id_severidad, p_id_area, p_id_estado_actual, p_peticiones_idempotencia);
    SET p_id_reporte = LAST_INSERT_ID();
END$$
DELIMITER ;

-- CAMBIAR ESTADO CON VALIDACION Y REGISTRO EN BITACORA
DELIMITER $$
CREATE PROCEDURE sp_cambiar_estado_reporte(
    IN p_id_reporte INT,
    IN p_nuevo_estado INT,
    IN p_nombre_administrador VARCHAR(255),
    IN p_detalle TEXT,
    IN p_rut BIGINT
)
BEGIN
    DECLARE v_estado_actual INT;
    -- Obtener estado actual
    SELECT ID_Estado_Actual INTO v_estado_actual FROM Reportes WHERE ID_Reporte = p_id_reporte;
    IF v_estado_actual IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reporte no encontrado.';
    END IF;
    -- Validar transicion
    IF fn_transicion_valida(v_estado_actual, p_nuevo_estado) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transición de estado no permitida.';
    END IF;
    -- Actualizar estado
    UPDATE Reportes SET ID_Estado_Actual = p_nuevo_estado WHERE ID_Reporte = p_id_reporte;
    -- Registrar en bitacora
    INSERT INTO Bitacora_reportes (Nombre_Administrador, Detalle, Actualizacion_Fecha, ID_Reporte, ID_Estado_Actual, RUT)
    VALUES (p_nombre_administrador, COALESCE(p_detalle, CONCAT('Cambio de estado ',v_estado_actual, ' -> ',p_nuevo_estado)), CURRENT_TIMESTAMP, p_id_reporte, p_nuevo_estado, p_rut);
    COMMIT;
END$$
DELIMITER ;

-- AGREGAR EVIDENCIA MULTIMEDIA A REPORTE
DELIMITER $$
CREATE PROCEDURE sp_agregar_multimedia_reporte(
    IN p_id_reporte INT,
    IN p_tipo_multimedia VARCHAR(100),
    IN p_ruta VARCHAR(1024),
    OUT p_id_multimedia INT
)
BEGIN
    -- Validar existencia del reporte
    IF NOT EXISTS (SELECT 1 FROM Reportes WHERE ID_Reporte = p_id_reporte) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Reporte no encontrado.';
    END IF;
    -- Insertar multimedia
    INSERT INTO Multimedia_reportes (Tipo_Multimedia, ruta, ID_Reporte)
    VALUES (fn_media_tipo_normalizado(p_tipo_multimedia), p_ruta, p_id_reporte);
    SET p_id_multimedia = LAST_INSERT_ID();
END$$
DELIMITER ;

-- MARCAR SINCRONIZADO
DELIMITER $$
CREATE PROCEDURE sp_marcar_sincronizado_reporte(
    IN p_id_reporte INT
)
BEGIN
    UPDATE Reportes
    SET Hora_Sincronizado = CURRENT_TIMESTAMP
    WHERE ID_Reporte = p_id_reporte;
END$$
DELIMITER ;

-- BUSCADOR DE REPORTES CON FILTROS OPCIONALES
DELIMITER $$
CREATE PROCEDURE sp_buscar_reportes(
    IN p_rut BIGINT,
    IN p_id_area INT,
    IN p_id_severidad INT,
    IN p_id_estado_actual INT,
    IN p_fecha_desde DATE,
    IN p_fecha_hasta DATE
)
BEGIN
    SELECT * FROM Reportes
    WHERE (p_rut IS NULL OR RUT = p_rut)
      AND (p_id_area IS NULL OR ID_Area = p_id_area)
      AND (p_id_severidad IS NULL OR ID_Severidad = p_id_severidad)
      AND (p_id_estado_actual IS NULL OR ID_Estado_Actual = p_id_estado_actual)
      AND (p_fecha_desde IS NULL OR Fecha_Reporte >= p_fecha_desde)
      AND (p_fecha_hasta IS NULL OR Fecha_Reporte <= p_fecha_hasta);
END$$
DELIMITER ;


-- PROCEDIMIENTO PARA CREAR USUARIO
DELIMITER $$
CREATE PROCEDURE sp_crear_usuario(
    IN p_rut BIGINT,
    IN p_nombre VARCHAR(60),
    IN p_apellido_1 VARCHAR(80),
    IN p_apellido_2 VARCHAR(80),
    IN p_password_hash VARCHAR(255),
    IN p_id_cargo INT,
    IN p_id_estado_trabajador INT
)
BEGIN
    -- Validar que el RUT no exista
    IF EXISTS (SELECT 1 FROM Usuarios WHERE RUT = p_rut) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El RUT ya está registrado.';
    END IF;
    -- Validar que el cargo existe
    IF NOT EXISTS (SELECT 1 FROM Cargos WHERE ID_Cargo = p_id_cargo) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El ID_Cargo no existe.';
    END IF;
    -- Validar que el estado existe
    IF NOT EXISTS (SELECT 1 FROM Estado_trabajador WHERE ID_Estado_trabajador = p_id_estado_trabajador) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El ID_Estado_trabajador no existe.';
    END IF;
    
    -- Insertar el usuario con el hash proporcionado
    INSERT INTO Usuarios (
        RUT,
        Nombre,
        Apellido_1,
        Apellido_2,
        Contraseña,
        ID_Cargo,
        ID_Estado_trabajador,
        Primer_inicio_sesion
    ) VALUES (
        p_rut,
        p_nombre,
        p_apellido_1,
        p_apellido_2,
        p_password_hash,
        p_id_cargo,
        p_id_estado_trabajador,
        1
    );
END$$
DELIMITER ;

-- PROCEDIMIENTO PARA ACTUALIZAR ESTADO DE PRIMER INICIO
DELIMITER $$
CREATE PROCEDURE sp_actualizar_primer_inicio(
    IN p_rut BIGINT
)
BEGIN
    -- Validar que el usuario existe
    IF NOT EXISTS (SELECT 1 FROM Usuarios WHERE RUT = p_rut) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Usuario no encontrado.';
    END IF;
    
    -- Marcar primer inicio como completado
    UPDATE Usuarios 
    SET Primer_inicio_sesion = 0
    WHERE RUT = p_rut;
END$$
DELIMITER ;

-- PRUEBA TRIGGERS
-- Asumimos que ID_Severidad=1 e ID_Area=1 ya existen.
INSERT INTO Reportes (
    Titulo, 
    Descripcion, 
    UUID_Cliente, 
    RUT, 
    ID_Severidad, 
    ID_Area
)
VALUES (
    'Reporte con UUID malo', 
    'Esto es una prueba para el trigger de UUID',
    'esto-no-es-un-uuid-v4',  -- <-- UUID inválido
    21232263,                 -- <-- RUT de Esteban
    1, 
    1
);
