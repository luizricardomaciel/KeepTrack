import { body, ValidationChain } from 'express-validator';

export const userValidators = {
  // Validação para registro
  register: (): ValidationChain[] => [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nome deve ter entre 2 e 100 caracteres'),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email inválido'),
    
    body('password')
      .isLength({ min: 6 })
      .withMessage('Senha deve ter pelo menos 6 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número'),
  ],

  // Validação para login
  login: (): ValidationChain[] => [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email inválido'),
    
    body('password')
      .notEmpty()
      .withMessage('Senha é obrigatória'),
  ],
};