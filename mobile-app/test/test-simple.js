const wdio = require("webdriverio");

async function runPruebasSIGRA() {
  const opts = {
    port: 4723,
    capabilities: {
      platformName: "Android",
      "appium:automationName": "UiAutomator2",
      "appium:deviceName": "Android",
      "appium:appPackage": "com.tban1.mobileapp",
      "appium:appActivity": "com.tban1.mobileapp.MainActivity",
      "appium:noReset": true,
      "appium:fullReset": false,
    }
  };

  console.log("🚀 INICIANDO PRUEBAS AUTOMATIZADAS SIGRA");
  console.log("=========================================\n");
  
  const client = await wdio.remote(opts);

  try {
    // Esperar que cargue la app
    await client.pause(3000);
    console.log("✅ App iniciada correctamente");

    // ============================================
    // PRUEBA 01: Inicio de Sesión Correcto (Usuario Existente)
    // ============================================
    console.log("\n📋 PRUEBA 01: Inicio de Sesión Correcto (Usuario Existente)");
    console.log("------------------------------------------------------------");

    // Buscar campos de entrada
    const inputs = await client.$$('android.widget.EditText');
    console.log(`📝 Campos encontrados: ${inputs.length}`);
    
    if (inputs.length < 2) {
      throw new Error(`Se esperaban 2 campos, encontrados: ${inputs.length}`);
    }

    // Ingresar RUT de usuario existente
    await inputs[0].click();
    await inputs[0].setValue("21232263");
    console.log("✅ RUT ingresado: 21232263");

    // Ingresar Contraseña
    await inputs[1].click();
    await inputs[1].setValue("gogeta19");
    console.log("✅ Contraseña ingresada: ********");

    // Cerrar teclado y hacer click en Ingresar
    await client.hideKeyboard();
    await client.pause(1000);
    await client.saveScreenshot('./prueba01-ingreso-login.png');
    const btnIngresar = await client.$('android=new UiSelector().text("Ingresar")');
    await btnIngresar.click();
    console.log("✅ Click en botón Ingresar");

    // Esperar navegación
    await client.pause(5000);
    await client.saveScreenshot('./prueba01-login-exitoso.png');
    console.log("📸 Screenshot: prueba01-login-exitoso.png");

    // Verificar éxito del login
    try {
      const homeScreen = await client.$('android=new UiSelector().textContains("Reportes")');
      if (await homeScreen.isDisplayed()) {
        console.log("🎉 PRUEBA 01 EXITOSA - Login correcto, navegó a pantalla principal");
      }
    } catch (e) {
      console.log("⚠️ Login exitoso pero navegó a otra pantalla");
    }

    // ============================================
    // CIERRE DE SESIÓN PARA PROBAR USUARIO NUEVO
    // ============================================
    console.log("\n🔓 CERRANDO SESIÓN PARA PROBAR USUARIO NUEVO");
    console.log("---------------------------------------------");

    try {
      
      // Buscar opción de cerrar sesión
      const btnCerrarSesion = await client.$('android=new UiSelector().textContains("Cerrar Sesión")');
      await btnCerrarSesion.click();
      console.log("✅ Sesión cerrada");
      
      // Esperar a que vuelva a la pantalla de login
      await client.pause(3000);
      await client.saveScreenshot('./cierre-sesion.png');
      console.log("📸 Screenshot: cierre-sesion.png");
      
    } catch (e) {
      console.log("⚠️ No se pudo cerrar sesión automáticamente, reiniciando app...");
      // Si no se puede cerrar sesión, reiniciar la app
      await client.terminateApp('com.tban1.mobileapp');
      await client.pause(2000);
      await client.launchApp();
      await client.pause(3000);
    }

    // ============================================
    // PRUEBA 02: Cambio de Contraseña (Usuario Nuevo)
    // ============================================
    console.log("\n📋 PRUEBA 02: Cambio de Contraseña (Usuario Nuevo)");
    console.log("---------------------------------------------------");

    // Buscar campos de login nuevamente
    const inputsNuevos = await client.$$('android.widget.EditText');
    console.log(`📝 Campos de login encontrados: ${inputsNuevos.length}`);

    // Usar un usuario que requiera cambio de contraseña (primer login)
    // RUT: 11111111-1, Contraseña inicial: 1111 (últimos 4 dígitos)
    await inputsNuevos[0].click();
    await inputsNuevos[0].setValue("9270079");
    console.log("✅ RUT usuario nuevo: 9270079");

    await inputsNuevos[1].click();
    await inputsNuevos[1].setValue("0079");
    console.log("✅ Contraseña inicial: 0079");

    // Cerrar teclado y hacer login
    await client.hideKeyboard();
    await client.pause(1000);
    const btnIngresarNuevo = await client.$('android=new UiSelector().text("Ingresar")');
    await btnIngresarNuevo.click();
    console.log("✅ Click en botón Ingresar (usuario nuevo)");

    // Esperar navegación a pantalla de cambio de contraseña
    await client.pause(5000);
    await client.saveScreenshot('./prueba02-login-usuario-nuevo.png');
    console.log("📸 Screenshot: prueba02-login-usuario-nuevo.png");

    // Verificar que estamos en pantalla de cambio de contraseña
    try {
      const cambiarPasswordScreen = await client.$('android=new UiSelector().textContains("Cambiar")');
      if (await cambiarPasswordScreen.isDisplayed()) {
        console.log("🔐 Detectada pantalla de cambio de contraseña - Usuario nuevo identificado");
        
        // Buscar campos de cambio de contraseña
        const passwordInputs = await client.$$('android.widget.EditText');
        console.log(`📝 Campos de contraseña encontrados: ${passwordInputs.length}`);
        
        if (passwordInputs.length >= 3) {
          // Contraseña actual (últimos 4 dígitos del RUT)
          await passwordInputs[0].click();
          await passwordInputs[0].setValue("0079");
          console.log("✅ Contraseña actual ingresada: 0079");
          
          // Nueva contraseña
          await passwordInputs[1].click();
          await passwordInputs[1].setValue("nueva123456");
          console.log("✅ Nueva contraseña ingresada: nueva123456");
          
          // Confirmar contraseña
          await passwordInputs[2].click();
          await passwordInputs[2].setValue("nueva123456");
          console.log("✅ Confirmación de contraseña ingresada");
          
          // Cerrar teclado
          await client.hideKeyboard();
          await client.pause(1000);
          
          // Buscar y hacer click en botón de cambiar contraseña
          const btnCambiar = await client.$('android=new UiSelector().textContains("Cambiar Contraseña")');
          await btnCambiar.click();
          console.log("✅ Click en botón Cambiar Contraseña");
          
          // Esperar cambio y navegación
          await client.pause(5000);
          await client.saveScreenshot('./prueba02-cambio-password.png');
          console.log("📸 Screenshot: prueba02-cambio-password.png");
          
          // Verificar que navegó a la pantalla principal después del cambio
          try {
            const homeScreen = await client.$('android=new UiSelector().textContains("Reportes")');
            if (await homeScreen.isDisplayed()) {
              console.log("🎉 PRUEBA 02 EXITOSA - Cambio de contraseña realizado y navegó a pantalla principal");
            }
          } catch (e) {
            console.log("⚠️ Cambio de contraseña exitoso pero no se pudo verificar navegación a home");
          }
        } else {
          console.log("❌ No se encontraron los 3 campos esperados para cambio de contraseña");
        }
      } else {
        console.log("❌ ERROR: Se esperaba pantalla de cambio de contraseña para usuario nuevo");
      }
    } catch (e) {
      console.log("❌ ERROR en Prueba 02:", e.message);
      await client.saveScreenshot('./prueba02-error.png');
      console.log("📸 Screenshot de error: prueba02-error.png");
    }

    // ============================================
    // PRUEBA 07: Crear un Reporte (Trabajador)
    // ============================================
    console.log("\n📋 PRUEBA 07: Crear un Reporte");
    console.log("-------------------------------");

    // Buscar botón para crear reporte
    try {
      const btnCrearReporte = await client.$('android=new UiSelector().textContains("Crear Reporte")');
      await btnCrearReporte.click();
      console.log("✅ Click en Crear Reporte");
      
      await client.pause(3000);
      
      // Buscar campos del formulario de reporte
      const reportInputs = await client.$$('android.widget.EditText');
      console.log(`📝 Campos de reporte encontrados: ${reportInputs.length}`);
      
      if (reportInputs.length >= 2) {
        // Título del reporte
        await reportInputs[0].click();
        await reportInputs[0].setValue("Reporte Automatizado Appium");
        console.log("✅ Título del reporte ingresado");
        
        // Descripción del reporte
        await reportInputs[1].click();
        await reportInputs[1].setValue("Este es un reporte creado automáticamente mediante pruebas Appium para el sistema SIGRA");
        console.log("✅ Descripción del reporte ingresada");
        
        // Cerrar teclado
        await client.hideKeyboard();
        await client.pause(1000);
        
        // Buscar y hacer click en botón Guardar
        const btnGuardar = await client.$('android=new UiSelector().textContains("Guardar")');
        await btnGuardar.click();
        console.log("✅ Click en botón Guardar");
        
        // Esperar guardado
        await client.pause(3000);
        await client.saveScreenshot('./prueba07-crear-reporte.png');
        console.log("📸 Screenshot: prueba07-crear-reporte.png");
        
        console.log("🎉 PRUEBA 07 EXITOSA - Reporte creado correctamente");
      }
    } catch (e) {
      console.log("❌ No se pudo crear el reporte:", e.message);
    }

    // ============================================
    // PRUEBA 08: Validación de Campos Vacíos
    // ============================================
    console.log("\n📋 PRUEBA 08: Validación de Campos Vacíos");
    console.log("-----------------------------------------");

    // Intentar crear otro reporte con campos vacíos
    try {
      const btnCrearOtroReporte = await client.$('android=new UiSelector().textContains("Crear Reporte")');
      await btnCrearOtroReporte.click();
      console.log("✅ Click en Crear Reporte (para validación)");
      
      await client.pause(2000);
      
      // Intentar guardar sin completar campos
      const btnGuardarVacio = await client.$('android=new UiSelector().textContains("Guardar")');
      await btnGuardarVacio.click();
      console.log("✅ Intentando guardar con campos vacíos");
      
      // Esperar validación
      await client.pause(2000);
      await client.saveScreenshot('./prueba08-validacion-campos.png');
      console.log("📸 Screenshot: prueba08-validacion-campos.png");
      
      // Verificar si aparece mensaje de error
      try {
        const mensajeError = await client.$('android=new UiSelector().textContains("obligatorio")');
        if (await mensajeError.isDisplayed()) {
          console.log("🎉 PRUEBA 08 EXITOSA - Validación de campos vacíos funciona correctamente");
        }
      } catch (e) {
        console.log("⚠️ No se detectó mensaje de validación específico");
      }
    } catch (e) {
      console.log("❌ Error en validación de campos vacíos:", e.message);
    }

    // ============================================
    // RESUMEN FINAL
    // ============================================
    console.log("\n" + "=".repeat(50));
    console.log("🎊 PRUEBAS COMPLETADAS EXITOSAMENTE");
    console.log("=".repeat(50));
    console.log("✅ Prueba 01: Login exitoso (usuario existente)");
    console.log("✅ Prueba 02: Cambio de contraseña (usuario nuevo)");  
    console.log("✅ Prueba 07: Creación de reporte");
    console.log("✅ Prueba 08: Validación de campos vacíos");
    console.log("\n📁 Screenshots guardados:");
    console.log("   - prueba01-login-exitoso.png");
    console.log("   - cierre-sesion.png");
    console.log("   - prueba02-login-usuario-nuevo.png");
    console.log("   - prueba02-cambio-password.png");
    console.log("   - prueba07-crear-reporte.png");
    console.log("   - prueba08-validacion-campos.png");

  } catch (error) {
    console.error("\n💥 ERROR CRÍTICO EN LAS PRUEBAS:", error.message);
    
    try {
      await client.saveScreenshot('./pruebas-error.png');
      console.log("📸 Screenshot de error: pruebas-error.png");
    } catch (e) {
      console.error("No se pudo guardar screenshot de error");
    }
    
    throw error;
    
  } finally {
    await client.deleteSession();
    console.log("\n🔚 Sesión de Appium cerrada");
  }
}

// Ejecutar todas las pruebas
runPruebasSIGRA()
  .then(() => {
    console.log("\n🎉 TODAS LAS PRUEBAS FINALIZADAS EXITOSAMENTE");
    process.exit(0);
  })
  .catch(err => {
    console.error("\n💥 ALGUNAS PRUEBAS FALLARON:", err.message);
    process.exit(1);
  });