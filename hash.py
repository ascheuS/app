import bcrypt
import sys

def generar_hash_bcrypt():
    """
    Herramienta independiente para hashear una contraseña usando 'bcrypt' puro.
    """
    
    # 1. Pide la contraseña al usuario
    password = input("Ingresa la contraseña a hashear: ")

    if not password:
        print("No se ingresó contraseña. Saliendo.")
        return

    try:
        # 2. Bcrypt trabaja con 'bytes', no con 'strings'.
        # Hay que codificar la contraseña a utf-8.
        password_bytes = password.encode('utf-8')

        # 3. Genera un 'salt' (sal)
        # Esto es lo que hace que el hash sea seguro y único
        salt = bcrypt.gensalt()

        # 4. Hashea la contraseña usando el salt
        hash_generado_bytes = bcrypt.hashpw(password_bytes, salt)
        
        # 5. Decodifica el hash (de bytes a string) para poder imprimirlo/copiarlo
        hash_generado_str = hash_generado_bytes.decode('utf-8')

        print("\n--- HASH BCRYPT GENERADO ---")
        print(hash_generado_str)
        print("------------------------------\n")

    except Exception as e:
        print(f"\nError generando el hash: {e}")

# Ejecuta la función cuando se corre el script
if __name__ == "__main__":
    generar_hash_bcrypt()