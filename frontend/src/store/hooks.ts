import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './index'

/**
 * Typed wrappers around the raw `useDispatch` and `useSelector` hooks.
 *
 * Use these everywhere in the app instead of the bare React-Redux hooks
 * so you always get proper type inference for state and actions.
 */
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
