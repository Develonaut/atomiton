import { initTRPC } from '@trpc/server'
import { v } from '@atomiton/validation'
import superjson from 'superjson'

const t = initTRPC.create({
  transformer: superjson,
})

export const router = t.router
export const procedure = t.procedure
export const middleware = t.middleware

const testSchema = v.object({
  id: v.string(),
  message: v.string(),
})

export type TestSchema = typeof testSchema._type

export const createContext = async () => ({
  timestamp: Date.now(),
})

export type Context = Awaited<ReturnType<typeof createContext>>