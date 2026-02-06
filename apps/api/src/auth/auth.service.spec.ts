import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

// Mock bcrypt module
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser: User = {
    id: 'test-user-id',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'testpassword';
      mockUsersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(result).not.toHaveProperty('password');
      expect(mockUsersService.findOne).toHaveBeenCalledWith(email);
    });

    it('should return null when user is not found', async () => {
      // Arrange
      mockUsersService.findOne.mockResolvedValue(null);

      // Act
      const result = await service.validateUser(
        'nonexistent@example.com',
        'password',
      );

      // Assert
      expect(result).toBeNull();
      expect(mockUsersService.findOne).toHaveBeenCalledWith(
        'nonexistent@example.com',
      );
    });

    it('should return null when password is incorrect', async () => {
      // Arrange
      mockUsersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const result = await service.validateUser(
        'test@example.com',
        'wrongpassword',
      );

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return JWT access token with correct payload', () => {
      // Arrange
      const user = { email: 'test@example.com', id: 'test-user-id' };
      const expectedToken = 'mock.jwt.token';
      mockJwtService.sign.mockReturnValue(expectedToken);

      // Act
      const result = service.login(user);

      // Assert
      expect(result).toEqual({
        access_token: expectedToken,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
      });
    });

    it('should generate unique tokens for different users', () => {
      // Arrange
      const user1 = { email: 'user1@example.com', id: 'user-1' };
      const user2 = { email: 'user2@example.com', id: 'user-2' };
      mockJwtService.sign
        .mockReturnValueOnce('token-1')
        .mockReturnValueOnce('token-2');

      // Act
      const result1 = service.login(user1);
      const result2 = service.login(user2);

      // Assert
      expect(result1.access_token).not.toEqual(result2.access_token);
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
    });
  });

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      // Arrange
      const registerDto = {
        email: 'newuser@example.com',
        password: 'newpassword',
      };
      const createdUser = {
        ...registerDto,
        id: 'new-user-id',
        password: '$2b$10$hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUsersService.create.mockResolvedValue(createdUser);

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(result).toEqual(createdUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(registerDto);
    });

    it('should pass registration data to users service', async () => {
      // Arrange
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      mockUsersService.create.mockResolvedValue(mockUser);

      // Act
      await service.register(registerDto);

      // Assert
      expect(mockUsersService.create).toHaveBeenCalledWith(registerDto);
      expect(mockUsersService.create).toHaveBeenCalledTimes(1);
    });
  });
});
