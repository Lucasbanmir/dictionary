import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    const signUpDto: SignUpDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('should register a new user successfully', async () => {
      const hashedPassword = 'hashedPassword123';
      const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-uuid-1',
        name: signUpDto.name,
        email: signUpDto.email,
        password: hashedPassword,
      });
      mockJwtService.signAsync.mockResolvedValue(jwtToken);

      const result = await authService.signUp(signUpDto);

      expect(result).toEqual({
        id: 'user-uuid-1',
        name: 'John Doe',
        token: `Bearer ${jwtToken}`,
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signUpDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(signUpDto.password, 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: signUpDto.name,
          email: signUpDto.email,
          password: hashedPassword,
        },
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'user-uuid-1',
        email: signUpDto.email,
      });
    });

    it('should throw BadRequestException when email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'existing-user-id',
        email: signUpDto.email,
      });

      await expect(authService.signUp(signUpDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(authService.signUp(signUpDto)).rejects.toThrow(
        'Email already in use',
      );
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });

    it('should hash password with bcrypt salt 10', async () => {
      const hashedPassword = 'hashedPassword456';
      const jwtToken = 'token123';

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-uuid-2',
        name: signUpDto.name,
        email: signUpDto.email,
        password: hashedPassword,
      });
      mockJwtService.signAsync.mockResolvedValue(jwtToken);

      await authService.signUp(signUpDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(signUpDto.password, 10);
    });

    it('should return token with Bearer prefix', async () => {
      const hashedPassword = 'hashedPassword789';
      const jwtToken = 'actualtoken123';

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-uuid-3',
        name: signUpDto.name,
        email: signUpDto.email,
        password: hashedPassword,
      });
      mockJwtService.signAsync.mockResolvedValue(jwtToken);

      const result = await authService.signUp(signUpDto);

      expect(result.token).toMatch(/^Bearer /);
      expect(result.token).toBe(`Bearer ${jwtToken}`);
    });
  });

  describe('signIn', () => {
    const signInDto: SignInDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('should authenticate user with valid credentials', async () => {
      const hashedPassword = 'hashedPassword123';
      const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        name: 'John Doe',
        email: signInDto.email,
        password: hashedPassword,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue(jwtToken);

      const result = await authService.signIn(signInDto);

      expect(result).toEqual({
        id: 'user-uuid-1',
        name: 'John Doe',
        token: `Bearer ${jwtToken}`,
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signInDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        signInDto.password,
        hashedPassword,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'user-uuid-1',
        email: signInDto.email,
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(authService.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.signIn(signInDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      const hashedPassword = 'hashedPassword123';

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-uuid-1',
        name: 'John Doe',
        email: signInDto.email,
        password: hashedPassword,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.signIn(signInDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should call bcrypt.compare with correct parameters', async () => {
      const hashedPassword = 'hashedPassword456';
      const jwtToken = 'token123';

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-uuid-2',
        name: 'John Doe',
        email: signInDto.email,
        password: hashedPassword,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue(jwtToken);

      await authService.signIn(signInDto);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        signInDto.password,
        hashedPassword,
      );
    });

    it('should return token with Bearer prefix on successful authentication', async () => {
      const hashedPassword = 'hashedPassword789';
      const jwtToken = 'actualtoken456';

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-uuid-3',
        name: 'Jane Doe',
        email: signInDto.email,
        password: hashedPassword,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue(jwtToken);

      const result = await authService.signIn(signInDto);

      expect(result.token).toMatch(/^Bearer /);
      expect(result.token).toBe(`Bearer ${jwtToken}`);
    });
  });
});
