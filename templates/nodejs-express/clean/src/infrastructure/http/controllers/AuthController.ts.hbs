import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../../domain/usecases/RegisterUserUseCase';
import { LoginUserUseCase } from '../../../domain/usecases/LoginUserUseCase';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
});

export class AuthController {
  constructor(
    private registerUseCase: RegisterUserUseCase,
    private loginUseCase: LoginUserUseCase
  ) {}

  register = async (req: Request, res: Response) => {
    const { email, name, password } = registerSchema.parse(req.body);
    const result = await this.registerUseCase.execute({ email, name, password });
    res.status(201).json(result);
  };

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await this.loginUseCase.execute({ email, password });
    res.json(result);
  };
}
