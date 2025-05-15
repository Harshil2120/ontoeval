import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},

      async authorize(credentials) {
        const { email, password } = credentials;

        try {
          await connectMongoDB();
          const user = await User.findOne({ email });

          if (!user) {
            throw new Error("User not found");
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (!passwordsMatch) {
            throw new Error("Invalid credentials");
          }

          // Return only necessary user data for the session
          return { id: user._id, email: user.email, name: user.name };
        } catch (error) {
          console.error("Authorize Error: ", error);
          throw new Error("Failed to authorize");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 5, // 5 minutes session lifetime
    updateAge: 60 * 2, // Update the token every 2 minutes
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 60 * 5, // Match session maxAge
  },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Attach user data to the JWT token on login
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }

      return token;
    },
    async session({ session, token }) {
      // Add JWT token data to the session object
      session.user = {
        id: token.id,
        email: token.email,
      };

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
