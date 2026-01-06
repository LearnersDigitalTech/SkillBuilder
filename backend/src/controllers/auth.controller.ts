import { Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const generateToken = (userId: string, userType: string): string => {
    return jwt.sign(
        { id: userId, userType },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

export const register = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, phoneNumber, password, userType, childName, grade, school } = req.body;

        // Validate input
        if (!email && !phoneNumber) {
            return next(new AppError('Email or phone number is required', 400));
        }

        if (!password) {
            return next(new AppError('Password is required', 400));
        }

        // Check if user exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email || undefined },
                    { phoneNumber: phoneNumber || undefined }
                ]
            }
        });

        if (existingUser) {
            return next(new AppError('User already exists', 400));
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                phoneNumber,
                passwordHash,
                userType: userType || 'PARENT'
            }
        });

        // Create child profile if provided
        if (childName && grade) {
            await prisma.child.create({
                data: {
                    name: childName,
                    grade,
                    school: school || '',
                    parentId: user.id
                }
            });
        }

        // Generate token
        const token = generateToken(user.id, user.userType);

        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    userType: user.userType
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, phoneNumber, password } = req.body;

        if (!password) {
            return next(new AppError('Password is required', 400));
        }

        if (!email && !phoneNumber) {
            return next(new AppError('Email or phone number is required', 400));
        }

        // Find user
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email || undefined },
                    { phoneNumber: phoneNumber || undefined }
                ]
            },
            include: {
                children: true,
                teacherProfile: true
            }
        });

        if (!user || !user.passwordHash) {
            return next(new AppError('Invalid credentials', 401));
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return next(new AppError('Invalid credentials', 401));
        }

        // Generate token
        const token = generateToken(user.id, user.userType);

        res.json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    userType: user.userType,
                    children: user.children,
                    teacherProfile: user.teacherProfile
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        res.json({
            status: 'success',
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getMe = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            include: {
                children: true,
                teacherProfile: true
            }
        });

        if (!user) {
            return next(new AppError('User not found', 404));
        }

        res.json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

export const refreshToken = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { token } = req.body;

        if (!token) {
            return next(new AppError('Token is required', 400));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const newToken = generateToken(decoded.id, decoded.userType);

        res.json({
            status: 'success',
            data: { token: newToken }
        });
    } catch (error) {
        next(new AppError('Invalid token', 401));
    }
};
