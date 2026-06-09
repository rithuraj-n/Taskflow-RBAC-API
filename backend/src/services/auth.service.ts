import bcryptjs from 'bcryptjs';
import { prisma } from '../config/db';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/customErrors';
import { signToken } from '../utils/jwt';
import { TokenPayload } from '../utils/jwt';

export class AuthService {
  static async register(data: any) {
    const { email, password, name, role } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('A user with this email already exists');
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user in DB
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'USER',
      },
    });

    // Exclude password from return
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async login(data: any) {
    const { email, password } = data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Sign JWT token
    const tokenPayload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    const token = signToken(tokenPayload);

    // Exclude password
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
    };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
