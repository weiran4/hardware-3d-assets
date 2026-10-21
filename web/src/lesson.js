export function createInitialState() {
  return { stage: 'idle', selected: 'overview', feedback: 'start', pulseCount: 0 };
}
export function transition(state, action) {
  if (action.type === 'reset') return createInitialState();
  if (action.type === 'inspect' && ['scope', 'controller', 'cable', 'overview'].includes(action.target)) return {...state, selected: action.target};
  if (action.type === 'pulse') return state.stage === 'connected' ? {...state, pulseCount: state.pulseCount + 1, feedback: 'pulse'} : state;
  if (action.type !== 'port' || !['out', 'ch1', 'trig'].includes(action.port)) return state;
  const selected = action.port;
  if (state.stage === 'connected') return {...state, selected, feedback: action.port === 'trig' ? 'trig-info' : 'connected'};
  if (action.port === 'trig') return {...state, selected, feedback: 'wrong-port'};
  if (action.port === 'out') return {...state, selected, stage: 'source', feedback: 'choose-input'};
  if (state.stage !== 'source') return {...state, selected, feedback: 'choose-output'};
  return {...state, selected, stage: 'connected', feedback: 'connected'};
}
