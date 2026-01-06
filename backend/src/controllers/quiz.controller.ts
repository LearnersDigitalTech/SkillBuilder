import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getQuestions = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { grade } = req.params;

        // TODO: Implement question generation logic
        // For now, return placeholder
        res.json({
            status: 'success',
            data: {
                questions: [],
                message: 'Question generation to be implemented'
            }
        });
    } catch (error) {
        next(error);
    }
};

export const startQuiz = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { childId, grade } = req.body;

        // TODO: Create quiz session
        res.json({
            status: 'success',
            data: {
                quizId: 'temp-quiz-id',
                message: 'Quiz started'
            }
        });
    } catch (error) {
        next(error);
    }
};

export const submitQuiz = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { childId, grade, answers, timeSpent } = req.body;

        // Calculate score
        const totalQuestions = answers.length;
        const correctAnswers = answers.filter((a: any) => a.isCorrect).length;
        const score = Math.round((correctAnswers / totalQuestions) * 100);

        // Save quiz result
        const quizResult = await prisma.quizResult.create({
            data: {
                childId,
                grade,
                score,
                totalQuestions,
                timeSpent,
                answers: JSON.parse(JSON.stringify(answers))
            }
        });

        res.json({
            status: 'success',
            data: {
                result: quizResult,
                score,
                correctAnswers,
                totalQuestions
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getQuizResult = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const result = await prisma.quizResult.findUnique({
            where: { id },
            include: {
                child: true
            }
        });

        if (!result) {
            return next(new AppError('Quiz result not found', 404));
        }

        res.json({
            status: 'success',
            data: { result }
        });
    } catch (error) {
        next(error);
    }
};

export const getQuizHistory = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { childId } = req.params;

        const results = await prisma.quizResult.findMany({
            where: { childId },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        res.json({
            status: 'success',
            data: { results }
        });
    } catch (error) {
        next(error);
    }
};
