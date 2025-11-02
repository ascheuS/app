export interface LoginRequest {
    RUT: number;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    require_password_change?: boolean;
}

export interface PasswordChangeRequest {
    password: string;
    new_password: string;
}

export interface PasswordChangeResponse {
    access_token: string;
    token_type: string;
}

export interface CreateUserRequest {
    RUT: number;
    Nombre: string;
    Apellido_1: string;
    Apellido_2?: string | null;
    ID_Cargo: number;
    ID_Estado_trabajador?: number;
}

export interface CreateUserResponse {
    message: string;
}

export interface TokenData {
    sub: string;
    rut: number;
    cargo: number;
}