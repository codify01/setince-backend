// utils/responseHelper.ts

// import { Response } from 'express';

interface SuccessResponse<T> {
	success: true;
	message: string;
	data?: T;
}

interface ErrorResponse {
	success: false;
	message: string;
	error?: any;
}

export const sendSuccess = <T>(
	res,
	message: string = 'Success',
	data?: T,
	statusCode: number = 200
) => {
	return res.status(statusCode).json({
		success: true,
		message,
		data,
	});
};

export const sendError = (
	res,
	message: string = 'Internal Server Error',
	statusCode: number = 500,
	error?: any
) => {
	return res.status(statusCode).json({
		success: false,
		message,
		error: process.env.NODE_ENV === 'development' ? error : undefined,
	});
};
