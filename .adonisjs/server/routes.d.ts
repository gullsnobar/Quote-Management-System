import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'account.profile.show': { paramsTuple?: []; params?: {} }
    'account.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'account.quotes.index': { paramsTuple?: []; params?: {} }
    'account.quotes.store': { paramsTuple?: []; params?: {} }
    'account.quotes.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'account.quotes.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'account.quotes.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'account.quotes.submit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'account.quotes.corridors': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'account.quotes.attach_corridors': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'account.quotes.detach_corridors': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'account.quotes.update_negotiated_fee': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'corridorId': ParamValue} }
    'account.quotes.audit_trail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'account.corridors.index': { paramsTuple?: []; params?: {} }
    'account.corridors.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'account.profile.show': { paramsTuple?: []; params?: {} }
    'account.quotes.index': { paramsTuple?: []; params?: {} }
    'account.quotes.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'account.quotes.corridors': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'account.quotes.audit_trail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'account.corridors.index': { paramsTuple?: []; params?: {} }
    'account.corridors.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'account.profile.show': { paramsTuple?: []; params?: {} }
    'account.quotes.index': { paramsTuple?: []; params?: {} }
    'account.quotes.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'account.quotes.corridors': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'account.quotes.audit_trail': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'account.corridors.index': { paramsTuple?: []; params?: {} }
    'account.corridors.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'account.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'account.quotes.store': { paramsTuple?: []; params?: {} }
    'account.quotes.submit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'account.quotes.attach_corridors': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'account.quotes.detach_corridors': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'account.quotes.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'account.quotes.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'account.quotes.update_negotiated_fee': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'corridorId': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}