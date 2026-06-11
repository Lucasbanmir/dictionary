import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signUp: jest.fn(),
    signIn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should register a new user successfully', async () => {
      const signUpDto: SignUpDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const expectedResponse = {
        id: '1',
        name: 'John Doe',
        token: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      };

      mockAuthService.signUp.mockResolvedValue(expectedResponse);

      const result = await controller.signUp(signUpDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
      expect(authService.signUp).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when email already exists', async () => {
      const signUpDto: SignUpDto = {
        name: 'Jane Doe',
        email: 'existing@example.com',
        password: 'password123',
      };

      const badRequestError = new Error('Email already in use');
      mockAuthService.signUp.mockRejectedValue(badRequestError);

      await expect(controller.signUp(signUpDto)).rejects.toThrow(
        'Email already in use',
      );
      expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
    });

    it('should return user data with token on successful registration', async () => {
      const signUpDto: SignUpDto = {
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: 'securepass456',
      };

      const response = {
        id: 'user-uuid-123',
        name: 'Alice Smith',
        token: 'Bearer token_string',
      };

      mockAuthService.signUp.mockResolvedValue(response);

      const result = await controller.signUp(signUpDto);

      expect(result.id).toBeDefined();
      expect(result.name).toBe('Alice Smith');
      expect(result.token).toContain('Bearer');
    });
  });

  describe('signIn', () => {
    it('should authenticate user with valid credentials', async () => {
      const signInDto: SignInDto = {
        email: 'john@example.com',
        password: 'password123',
      };

      const expectedResponse = {
        id: '1',
        name: 'John Doe',
        token: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      };

      mockAuthService.signIn.mockResolvedValue(expectedResponse);

      const result = await controller.signIn(signInDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.signIn).toHaveBeenCalledWith(signInDto);
      expect(authService.signIn).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      const signInDto: SignInDto = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      const unauthorizedError = new Error('Invalid credentials');
      mockAuthService.signIn.mockRejectedValue(unauthorizedError);

      await expect(controller.signIn(signInDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(authService.signIn).toHaveBeenCalledWith(signInDto);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const signInDto: SignInDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const unauthorizedError = new Error('Invalid credentials');
      mockAuthService.signIn.mockRejectedValue(unauthorizedError);

      await expect(controller.signIn(signInDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(authService.signIn).toHaveBeenCalledWith(signInDto);
    });

    it('should return user data with token on successful authentication', async () => {
      const signInDto: SignInDto = {
        email: 'john@example.com',
        password: 'password123',
      };

      const response = {
        id: 'user-uuid-456',
        name: 'John Doe',
        token: 'Bearer token_string',
      };

      mockAuthService.signIn.mockResolvedValue(response);

      const result = await controller.signIn(signInDto);

      expect(result.id).toBeDefined();
      expect(result.name).toBe('John Doe');
      expect(result.token).toContain('Bearer');
    });
  });
});
