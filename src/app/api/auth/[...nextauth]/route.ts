// import NextAuth from "next-auth"
// import { authOptions } from "@/lib/auth/auth"

// console.log(authOptions)
// const {handler,auth} = NextAuth(authOptions)
// console.log(handler)
// export { handler as GET, handler as POST }

import { handlers } from "@/lib/auth/auth"; // Referring to the auth.ts we just created
export const { GET, POST } = handlers;
