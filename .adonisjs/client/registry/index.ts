/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'auth.new_account.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/signup',
    tokens: [{"old":"/api/v1/auth/signup","type":0,"val":"api","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['auth.new_account.store']['types'],
  },
  'auth.access_tokens.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.access_tokens.store']['types'],
  },
  'account.profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/profile',
    tokens: [{"old":"/api/v1/account/profile","type":0,"val":"api","end":""},{"old":"/api/v1/account/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/account/profile","type":0,"val":"account","end":""},{"old":"/api/v1/account/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['account.profile.show']['types'],
  },
  'account.access_tokens.destroy': {
    methods: ["POST"],
    pattern: '/api/v1/account/logout',
    tokens: [{"old":"/api/v1/account/logout","type":0,"val":"api","end":""},{"old":"/api/v1/account/logout","type":0,"val":"v1","end":""},{"old":"/api/v1/account/logout","type":0,"val":"account","end":""},{"old":"/api/v1/account/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['account.access_tokens.destroy']['types'],
  },
  'account.quotes.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/quotes',
    tokens: [{"old":"/api/v1/account/quotes","type":0,"val":"api","end":""},{"old":"/api/v1/account/quotes","type":0,"val":"v1","end":""},{"old":"/api/v1/account/quotes","type":0,"val":"account","end":""},{"old":"/api/v1/account/quotes","type":0,"val":"quotes","end":""}],
    types: placeholder as Registry['account.quotes.index']['types'],
  },
  'account.quotes.store': {
    methods: ["POST"],
    pattern: '/api/v1/account/quotes',
    tokens: [{"old":"/api/v1/account/quotes","type":0,"val":"api","end":""},{"old":"/api/v1/account/quotes","type":0,"val":"v1","end":""},{"old":"/api/v1/account/quotes","type":0,"val":"account","end":""},{"old":"/api/v1/account/quotes","type":0,"val":"quotes","end":""}],
    types: placeholder as Registry['account.quotes.store']['types'],
  },
  'account.quotes.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/quotes/:id',
    tokens: [{"old":"/api/v1/account/quotes/:id","type":0,"val":"api","end":""},{"old":"/api/v1/account/quotes/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/account/quotes/:id","type":0,"val":"account","end":""},{"old":"/api/v1/account/quotes/:id","type":0,"val":"quotes","end":""},{"old":"/api/v1/account/quotes/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['account.quotes.show']['types'],
  },
  'account.quotes.update': {
    methods: ["PUT"],
    pattern: '/api/v1/account/quotes/:id',
    tokens: [{"old":"/api/v1/account/quotes/:id","type":0,"val":"api","end":""},{"old":"/api/v1/account/quotes/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/account/quotes/:id","type":0,"val":"account","end":""},{"old":"/api/v1/account/quotes/:id","type":0,"val":"quotes","end":""},{"old":"/api/v1/account/quotes/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['account.quotes.update']['types'],
  },
  'account.quotes.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/account/quotes/:id',
    tokens: [{"old":"/api/v1/account/quotes/:id","type":0,"val":"api","end":""},{"old":"/api/v1/account/quotes/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/account/quotes/:id","type":0,"val":"account","end":""},{"old":"/api/v1/account/quotes/:id","type":0,"val":"quotes","end":""},{"old":"/api/v1/account/quotes/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['account.quotes.destroy']['types'],
  },
  'account.quotes.submit': {
    methods: ["POST"],
    pattern: '/api/v1/account/quotes/:id/submit',
    tokens: [{"old":"/api/v1/account/quotes/:id/submit","type":0,"val":"api","end":""},{"old":"/api/v1/account/quotes/:id/submit","type":0,"val":"v1","end":""},{"old":"/api/v1/account/quotes/:id/submit","type":0,"val":"account","end":""},{"old":"/api/v1/account/quotes/:id/submit","type":0,"val":"quotes","end":""},{"old":"/api/v1/account/quotes/:id/submit","type":1,"val":"id","end":""},{"old":"/api/v1/account/quotes/:id/submit","type":0,"val":"submit","end":""}],
    types: placeholder as Registry['account.quotes.submit']['types'],
  },
  'account.corridors.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/corridors',
    tokens: [{"old":"/api/v1/account/corridors","type":0,"val":"api","end":""},{"old":"/api/v1/account/corridors","type":0,"val":"v1","end":""},{"old":"/api/v1/account/corridors","type":0,"val":"account","end":""},{"old":"/api/v1/account/corridors","type":0,"val":"corridors","end":""}],
    types: placeholder as Registry['account.corridors.index']['types'],
  },
  'account.corridors.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/corridors/:id',
    tokens: [{"old":"/api/v1/account/corridors/:id","type":0,"val":"api","end":""},{"old":"/api/v1/account/corridors/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/account/corridors/:id","type":0,"val":"account","end":""},{"old":"/api/v1/account/corridors/:id","type":0,"val":"corridors","end":""},{"old":"/api/v1/account/corridors/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['account.corridors.show']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
