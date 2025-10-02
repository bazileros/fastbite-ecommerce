"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Save,
  User,
} from 'lucide-react';
import {
  useEffect,
  useId,
  useState,
} from 'react';
import {
  useMutation,
  useQuery,
} from 'convex/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/convex/_generated/api';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
	// Get user data from Convex
	const user = useQuery(api.queries.getCurrentUser);
	// Mutation to update user profile
	const updateUserProfile = useMutation(api.mutations.updateUserProfile);
	const { toast } = useToast();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [avatarUrl, setAvatarUrl] = useState("");

	// HEAVY DEBUG LOGGING
	console.log("🔍 PROFILE PAGE DEBUG:");
	console.log("  - user query result:", user);
	console.log("  - user type:", typeof user);
	console.log("  - user is undefined?", user === undefined);
	console.log("  - user is null?", user === null);
	console.log("  - user exists?", !!user);
	if (user) {
		console.log("  - user data:", {
			id: user._id,
			name: user.name,
			email: user.email,
			avatar: user.avatar,
			subject: user.subject,
			role: user.role,
		});
	}

	const nameId = useId();
	const emailId = useId();
	const phoneId = useId();

	// Load user data from Convex
	useEffect(() => {
		console.log("🔄 Profile useEffect triggered");
		console.log("  - user in effect:", user);

		if (user) {
			console.log("📝 Loading user data into form");
			console.log("  - user.name:", user.name);
			console.log("  - user.email:", user.email);
			console.log("  - user.phone:", user.phone);
			console.log("  - user.avatar:", user.avatar);

			// Pre-populate form with Convex user data
			setName(user.name || "");
			setEmail(user.email || "");
			setPhone(user.phone || "");
			setAvatarUrl(user.avatar || "");

			console.log("✅ Form populated with:", {
				name: user.name,
				email: user.email,
				phone: user.phone,
				avatar: user.avatar,
			});
		} else {
			console.log("❌ No user data to load");
		}
	}, [user]);

	const handleSave = async () => {
		console.log("💾 handleSave called");
		console.log("  - name to save:", name);
		console.log("  - user exists:", !!user);

		try {
			console.log("📡 Calling updateUserProfile mutation...");
			const result = await updateUserProfile({
				name,
			});
			console.log("✅ updateUserProfile success:", result);

			toast({
				title: "Profile Updated",
				description: "Your profile has been successfully updated.",
			});
		} catch (error) {
			console.error("❌ updateUserProfile failed:", error);
			const err = error as Error;
			console.error("  - Error details:", {
				message: err.message,
				stack: err.stack,
				name: err.name,
			});

			toast({
				title: "Update Failed",
				description: "Failed to update your profile. Please try again.",
				variant: "destructive",
			});
		}
	};

	// Show loading state while user data is being fetched
	if (user === undefined) {
		console.log("⏳ Showing loading state - user is undefined");
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="text-center">
					<div className="mx-auto mb-4 border-primary border-b-2 rounded-full w-8 h-8 animate-spin"></div>
					<p className="text-muted-foreground">Loading your profile...</p>
				</div>
			</div>
		);
	}

	console.log("✅ User data loaded, rendering profile form");
	console.log("  - Final user check:", !!user);

	return (
		<div className="bg-background min-h-screen">
			<div className="mx-auto px-4 py-8 max-w-2xl">
				<div className="mb-8">
					<h1 className="mb-2 font-bold text-3xl">Profile Settings</h1>
					<p className="text-muted-foreground">
						Manage your account information and preferences
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="w-5 h-5" />
							Personal Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Avatar Section */}
						<div className="flex items-center gap-6">
							<Avatar className="w-20 h-20">
								<AvatarImage src={avatarUrl} alt={name} />
								<AvatarFallback className="text-lg">
									{name
										.split(" ")
										.map((n) => n[0])
										.join("")
										.toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="space-y-2">
								<p className="text-muted-foreground text-sm">
									Profile picture managed through Clerk authentication.
								</p>
								<p className="text-muted-foreground text-sm">
									Visit your <a href="https://clerk.com/user-profile" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Clerk profile</a> to update your avatar.
								</p>
							</div>
						</div>

						{/* Form Fields */}
						<div className="gap-4 grid md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor={nameId}>Full Name</Label>
								<Input
									id={nameId}
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Enter your full name"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor={emailId}>Email</Label>
								<Input
									id={emailId}
									type="email"
									value={email}
									readOnly
									className="bg-muted"
								/>
								<p className="text-muted-foreground text-xs">
									Email changes require verification. Contact support to update.
								</p>
							</div>
							<div className="space-y-2">
								<Label htmlFor={phoneId}>Phone Number</Label>
								<Input
									id={phoneId}
									value={phone}
									readOnly
									className="bg-muted"
								/>
								<p className="text-muted-foreground text-xs">
									Phone changes require verification. Contact support to update.
								</p>
							</div>
						</div>

						{/* Save Button */}
						<div className="flex justify-end pt-4">
							<Button onClick={handleSave} className="flex items-center gap-2">
								<Save className="w-4 h-4" />
								Save Changes
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
