import {
  type NextRequest,
  NextResponse,
} from 'next/server';

import { sendEmail } from '@/app/actions/email';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const result = await sendEmail(body);
		return NextResponse.json(result);
	} catch (error) {
		console.error("Email API error:", error);
		return NextResponse.json(
			{ error: "Failed to send email" },
			{ status: 500 },
		);
	}
}
