export type AnimationStates = 'idle' | 'walk' | 'run' | 'jump' | 'dance'

export type TextMessage = {
  userId: string
  message: string
  displayName: string
}
export type InfoMessage = {
  info: 'user connected' | 'user disconnected'
  userId: string
  displayName: string
}
export type AnimationStateChangedMessage = {
  newState: AnimationStates
  userId: string
}
export type Message = { id: string } & (
  | { type: 'text'; data: TextMessage }
  | { type: 'info'; data: InfoMessage }
  | { type: 'animationStateChanged'; data: AnimationStateChangedMessage }
)

export type ClientOnJoinOptions = {
  displayName: string
}
