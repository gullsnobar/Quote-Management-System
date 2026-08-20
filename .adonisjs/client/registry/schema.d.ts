/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'auth.new_account.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.access_tokens.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'account.profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
    }
  }
  'account.access_tokens.destroy': {
    methods: ["POST"]
    pattern: '/api/v1/account/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['destroy']>>>
    }
  }
  'account.quotes.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/quotes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/quote').listQuotesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'account.quotes.store': {
    methods: ["POST"]
    pattern: '/api/v1/account/quotes'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/quote').createQuoteValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/quote').createQuoteValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'account.quotes.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/quotes/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['show']>>>
    }
  }
  'account.quotes.update': {
    methods: ["PUT"]
    pattern: '/api/v1/account/quotes/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/quote').updateQuoteValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/quote').updateQuoteValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'account.quotes.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/account/quotes/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['destroy']>>>
    }
  }
  'account.quotes.submit': {
    methods: ["POST"]
    pattern: '/api/v1/account/quotes/:id/submit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['submit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['submit']>>>
    }
  }
  'account.quotes.corridors': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/quotes/:id/corridors'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['corridors']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['corridors']>>>
    }
  }
  'account.quotes.attach_corridors': {
    methods: ["POST"]
    pattern: '/api/v1/account/quotes/:id/corridors/attach'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/quote').attachCorridorsValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/quote').attachCorridorsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['attachCorridors']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['attachCorridors']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'account.quotes.detach_corridors': {
    methods: ["POST"]
    pattern: '/api/v1/account/quotes/:id/corridors/detach'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/quote').attachCorridorsValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/quote').attachCorridorsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['detachCorridors']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['detachCorridors']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'account.quotes.update_negotiated_fee': {
    methods: ["PATCH"]
    pattern: '/api/v1/account/quotes/:id/corridors/:corridorId'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/quote').updateNegotiatedFeeValidator)>>
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; corridorId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/quote').updateNegotiatedFeeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['updateNegotiatedFee']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['updateNegotiatedFee']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'account.quotes.audit_trail': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/quotes/:id/audit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['auditTrail']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quotes_controller').default['auditTrail']>>>
    }
  }
  'account.corridors.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/corridors'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/quote').listCorridorsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/corridors_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/corridors_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'account.corridors.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/corridors/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/corridors_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/corridors_controller').default['show']>>>
    }
  }
}
