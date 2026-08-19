/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessTokens: {
      store: typeof routes['auth.access_tokens.store']
    }
  }
  account: {
    profile: {
      show: typeof routes['account.profile.show']
    }
    accessTokens: {
      destroy: typeof routes['account.access_tokens.destroy']
    }
    quotes: {
      index: typeof routes['account.quotes.index']
      store: typeof routes['account.quotes.store']
      show: typeof routes['account.quotes.show']
      update: typeof routes['account.quotes.update']
      destroy: typeof routes['account.quotes.destroy']
      submit: typeof routes['account.quotes.submit']
      corridors: typeof routes['account.quotes.corridors']
      attachCorridors: typeof routes['account.quotes.attach_corridors']
      detachCorridors: typeof routes['account.quotes.detach_corridors']
      auditTrail: typeof routes['account.quotes.audit_trail']
    }
    corridors: {
      index: typeof routes['account.corridors.index']
      show: typeof routes['account.corridors.show']
    }
  }
}
