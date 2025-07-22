import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { createClient } from "./lib/supabase/server";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        // We'll fetch the role in the session callback to avoid circular dependency
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;

        // Fetch role from database
        try {
          const supabase = await createClient();
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", token.id)
            .single();

          session.user.role = profile?.role || null;
        } catch (error) {
          console.error("Error fetching user role in session:", error);
          session.user.role = null;
        }
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (!user?.id) return;

      try {
        const supabase = await createClient();
        await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email || null,
          name: user.name || null,
          role: "student", // Default role for new users
        });
      } catch (error) {
        console.error("Error creating/updating profile:", error);
      }
    },
  },
});
