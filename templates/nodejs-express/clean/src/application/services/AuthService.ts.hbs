import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { RegisterUserUseCase } from '../../domain/usecases/RegisterUserUseCase';
import { LoginUserUseCase } from '../../domain/usecases/LoginUserUseCase';

export interface RegisterDTO {
    email: string;
    name: string;
    password: string;
}

export interface LoginDTO {
    email: string;
    password: string;
}

export interface AuthResponseDTO {
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
}

/**
* Auth Service - Application Layer
* Orchestrates use cases and handles DTOs
*/
export class AuthService {
    private registerUseCase: RegisterUserUseCase;
    private loginUseCase: LoginUserUseCase;

    constructor(
        userRepository: IUserRepository,
        passwordHasher: { hash: (password: string) => Promise<string>; compare: (password: string, hash: string) => Promise
        <boolean> },
        tokenGenerator: { generate: (userId: string, email: string) => string }
    ) {
        this.registerUseCase = new RegisterUserUseCase(userRepository, passwordHasher, tokenGenerator);
        this.loginUseCase = new LoginUserUseCase(userRepository, passwordHasher, tokenGenerator);
    }

    async register(dto: RegisterDTO): Promise<AuthResponseDTO> {
        const result = await this.registerUseCase.execute(dto);
        return {
            token: result.token,
            user: {
                id: result.user.id!,
                email: result.user.email,
                name: result.user.name,
            },
        };
    }

    async login(dto: LoginDTO): Promise<AuthResponseDTO> {
        const result = await this.loginUseCase.execute(dto);
        return {
            token: result.token,
            user: {
                id: result.user.id!,
                email: result.user.email,
                name: result.user.name,
            },
        };
    }
}