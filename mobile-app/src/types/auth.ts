export interface LoginRequest {
    RUT: number;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export interface TokenData {
    sub: string;
    rut: number;
    cargo: number;
}